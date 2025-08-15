"use client";

import { useCarrito } from "@/app/context/CarritoContext";
import ConfirmarCompra from "./confirmarcompra";

export default function Carrito() {
  const {
    carrito,
    eliminarArticulo,
    aumentarCantidad,
    disminuirCantidad,
    total,
  } = useCarrito();

  if (carrito.length === 0)
    return <p className="p-4 text-center">Seleccione articulo, El carrito está vacío.</p>;

  return (
   <div className="fixed top-4 left-4 bg-yellow-100 shadow-lg p-3 rounded-lg border text-sm z-50">

      <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
      <ul>
        {carrito.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center mb-3 border-b pb-2"
          >
            <div>
              <p className="font-semibold">{item.nombre_articulo}</p>
              <p>
                ${item.precio_venta.toFixed(2)} x {item.cantidad} = $
                {(item.precio_venta * item.cantidad).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => disminuirCantidad(item.id)}
                className="bg-gray-300 px-2 rounded"
              >
                -
              </button>
              <span>{item.cantidad}</span>
              <button
                onClick={() => aumentarCantidad(item.id)}
                className="bg-gray-300 px-2 rounded"
              >
                +
              </button>
              <button
                onClick={() => eliminarArticulo(item.id)}
                className="text-red-600 ml-2"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-right font-bold mt-4">Total: ${total.toFixed(2)}</p>
       {/* 👇 Botón para confirmar compra */}
      <div className="mt-4">
        <ConfirmarCompra />
      </div>
    </div>
  );
}
