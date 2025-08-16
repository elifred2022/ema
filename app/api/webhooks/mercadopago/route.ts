import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createMercadoPagoClient } from "@/lib/mercadopago";

// Crear el cliente de forma defensiva para evitar errores durante el build
let client: ReturnType<typeof createMercadoPagoClient> | null = null;
try {
  client = createMercadoPagoClient();
} catch {
  // Durante el build, el cliente puede no estar disponible
  console.log("Cliente de MercadoPago no disponible durante el build");
}

// WEBHOOK COMPLETO PARA MERCADO PAGO
export async function POST(req: Request) {
  try {
    console.log("=== WEBHOOK MERCADOPAGO RECIBIDO ===");
    
    // Respuesta inmediata para evitar timeout
    const response = NextResponse.json({ 
      message: "Webhook recibido, procesando...",
      status: "processing"
    });

    // Procesar el webhook de forma asíncrona
    processWebhookAsync(req).catch(error => {
      console.error("❌ Error en procesamiento asíncrono:", error);
    });

    return response;

  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      status: "error"
    }, { status: 500 });
  }
}

// Función asíncrona para procesar el webhook
async function processWebhookAsync(req: Request) {
  try {
    const body = await req.json();
    console.log("📋 Cuerpo del webhook recibido:", JSON.stringify(body, null, 2));

    // Verificar que sea una notificación de pago
    if (body.type === "payment" && body.action && body.action.startsWith("payment.")) {
      const paymentId = body.data.id;
      const action = body.action;
      const liveMode = body.live_mode;
      
      console.log("🆔 Payment ID:", paymentId);
      console.log("🎯 Action:", action);
      console.log("🌍 Live Mode:", liveMode);

      // Verificar que el cliente esté disponible
      if (!client) {
        console.error("❌ Cliente de MercadoPago no disponible");
        return;
      }
      console.log("✅ Cliente de MercadoPago disponible");

      // Consultar los detalles del pago a la API de Mercado Pago
      console.log("🔍 Consultando detalles del pago en MercadoPago...");
      const paymentInstance = new Payment(client);
      const paymentDetails = await paymentInstance.get({ id: paymentId });
      console.log("📋 Detalles del pago:", JSON.stringify(paymentDetails, null, 2));

      // Obtener la referencia externa (el ID de tu orden de Supabase)
      const orderId = paymentDetails.external_reference;
      console.log("🏷️ Order ID (external_reference):", orderId);
      
      // Si no hay ID de orden, no podemos continuar
      if (!orderId) {
        console.error("❌ ID de orden no encontrado en el pago.");
        return;
      }

      // Conectar con Supabase del lado del servidor
      console.log("🔌 Conectando a Supabase...");
      const supabase = await createClient();
      console.log("✅ Conexión a Supabase establecida");

      // Actualizar el estado de la orden según el estado del pago
      let newStatus = "";
      switch (paymentDetails.status) {
        case "approved":
          newStatus = "pagado";
          console.log("✅ Pago aprobado - cambiando estado a 'pagado'");
          break;
        case "rejected":
          newStatus = "pendiente"; // Mantener pendiente si es rechazado
          console.log("⚠️ Pago rechazado - manteniendo estado 'pendiente'");
          break;
        case "pending":
          newStatus = "pendiente";
          console.log("⏳ Pago pendiente - manteniendo estado 'pendiente'");
          break;
        case "cancelled":
          newStatus = "anulado";
          console.log("❌ Pago cancelado - cambiando estado a 'anulado'");
          break;
        default:
          newStatus = "pendiente"; // Por defecto mantener pendiente
          console.log("❓ Estado desconocido - manteniendo 'pendiente'");
          break;
      }
      
      // Actualizar el estado de la orden
      console.log(`🔄 Actualizando orden ${orderId} a estado: ${newStatus}`);
      const { error: updateOrderError } = await supabase
        .from("ordenes")
        .update({ estado: newStatus })
        .eq("id", orderId);

      if (updateOrderError) {
        console.error("❌ Error al actualizar la orden en Supabase:", updateOrderError);
        return;
      }
      console.log("✅ Estado de la orden actualizado exitosamente");

      // Si el pago fue aprobado, descontar el stock de los artículos
      if (paymentDetails.status === "approved") {
        console.log(`💰 Pago aprobado para orden ${orderId}. Descontando stock...`);
        
        try {
          // Obtener todos los items de la orden
          console.log("📦 Obteniendo items de la orden...");
          const { data: orderItems, error: itemsError } = await supabase
            .from("orden_items")
            .select("articulo_id, cantidad")
            .eq("orden_id", orderId);

          if (itemsError) {
            console.error("❌ Error al obtener items de la orden:", itemsError);
            return;
          } else if (orderItems && orderItems.length > 0) {
            console.log(`📋 Procesando ${orderItems.length} items para descuento de stock`);
            
            // Procesar cada item y descontar stock
            for (const item of orderItems) {
              const { articulo_id, cantidad } = item;
              console.log(`🔄 Procesando artículo ID: ${articulo_id}, Cantidad: ${cantidad}`);
              
              // Obtener el stock actual del artículo
              const { data: articulo, error: articuloError } = await supabase
                .from("articulos")
                .select("existencia, nombre_articulo")
                .eq("id", articulo_id)
                .single();

              if (articuloError) {
                console.error(`❌ Error al obtener artículo ${articulo_id}:`, articuloError);
                continue; // Continuar con el siguiente artículo
              }

              if (articulo) {
                const stockActual = Number(articulo.existencia) || 0;
                const nuevaExistencia = Math.max(0, stockActual - cantidad); // No permitir stock negativo
                
                console.log(`📊 Artículo: ${articulo.nombre_articulo}`);
                console.log(`📊 Stock actual: ${stockActual}, Cantidad vendida: ${cantidad}, Nueva existencia: ${nuevaExistencia}`);

                // Actualizar el stock del artículo
                const { error: updateStockError } = await supabase
                  .from("articulos")
                  .update({ existencia: nuevaExistencia.toString() })
                  .eq("id", articulo_id);

                if (updateStockError) {
                  console.error(`❌ Error al actualizar stock del artículo ${articulo_id}:`, updateStockError);
                } else {
                  console.log(`✅ Stock actualizado para artículo ${articulo.nombre_articulo}: ${stockActual} → ${nuevaExistencia}`);
                }
              }
            }
            
            console.log(`🎉 Proceso de descuento de stock completado para orden ${orderId}`);
          } else {
            console.log("⚠️ No se encontraron items para procesar");
          }
        } catch (stockError) {
          console.error("❌ Error durante el proceso de descuento de stock:", stockError);
        }
      }

      console.log(`🎯 Orden ${orderId} procesada completamente. Estado final: ${newStatus}`);
    } else {
      console.log("ℹ️ Notificación recibida pero no es de tipo 'payment'");
      console.log("Tipo recibido:", body.type);
      console.log("Action recibido:", body.action);
    }

  } catch (error) {
    console.error("❌ Error en procesamiento del webhook:", error);
  }
}

// Método GET para probar
export async function GET() {
  return NextResponse.json({ 
    message: "Webhook de MercadoPago funcionando",
    status: "ready",
    format: "MercadoPago webhook format"
  });
}