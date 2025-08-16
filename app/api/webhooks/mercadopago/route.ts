import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import type { NextRequest } from "next/server";
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

// Método GET para probar el webhook
export async function GET(req: NextRequest) {
  try {
    console.log("=== PRUEBA DEL WEBHOOK MERCADOPAGO ===");
    
    // Verificar que el cliente esté disponible
    if (!client) {
      console.error("❌ Cliente de MercadoPago no disponible");
      return NextResponse.json({ 
        error: "Cliente de MercadoPago no disponible",
        message: "Verifica las variables de entorno MP_ACCESS_TOKEN"
      }, { status: 500 });
    }
    
    console.log("✅ Cliente de MercadoPago disponible");
    
    // Conectar a Supabase
    const supabase = await createClient();
    console.log("✅ Conexión a Supabase establecida");
    
    // Obtener una orden de prueba
    const { data: ordenes, error: ordenesError } = await supabase
      .from("ordenes")
      .select("id, estado, total")
      .eq("estado", "pendiente")
      .limit(1);
    
    if (ordenesError) {
      console.error("❌ Error al obtener órdenes:", ordenesError);
      return NextResponse.json({ 
        error: "Error al obtener órdenes",
        details: ordenesError
      }, { status: 500 });
    }
    
    if (!ordenes || ordenes.length === 0) {
      return NextResponse.json({ 
        message: "No hay órdenes pendientes para probar",
        status: "info"
      });
    }
    
    const orden = ordenes[0];
    console.log("📋 Orden de prueba encontrada:", orden);
    
    return NextResponse.json({ 
      message: "Webhook funcionando correctamente",
      test_data: {
        cliente_mercadopago: "✅ Disponible",
        supabase: "✅ Conectado",
        ordenes_pendientes: ordenes.length,
        orden_ejemplo: orden
      }
    });
    
  } catch (error) {
    console.error("❌ Error en prueba del webhook:", error);
    return NextResponse.json({ 
      error: "Error interno en prueba del webhook",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

// 2. Definir la función POST del webhook
export async function POST(req: NextRequest) {
  try {
    console.log("=== WEBHOOK MERCADOPAGO RECIBIDO ===");
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("URL:", req.url);
    console.log("Method:", req.method);
    
    const body = await req.json();
    console.log("Body completo:", JSON.stringify(body, null, 2));
    console.log("Tipo de notificación:", body.type);
    console.log("Data:", body.data);

    // 3. Verificar si el tipo de notificación es un pago
    if (body.type === "payment") {
      const paymentId = body.data.id;
      console.log("🆔 Payment ID recibido:", paymentId);

      // 4. Verificar que el cliente esté disponible
      if (!client) {
        console.error("❌ Cliente de MercadoPago no disponible");
        return NextResponse.json({ message: "MercadoPago client not available." }, { status: 500 });
      }
      console.log("✅ Cliente de MercadoPago disponible");

      // 5. Consultar los detalles del pago a la API de Mercado Pago
      console.log("🔍 Consultando detalles del pago en MercadoPago...");
      const paymentInstance = new Payment(client);
      const paymentDetails = await paymentInstance.get({ id: paymentId });
      console.log("📋 Detalles del pago:", JSON.stringify(paymentDetails, null, 2));

      // 6. Obtener la referencia externa (el ID de tu orden de Supabase)
      const orderId = paymentDetails.external_reference;
      console.log("🏷️ Order ID (external_reference):", orderId);
      
      // 7. Si no hay ID de orden, no podemos continuar
      if (!orderId) {
        console.error("❌ ID de orden no encontrado en el pago.");
        return NextResponse.json({ message: "No order ID found." }, { status: 400 });
      }

      // 8. Conectar con Supabase del lado del servidor
      console.log("🔌 Conectando a Supabase...");
      const supabase = await createClient();
      console.log("✅ Conexión a Supabase establecida");

      // 9. Actualizar el estado de la orden según el estado del pago
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
      
      // 10. Actualizar el estado de la orden
      console.log(`🔄 Actualizando orden ${orderId} a estado: ${newStatus}`);
      const { error: updateOrderError } = await supabase
        .from("ordenes")
        .update({ estado: newStatus })
        .eq("id", orderId);

      if (updateOrderError) {
        console.error("❌ Error al actualizar la orden en Supabase:", updateOrderError);
        return NextResponse.json({ message: "Error updating order in database." }, { status: 500 });
      }
      console.log("✅ Estado de la orden actualizado exitosamente");

      // 11. Si el pago fue aprobado, descontar el stock de los artículos
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
            // No retornamos error aquí, solo logueamos para no interrumpir el proceso
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
          // No retornamos error aquí, solo logueamos para no interrumpir el proceso
        }
      }

      console.log(`🎯 Orden ${orderId} procesada completamente. Estado final: ${newStatus}`);
      return NextResponse.json({ message: "Webhook processed successfully." });
    }

    // Retornar una respuesta exitosa para otras notificaciones que no sean de tipo 'pago'
    console.log("ℹ️ Notificación recibida pero no es de tipo 'payment'");
    return NextResponse.json({ message: "Notification type not payment." });

  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}