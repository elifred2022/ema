import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMercadoPagoClient } from "@/lib/mercadopago";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// WEBHOOK COMPLETO CON PROCESAMIENTO
export async function POST(req: Request) {
  try {
    console.log("=== WEBHOOK RECIBIDO - PROCESAMIENTO COMPLETO ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("🌐 URL:", req.url);
    console.log("📋 Headers:", Object.fromEntries(req.headers.entries()));
    
    const bodyText = await req.text();
    console.log("📝 Body (texto):", bodyText);
    
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
      console.log("🔍 Body (JSON parseado):", JSON.stringify(bodyJson, null, 2));
    } catch (parseError) {
      console.log("❌ Error al parsear JSON:", parseError);
      return NextResponse.json({ 
        error: "Error al parsear JSON del webhook",
        details: parseError instanceof Error ? parseError.message : "Error desconocido"
      }, { status: 400 });
    }

    // Validar que sea un webhook de pago
    if (bodyJson.type !== "payment") {
      console.log("⚠️ Webhook no es de tipo payment:", bodyJson.type);
      return NextResponse.json({ 
        message: "Webhook recibido pero no es de tipo payment",
        type: bodyJson.type
      });
    }

    // Obtener el ID del pago
    const paymentId = bodyJson.data?.id;
    if (!paymentId) {
      console.log("❌ No se encontró ID de pago en el webhook");
      return NextResponse.json({ 
        error: "No se encontró ID de pago en el webhook"
      }, { status: 400 });
    }

    console.log("💰 ID de pago:", paymentId);

    // Crear cliente de Mercado Pago
    const client = createMercadoPagoClient();
    if (!client) {
      console.log("❌ No se pudo crear cliente de Mercado Pago");
      return NextResponse.json({ 
        error: "Error de configuración de Mercado Pago"
      }, { status: 500 });
    }

    // Obtener detalles del pago desde Mercado Pago
    const { Payment } = await import("mercadopago");
    const payment = new Payment(client);
    
    console.log("🔍 Obteniendo detalles del pago desde Mercado Pago...");
    const paymentDetails = await payment.get({ id: paymentId });
    console.log("✅ Detalles del pago obtenidos:", {
      id: paymentDetails.id,
      status: paymentDetails.status,
      external_reference: paymentDetails.external_reference,
      transaction_amount: paymentDetails.transaction_amount
    });

    // Obtener el ID de la orden desde external_reference
    const orderId = paymentDetails.external_reference;
    if (!orderId) {
      console.log("❌ No se encontró external_reference en el pago");
      return NextResponse.json({ 
        error: "No se encontró referencia de orden en el pago"
      }, { status: 400 });
    }

    console.log("📦 ID de orden:", orderId);

    // Actualizar estado de la orden según el estado del pago
    let newStatus = "pendiente";
    if (paymentDetails.status === "approved") {
      newStatus = "pagado";
    } else if (paymentDetails.status === "rejected") {
      newStatus = "pendiente";
    } else if (paymentDetails.status === "pending") {
      newStatus = "pendiente";
    } else if (paymentDetails.status === "cancelled") {
      newStatus = "anulado";
    }

    console.log("🔄 Actualizando estado de orden:", {
      orderId,
      oldStatus: "pendiente",
      newStatus,
      paymentStatus: paymentDetails.status
    });

    // Actualizar estado en Supabase
    const { error: updateError } = await supabase
      .from("ordenes")
      .update({ estado: newStatus })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ Error al actualizar estado de orden:", updateError);
      return NextResponse.json({ 
        error: "Error al actualizar estado de orden en base de datos",
        details: updateError.message
      }, { status: 500 });
    }

    console.log("✅ Estado de orden actualizado exitosamente");

    // Si el pago fue aprobado, descontar stock
    if (paymentDetails.status === "approved") {
      console.log("📦 Descontando stock para pago aprobado...");
      
      // Obtener items de la orden
      const { data: orderItems, error: itemsError } = await supabase
        .from("orden_items")
        .select("articulo_id, cantidad")
        .eq("orden_id", orderId);

      if (itemsError) {
        console.error("❌ Error al obtener items de la orden:", itemsError);
        return NextResponse.json({ 
          error: "Error al obtener items de la orden",
          details: itemsError.message
        }, { status: 500 });
      }

      console.log("📋 Items de la orden:", orderItems);

      // Actualizar stock para cada item
      for (const item of orderItems || []) {
        console.log(`🔄 Actualizando stock para artículo ${item.articulo_id}, cantidad: ${item.cantidad}`);
        
        const { error: stockError } = await supabase
          .from("articulos")
          .update({ 
            existencia: supabase.rpc('decrement_stock', { 
              article_id: item.articulo_id, 
              quantity: item.cantidad 
            })
          })
          .eq("id", item.articulo_id);

        if (stockError) {
          console.error(`❌ Error al actualizar stock del artículo ${item.articulo_id}:`, stockError);
          // Continuar con otros artículos
        } else {
          console.log(`✅ Stock actualizado para artículo ${item.articulo_id}`);
        }
      }

      console.log("✅ Procesamiento de stock completado");
    }

    console.log("🎉 Webhook procesado exitosamente");
    return NextResponse.json({ 
      message: "Webhook procesado exitosamente",
      status: "success",
      orderId,
      paymentId,
      orderStatus: newStatus,
      paymentStatus: paymentDetails.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

// Método GET para probar
export async function GET() {
  try {
    console.log("=== TESTING WEBHOOK CONNECTIVITY ===");
    
    // Verificar Supabase
    const { data: testData, error: supabaseError } = await supabase
      .from("ordenes")
      .select("id, estado, total")
      .limit(1);

    if (supabaseError) {
      console.error("❌ Error de Supabase:", supabaseError);
      return NextResponse.json({ 
        message: "Webhook con error de Supabase",
        error: supabaseError.message
      }, { status: 500 });
    }

    // Verificar Mercado Pago
    const client = createMercadoPagoClient();
    const mpStatus = client ? "✅ Disponible" : "❌ No disponible";

    return NextResponse.json({ 
      message: "Webhook funcionando correctamente",
      test_data: {
        cliente_mercadopago: mpStatus,
        supabase: "✅ Conectado",
        ordenes_pendientes: testData?.length || 0,
        orden_ejemplo: testData?.[0] || null
      }
    });

  } catch (error) {
    console.error("❌ Error en GET del webhook:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}