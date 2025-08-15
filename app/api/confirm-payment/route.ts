import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

// Esto fuerza a que la ruta se ejecute en el entorno de Node.js en lugar del Edge Runtime
export const runtime = 'nodejs';

// Configurar el Access Token de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "No se proporcionó un ID de pago." },
        { status: 400 }
      );
    }

    const payment = new Payment(client);
    
    // Buscar los detalles del pago usando el ID proporcionado
    const paymentDetails = await payment.get({ id: paymentId });

    // Verificar si el pago fue aprobado
    if (paymentDetails.status === 'approved') {
      console.log(`Pago aprobado para el ID: ${paymentId}`);

      // ######################################################################
      // ##  LÓGICA PARA ACTUALIZAR EL PEDIDO EN TU BASE DE DATOS
      // ######################################################################
      
      const supabase = await createClient();

      // Utiliza el external_reference para encontrar el pedido correcto.
      const orderId = paymentDetails.external_reference;
      
      // Actualizar el estado de la orden en Supabase, sin la columna payment_id
      const { data, error } = await supabase
        .from("ordenes")
        .update({ 
          estado: "aprobado", 
        })
        .eq("id", orderId)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar la orden en Supabase:", error);
        return NextResponse.json(
          { success: false, message: "Error al actualizar la orden en la base de datos." }, 
          { status: 500 }
        );
      }
      
      if (!data) {
        return NextResponse.json(
          { success: false, message: "Orden no encontrada." }, 
          { status: 404 }
        );
      }
      
      console.log(`Pedido ${orderId} actualizado a estado 'aprobado'.`);
      
      return NextResponse.json({ success: true, message: "Pago confirmado y pedido actualizado." });

    } else {
      console.log(`Pago pendiente o rechazado para el ID: ${paymentId}`);
      // Aquí puedes manejar otros estados, como 'pending' o 'rejected'
      return NextResponse.json({ success: false, message: "El pago no fue aprobado." });
    }

  } catch (error) {
    console.error("Error al confirmar el pago:", error);

    return NextResponse.json(
      { error: "Error al confirmar el pago", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
