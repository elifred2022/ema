"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// Definir tipos para las estructuras de datos de la orden
interface OrdenItem {
  id: number;
  nombre_articulo: string;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

interface Orden {
  id: number;
  total: number;
  estado: string;
  orden_items: OrdenItem[];
}

// Inicializar SDK React (Frontend)
// Asegúrate de que esta clave sea tu clave pública de producción cuando subas a producción
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "es-AR" });

export default function CheckoutPage() {
  const supabase = createClient();
  const params = useParams();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Obtener los detalles de la orden de Supabase
  useEffect(() => {
    const fetchOrden = async () => {
      // Si el ID no es una cadena, no hacemos la consulta
      if (typeof params.id !== 'string') {
        setError("ID de orden inválido.");
        return;
      }

      const { data, error } = await supabase
        .from("ordenes")
        .select(`id, total, estado, orden_items(*)`)
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error al obtener la orden:", error);
        setError("No se pudo cargar la orden. Por favor, inténtelo de nuevo.");
      } else {
        setOrden(data);
      }
    };

    fetchOrden();
  }, [params.id, supabase]);

  // 2. Crear la preferencia de pago en Mercado Pago
  const crearPreferencia = async () => {
    if (!orden) {
      setError("No hay datos de orden para procesar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Mapear los ítems al formato requerido por Mercado Pago
          items: orden.orden_items.map((i) => ({
            title: i.nombre_articulo,
            quantity: i.cantidad,
            unit_price: i.precio_unit,
            currency_id: "ARS" // Moneda de tu país, por ejemplo, "ARS" para Argentina
          })),
          // Incluir el ID de la orden para referenciarla en el webhook
          metadata: {
            order_id: orden.id
          }
        }),
      });

      if (!res.ok) {
        // Manejar errores de la API
        const errorData = await res.json();
        console.error("Error al crear la preferencia:", errorData);
        throw new Error("Error al crear la preferencia de pago. " + (errorData.message || ""));
      }

      const data = await res.json();
      setPreferenceId(data.id);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al iniciar el pago.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  }

  if (!orden) {
    return <p className="text-center mt-8">Cargando orden...</p>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resumen de la Orden</h1>

      <ul className="mb-6">
        {orden.orden_items.map((item) => (
          <li key={item.id} className="flex justify-between items-center border-b border-gray-200 py-3">
            <div className="flex-1">
              <span className="font-semibold text-gray-700">{item.nombre_articulo}</span>
              <span className="text-sm text-gray-500"> x {item.cantidad}</span>
            </div>
            <span className="text-lg font-bold text-gray-800">${item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <p className="text-right text-2xl font-bold text-blue-600 mb-6 border-t border-gray-300 pt-4">
        Total: ${orden.total.toFixed(2)}
      </p>

      {!preferenceId ? (
        <button
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          onClick={crearPreferencia}
          disabled={isLoading}
        >
          {isLoading ? "Creando pago..." : "Pagar con Mercado Pago"}
        </button>
      ) : (
        <Wallet initialization={{ preferenceId }} />
      )}
    </div>
  );
}