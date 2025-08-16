import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import type { NextRequest } from "next/server";
import { createMercadoPagoClient, buildRedirectUrl, mercadopagoConfig, validateConfig } from "@/lib/mercadopago";

// Función para crear el cliente de MercadoPago de forma segura
function createSafeClient() {
  try {
    console.log("=== DEBUG createSafeClient ===");
    console.log("mercadopagoConfig.accessToken:", mercadopagoConfig.accessToken);
    console.log("mercadopagoConfig.publicKey:", mercadopagoConfig.publicKey);
    
    const configValidation = validateConfig();
    console.log("configValidation:", configValidation);
    
    if (!configValidation.isValid) {
      console.error("Error en configuración de MercadoPago:", configValidation.errors);
      return null;
    }
    
    console.log("Creando cliente de MercadoPago...");
    const client = createMercadoPagoClient();
    console.log("Cliente creado exitosamente:", !!client);
    return client;
  } catch (error) {
    console.error("Error al crear cliente de MercadoPago:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    return null;
  }
}

// 1. Definir la función POST que recibe la solicitud del frontend
export async function POST(req: NextRequest) {
  try {
    // Verificar que el cliente esté disponible
    const client = createSafeClient();
    if (!client) {
      return NextResponse.json(
        { error: "Error de configuración de MercadoPago. Verifica las variables de entorno." },
        { status: 500 }
      );
    }

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

    // Validar que cada ítem tenga los campos requeridos
    for (const item of items) {
      if (!item.title || !item.quantity || item.unit_price === undefined) {
        return NextResponse.json(
          { error: "Cada ítem debe tener título, cantidad y precio unitario." },
          { status: 400 }
        );
      }
    }
    
         // 4. Crear el objeto de la preferencia de pago
     const preferenceBody = {
       items: items.map((item: { title: string; quantity: number; unit_price: number | string }) => ({
         // El formato de Mercado Pago requiere que el precio sea un número
         title: item.title,
         quantity: item.quantity,
         unit_price: Number(item.unit_price),
         currency_id: "ARS", // ✅ Moneda de tu país, por ejemplo, "ARS"
       })),
       // URLs a las que el usuario será redirigido después del pago
       back_urls: {
         success: buildRedirectUrl(mercadopagoConfig.redirectUrls.success),
         failure: buildRedirectUrl(mercadopagoConfig.redirectUrls.failure),
         pending: buildRedirectUrl(mercadopagoConfig.redirectUrls.pending),
       },
       // URL para que Mercado Pago nos notifique el estado del pago (Webhook)
       notification_url: buildRedirectUrl(mercadopagoConfig.webhookUrl),
       // ✅ Referencia externa que vincula el pago con tu orden en Supabase
       external_reference: metadata?.order_id?.toString() || "test-123",
     };

    // 5. Crear la preferencia de pago usando el SDK de Mercado Pago
    console.log("=== CREANDO PREFERENCIA ===");
    console.log("Cliente:", !!client);
    console.log("PreferenceBody:", JSON.stringify(preferenceBody, null, 2));
    
    const preference = new Preference(client);
    console.log("Instancia de Preference creada");
    
    console.log("Llamando a preference.create...");
    const result = await preference.create({ body: preferenceBody });
    console.log("Preferencia creada exitosamente:", result.id);
    console.log("=== FIN CREAR PREFERENCIA ===");

    // 6. Retornar el ID de la preferencia al frontend
    return NextResponse.json({ id: result.id });
  } catch (error) {
    // 7. Manejar y registrar cualquier error en la consola del servidor
    console.error("=== ERROR DETALLADO ===");
    console.error("Error al crear la preferencia de pago:", error);
    console.error("Tipo de error:", typeof error);
    console.error("Mensaje:", error instanceof Error ? error.message : "No es un Error");
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    console.error("=== FIN ERROR ===");
    
    return NextResponse.json(
      { 
        error: "Error al crear la preferencia de pago",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

// Método GET para probar que la API esté funcionando
export async function GET() {
  try {
    console.log("=== DEBUG GET /api/mercadopago ===");
    console.log("Iniciando método GET...");
    
    const client = createSafeClient();
    console.log("Cliente obtenido:", !!client);
    
    if (!client) {
      console.log("Cliente no disponible, retornando error...");
      return NextResponse.json(
        { 
          status: "error", 
          message: "Error de configuración de MercadoPago",
          details: validateConfig().errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      message: "API de MercadoPago funcionando correctamente",
      config: {
        hasAccessToken: !!mercadopagoConfig.accessToken,
        hasPublicKey: !!mercadopagoConfig.publicKey,
        baseUrl: mercadopagoConfig.baseUrl,
        currency: mercadopagoConfig.currency,
        locale: mercadopagoConfig.locale
      }
    });
  } catch (error) {
    console.error("Error en GET /api/mercadopago:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}
