import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Definir tipos para las estructuras de datos
interface OrderItem {
  id: number;
  nombre_articulo: string;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

interface Order {
  id: number;
  total: number;
  orden_items: OrderItem[];
  // Si usas usuario_id, también agrégalo aquí
  // usuario_id: string;
}

// Configurar el Access Token de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { ordenId } = await req.json();

    if (!ordenId) {
      return NextResponse.json({ error: "No se proporcionó un ID de orden." }, { status: 400 });
    }
    
    // Aquí deberías obtener la orden de tu base de datos (Supabase)
    // Usando una función de tu lógica de negocio
    // Por ahora, usamos un mock de ejemplo
    const orden: Order = {
      id: ordenId,
      total: 100,
      orden_items: [
        { id: 1, nombre_articulo: "Producto A", cantidad: 2, precio_unit: 50, subtotal: 100 },
      ],
    };

    const res = await new Preference(client).create({
      body: {
        items: orden.orden_items.map((i) => ({
          id: i.id.toString(), // Agregamos el id como un string, ya que lo espera la librería
          title: i.nombre_articulo,
          quantity: i.cantidad,
          unit_price: i.precio_unit,
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
        },
        auto_return: "approved",
        external_reference: orden.id.toString(),
      },
    });

    return NextResponse.json({ id: res.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}