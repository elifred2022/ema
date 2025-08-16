import { createClient } from "@/lib/supabase/client";
import { useCarrito } from "@/app/context/CarritoContext";
import { useRouter } from "next/navigation";

export default function ConfirmarCompra() {
  const { carrito, total, limpiarCarrito } = useCarrito();
  const supabase = createClient();
  const router = useRouter();

  const handleConfirmar = async () => {
    try {
      // 1️⃣ Verificar usuario logueado
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error obteniendo usuario:", userError.message);
        alert("Error al verificar sesión");
        return;
      }

      if (!user) {
        alert("Debes iniciar sesión para comprar");
        return;
      }

      // 2️⃣ Validar stock disponible antes de crear la orden
      console.log("🔍 Validando stock disponible...");
      const stockValidation = await validateStock(carrito, supabase);
      
      if (!stockValidation.isValid) {
        alert(`❌ No hay stock suficiente para: ${stockValidation.invalidItems.join(", ")}`);
        return;
      }
      
      console.log("✅ Stock validado correctamente");

      // 3️⃣ Crear orden
      const { data: orden, error: errOrden } = await supabase
        .from("ordenes")
        .insert([
          {
            usuario_id: user.id,
            total: total,
            estado: "pendiente"
          }
        ])
        .select()
        .single();

      if (errOrden) {
        console.error("Error al crear orden:", JSON.stringify(errOrden, null, 2));
        alert(errOrden.message || "No se pudo crear la orden");
        return;
      }

      // 4️⃣ Insertar items de la orden
      const itemsData = carrito.map(item => ({
        orden_id: orden.id,
        articulo_id: item.id,               // 👈 ahora integer
        nombre_articulo: item.nombre_articulo,
        precio_unit: item.precio_venta,
        cantidad: item.cantidad,
        subtotal: item.precio_venta * item.cantidad
      }));

      const { error: errItems } = await supabase
        .from("orden_items")
        .insert(itemsData);

      if (errItems) {
        console.error("Error al guardar items:", JSON.stringify(errItems, null, 2));
        alert(errItems.message || "No se pudieron guardar los artículos");
        return;
      }

      // 5️⃣ Vaciar carrito y redirigir al checkout
      limpiarCarrito();
      router.push(`/checkout/${orden.id}`);

    } catch (e) {
      console.error("Error inesperado:", e);
      alert("Ocurrió un error inesperado. Revisa la consola.");
    }
  };

  // Función para validar stock disponible
  const validateStock = async (carritoItems: any[], supabaseClient: any) => {
    try {
      const invalidItems: string[] = [];
      
      for (const item of carritoItems) {
        // Obtener stock actual del artículo
        const { data: articulo, error } = await supabaseClient
          .from("articulos")
          .select("existencia, nombre_articulo")
          .eq("id", item.id)
          .single();

        if (error) {
          console.error(`Error al obtener stock del artículo ${item.id}:`, error);
          invalidItems.push(item.nombre_articulo);
          continue;
        }

        if (articulo) {
          const stockDisponible = Number(articulo.existencia) || 0;
          const cantidadSolicitada = item.cantidad;

          console.log(`📦 ${articulo.nombre_articulo}: Stock ${stockDisponible}, Solicitado ${cantidadSolicitada}`);

          if (stockDisponible < cantidadSolicitada) {
            invalidItems.push(`${articulo.nombre_articulo} (Stock: ${stockDisponible}, Solicitado: ${cantidadSolicitada})`);
          }
        }
      }

      return {
        isValid: invalidItems.length === 0,
        invalidItems
      };
    } catch (error) {
      console.error("Error durante validación de stock:", error);
      return {
        isValid: false,
        invalidItems: ["Error al validar stock"]
      };
    }
  };

  return (
    <button
      onClick={handleConfirmar}
      className="bg-green-600 text-white px-4 py-2 rounded mt-4"
    >
      Confirmar Compra
    </button>
  );
}
