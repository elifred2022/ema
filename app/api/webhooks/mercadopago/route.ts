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

// 2. Definir la función POST del webhook
export async function POST(req: NextRequest) {
  try {
    console.log("=== WEBHOOK MERCADOPAGO RECIBIDO ===");
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log("Body completo:", JSON.stringify(body, null, 2));
    console.log("Tipo de notificación:", body.type);
    console.log("Data:", body.data);

    // 3. Verificar si el tipo de notificación es un pago
    if (body.type === "payment") {
      const paymentId = body.data.id;

      // 4. Consultar los detalles del pago a la API de Mercado Pago
      const paymentInstance = new Payment(client);
      const paymentDetails = await paymentInstance.get({ id: paymentId });

      // 5. Obtener la referencia externa (el ID de tu orden de Supabase)
      const orderId = paymentDetails.external_reference;
      
      // 6. Si no hay ID de orden, no podemos continuar
      if (!orderId) {
        console.error("ID de orden no encontrado en el pago.");
        return NextResponse.json({ message: "No order ID found." }, { status: 400 });
      }

      // 7. Conectar con Supabase del lado del servidor
      // ✅ Corregido: Usar 'await' para resolver la promesa
      const supabase = await createClient();

      // 8. Actualizar el estado de la orden según el estado del pago
      let newStatus = "";
      switch (paymentDetails.status) {
        case "approved":
          newStatus = "pagado";
          break;
        case "rejected":
          newStatus = "fallido";
          break;
        case "pending":
          newStatus = "pendiente";
          break;
        default:
          newStatus = "desconocido";
          break;
      }
      
      const { error } = await supabase
        .from("ordenes")
        .update({ estado: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Error al actualizar la orden en Supabase:", error);
        return NextResponse.json({ message: "Error updating order in database." }, { status: 500 });
      }

      console.log(`Orden ${orderId} actualizada a estado: ${newStatus}`);
      return NextResponse.json({ message: "Webhook processed successfully." });
    }

    // Retornar una respuesta exitosa para otras notificaciones que no sean de tipo 'pago'
    return NextResponse.json({ message: "Notification type not payment." });

  } catch (error) {
    console.error("Error en el Webhook de Mercado Pago:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}