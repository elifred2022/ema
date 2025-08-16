import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "✅ API route funcionando correctamente en Vercel",
    timestamp: new Date().toISOString(),
    status: "success"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ 
      message: "✅ POST funcionando correctamente",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Error en POST",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}
