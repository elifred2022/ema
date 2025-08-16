import { NextResponse } from "next/server";

// WEBHOOK SEGÚN DOCUMENTACIÓN OFICIAL DE MERCADO PAGO
export async function POST(req: Request) {
  try {
    console.log("=== WEBHOOK MERCADO PAGO RECIBIDO ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    
    // Leer el body del webhook
    const bodyText = await req.text();
    console.log("📝 Body recibido:", bodyText);
    
    // Parsear JSON según formato oficial de Mercado Pago
    let webhookData;
    try {
      webhookData = JSON.parse(bodyText);
      console.log("🔍 Webhook parseado:", JSON.stringify(webhookData, null, 2));
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError);
      return NextResponse.json({ 
        error: "Formato de webhook inválido"
      }, { status: 400 });
    }

    // Validar estructura según documentación oficial
    if (!webhookData.type || webhookData.type !== "payment") {
      console.log("⚠️ Webhook no es de tipo payment:", webhookData.type);
      return NextResponse.json({ 
        message: "Webhook recibido pero no es de tipo payment",
        type: webhookData.type
      });
    }

    if (!webhookData.data || !webhookData.data.id) {
      console.log("❌ Webhook no contiene ID de pago válido");
      return NextResponse.json({ 
        error: "Webhook no contiene ID de pago válido"
      }, { status: 400 });
    }

    // Extraer información del webhook
    const paymentId = webhookData.data.id;
    const action = webhookData.action;
    const liveMode = webhookData.live_mode;
    const userId = webhookData.user_id;
    const dateCreated = webhookData.date_created;

    console.log("💰 Información del webhook:", {
      paymentId,
      action,
      liveMode,
      userId,
      dateCreated
    });

    // Por ahora solo logueamos y respondemos OK
    // Aquí puedes agregar la lógica de tu negocio
    console.log("✅ Webhook procesado correctamente");
    
    return NextResponse.json({ 
      message: "Webhook recibido y procesado correctamente",
      status: "success",
      paymentId,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Método GET para probar conectividad
export async function GET() {
  return NextResponse.json({ 
    message: "Webhook de Mercado Pago funcionando",
    status: "ready",
    timestamp: new Date().toISOString()
  });
}