"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// Inicializar SDK React (Frontend)
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "es-AR" });

export default function CheckoutPage() {
  const supabase = createClient();
  const params = useParams();
  const [orden, setOrden] = useState<any>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrden = async () => {
      const { data, error } = await supabase
        .from("ordenes")
        .select(`id, total, estado, orden_items(*)`)
        .eq("id", params.id)
        .single();

      if (error) return console.error(error);
      setOrden(data);
    };

    fetchOrden();
  }, [params.id]);

  const crearPreferencia = async () => {
    if (!orden) return;

    const res = await fetch("/api/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orden.orden_items.map((i: any) => ({
          title: i.nombre_articulo,
          quantity: i.cantidad,
          unit_price: i.precio_unit,
        })),
        payerEmail: "cliente@ejemplo.com",
      }),
    });

    const data = await res.json();
    setPreferenceId(data.id);
  };

  if (!orden) return <p>Cargando orden...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <ul className="mb-4">
        {orden.orden_items.map((item: any) => (
          <li key={item.id} className="flex justify-between border-b py-2">
            <span>{item.nombre_articulo} x {item.cantidad}</span>
            <span>${item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <p className="text-right font-bold mb-4">Total: ${orden.total.toFixed(2)}</p>

      {!preferenceId ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={crearPreferencia}
        >
          Pagar con Mercado Pago
        </button>
      ) : (
        <Wallet initialization={{ preferenceId }} />
      )}
    </div>
  );
}
