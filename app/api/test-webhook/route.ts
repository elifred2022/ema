import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    console.log("=== PRUEBA MANUAL DEL WEBHOOK ===");
    
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "orderId es requerido" }, { status: 400 });
    }

    console.log(`🧪 Probando webhook para orden: ${orderId}`);

    // Conectar a Supabase
    const supabase = await createClient();
    console.log("✅ Conexión a Supabase establecida");

    // 1. Cambiar estado a "pagado"
    console.log(`🔄 Cambiando estado de orden ${orderId} a 'pagado'`);
    const { error: updateOrderError } = await supabase
      .from("ordenes")
      .update({ estado: "pagado" })
      .eq("id", orderId);

    if (updateOrderError) {
      console.error("❌ Error al actualizar la orden:", updateOrderError);
      return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 });
    }
    console.log("✅ Estado de la orden actualizado a 'pagado'");

    // 2. Descontar stock
    console.log(`💰 Descontando stock para orden ${orderId}`);
    
    // Obtener items de la orden
    const { data: orderItems, error: itemsError } = await supabase
      .from("orden_items")
      .select("articulo_id, cantidad")
      .eq("orden_id", orderId);

    if (itemsError) {
      console.error("❌ Error al obtener items:", itemsError);
      return NextResponse.json({ error: "Error al obtener items" }, { status: 500 });
    }

    if (!orderItems || orderItems.length === 0) {
      console.log("⚠️ No se encontraron items para procesar");
      return NextResponse.json({ message: "No hay items para procesar" });
    }

    console.log(`📋 Procesando ${orderItems.length} items para descuento de stock`);

    // Procesar cada item
    for (const item of orderItems) {
      const { articulo_id, cantidad } = item;
      console.log(`🔄 Procesando artículo ID: ${articulo_id}, Cantidad: ${cantidad}`);

      // Obtener stock actual
      const { data: articulo, error: articuloError } = await supabase
        .from("articulos")
        .select("existencia, nombre_articulo")
        .eq("id", articulo_id)
        .single();

      if (articuloError) {
        console.error(`❌ Error al obtener artículo ${articulo_id}:`, articuloError);
        continue;
      }

      if (articulo) {
        const stockActual = Number(articulo.existencia) || 0;
        const nuevaExistencia = Math.max(0, stockActual - cantidad);

        console.log(`📊 ${articulo.nombre_articulo}: Stock ${stockActual} → ${nuevaExistencia}`);

        // Actualizar stock
        const { error: updateStockError } = await supabase
          .from("articulos")
          .update({ existencia: nuevaExistencia.toString() })
          .eq("id", articulo_id);

        if (updateStockError) {
          console.error(`❌ Error al actualizar stock:`, updateStockError);
        } else {
          console.log(`✅ Stock actualizado: ${stockActual} → ${nuevaExistencia}`);
        }
      }
    }

    console.log(`🎉 Prueba completada para orden ${orderId}`);
    
    return NextResponse.json({ 
      message: "Prueba completada exitosamente",
      orderId,
      itemsProcessed: orderItems.length
    });

  } catch (error) {
    console.error("❌ Error en prueba del webhook:", error);
    return NextResponse.json({ 
      error: "Error interno", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}
