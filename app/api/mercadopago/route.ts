import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar el Access Token
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { items, payerEmail } = await req.json();

    // Verificamos que la variable de entorno esté definida para evitar errores.
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) {
      console.error("La variable de entorno NEXT_PUBLIC_URL no está definida.");
      return NextResponse.json(
        { error: "Error de configuración: NEXT_PUBLIC_URL no está definida." },
        { status: 500 }
      );
    }
    
    // Log de depuración: confirma que el access token existe
    console.log("Access Token cargado:", process.env.MP_ACCESS_TOKEN ? "Sí" : "No");

    const preference = new Preference(client);

    // Se elimina 'auto_return' temporalmente para depurar el error
    const body = {
      items: items.map((item: any) => ({
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
      })),
      payer: { email: payerEmail },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      // auto_return: "approved", // Se ha comentado para depurar
    };

    // Log para depurar: muestra el objeto body completo que se enviará a la API
    console.log("Objeto completo que se enviará a Mercado Pago:", JSON.stringify(body, null, 2));

    const response = await preference.create({ body });

    return NextResponse.json({ id: response.id });
  } catch (error) {
    console.error("Error creando preferencia:", error);

    return NextResponse.json(
      { error: "Error creando preferencia", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}