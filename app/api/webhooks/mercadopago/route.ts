import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// WEBHOOK ULTRA-SIMPLE - SOLO PARA DIAGNÓSTICO
export async function POST(req: NextRequest) {
  try {
    console.log("=== WEBHOOK SIMPLE RECIBIDO ===");
    
    // Solo responder inmediatamente sin procesar nada
    return NextResponse.json({ 
      message: "Webhook recibido correctamente",
      timestamp: new Date().toISOString(),
      status: "success"
    });

  } catch (error) {
    console.error("❌ Error en webhook simple:", error);
    return NextResponse.json({ 
      error: "Error interno", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}

// Método GET para probar
export async function GET() {
  return NextResponse.json({ 
    message: "Webhook simple funcionando",
    status: "ready"
  });
}