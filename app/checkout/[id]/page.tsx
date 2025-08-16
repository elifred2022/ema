"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

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

export default function CheckoutPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnulando, setIsAnulando] = useState(false);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado al iniciar el pago.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Función para anular la compra
  const anularCompra = async () => {
    if (!orden) return;

    if (!confirm("¿Estás seguro de que quieres anular esta compra? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsAnulando(true);
    try {
      // Actualizar el estado de la orden a "anulado"
      const { error: updateError } = await supabase
        .from("ordenes")
        .update({ estado: "anulado" })
        .eq("id", orden.id);

      if (updateError) {
        console.error("Error al anular la orden:", updateError);
        alert("Error al anular la compra. Por favor, inténtalo de nuevo.");
        return;
      }

      // Actualizar el estado local
      setOrden(prev => prev ? { ...prev, estado: "anulado" } : null);
      
      alert("✅ Compra anulada exitosamente");
      
      // Redirigir a home después de anular
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error) {
      console.error("Error al anular la compra:", error);
      alert("Error al anular la compra. Por favor, inténtalo de nuevo.");
    } finally {
      setIsAnulando(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto bg-red-50 rounded-lg shadow-md mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="p-4 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md mt-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    );
  }

  // Si la orden ya está anulada, mostrar mensaje
  if (orden.estado === "anulado") {
    return (
      <div className="p-4 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Compra Anulada</h2>
          <p className="text-gray-700 mb-6">Esta compra ha sido anulada.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resumen de la Orden</h1>

      {/* Estado de la orden */}
      <div className="mb-6 p-3 rounded-lg text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          orden.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
          orden.estado === "pagado" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          Estado: {orden.estado.toUpperCase()}
        </span>
      </div>

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
        <div className="space-y-4">
          <button
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            onClick={crearPreferencia}
            disabled={isLoading}
          >
            {isLoading ? "Creando pago..." : "Pagar con Mercado Pago"}
          </button>
          
          {/* Botón de anular compra */}
          <button
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            onClick={anularCompra}
            disabled={isAnulando || orden.estado !== "pendiente"}
          >
            {isAnulando ? "Anulando..." : "❌ Anular Compra"}
          </button>
          
          <p className="text-sm text-gray-600 text-center">
            Serás redirigido a MercadoPago para completar tu pago de forma segura
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 text-center font-medium">
              ✅ Preferencia de pago creada exitosamente
            </p>
            <p className="text-sm text-green-600 mt-1">
              Preference ID: {preferenceId}
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                <strong>Preference ID:</strong> {preferenceId}
              </p>
              <button
                onClick={() => {
                  console.log("Redirigiendo a MercadoPago...");
                  window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
                }}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                🚀 Ir a MercadoPago
              </button>
              
              {/* Botón de anular compra (también disponible después de crear preferencia) */}
              <button
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                onClick={anularCompra}
                disabled={isAnulando}
              >
                {isAnulando ? "Anulando..." : "❌ Anular Compra"}
              </button>
              
              <p className="text-sm text-gray-600">
                Haz clic para ir a MercadoPago y completar tu pago
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}