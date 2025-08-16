import { NextResponse } from "next/server";

// WEBHOOK SOLO PARA LOGGING - SIN PROCESAMIENTO
export async function POST(req: Request) {
  try {
    console.log("=== WEBHOOK RECIBIDO - SOLO LOGGING ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("🌐 URL:", req.url);
    console.log("📋 Headers:", Object.fromEntries(req.headers.entries()));
    
    // Obtener el cuerpo de la petición
    const bodyText = await req.text();
    console.log("📝 Body (texto):", bodyText);
    
    // Intentar parsear como JSON
    try {
      const bodyJson = JSON.parse(bodyText);
      console.log("🔍 Body (JSON parseado):", JSON.stringify(bodyJson, null, 2));
    } catch (parseError) {
      console.log("❌ Error al parsear JSON:", parseError);
    }
    
    // Responder inmediatamente
    return NextResponse.json({ 
      message: "Webhook recibido - solo logging",
      status: "success",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en webhook de logging:", error);
    return NextResponse.json({ 
      error: "Error interno",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

// Método GET para probar
export async function GET() {
  return NextResponse.json({ 
    message: "Webhook de logging funcionando",
    status: "ready"
  });
}