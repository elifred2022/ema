import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import type { NextRequest } from "next/server";

// Asegúrate de que tu variable de entorno MP_ACCESS_TOKEN esté definida
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// 1. Definir la función POST que recibe la solicitud del frontend
export async function POST(req: NextRequest) {
  try {
    // 2. Obtener los datos del cuerpo de la solicitud
    // El frontend te envía 'items' (los productos) y 'metadata' (el ID de la orden)
    const { items, metadata } = await req.json();

    // 3. Validar que los datos de la orden existan
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron ítems en la orden." },
        { status: 400 }
      );
    }
    
    // 4. Crear el objeto de la preferencia de pago
    const preferenceBody = {
      items: items.map((item: any) => ({
        // El formato de Mercado Pago requiere que el precio sea un número
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: "ARS", // ✅ Moneda de tu país, por ejemplo, "ARS"
      })),
      // URLs a las que el usuario será redirigido después del pago
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
      },
      // URL para que Mercado Pago nos notifique el estado del pago (Webhook)
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      // ✅ Referencia externa que vincula el pago con tu orden en Supabase
      external_reference: metadata?.order_id?.toString(), 
      auto_return: "approved",
    };

    // 5. Crear la preferencia de pago usando el SDK de Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    // 6. Retornar el ID de la preferencia al frontend
    return NextResponse.json({ id: result.id });
  } catch (error) {
    // 7. Manejar y registrar cualquier error en la consola del servidor
    console.error("Error al crear la preferencia de pago:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    );
  }
}
