// components/ArticuloCard.tsx
"use client";

import { useCarrito, ArticuloCarrito } from "@/app/context/CarritoContext";

type Articulo = {
  id: number;
  nombre_articulo: string;
  descripcion: string;
  precio_venta: number;
  existencia: number;
};

export default function ArticuloCard({ articulo }: { articulo: Articulo }) {
    const { agregarArticulo } = useCarrito();

    const handleAgregar = () => {
    const item: ArticuloCarrito = {
        id: articulo.id,
        nombre_articulo: articulo.nombre_articulo,
        descripcion: articulo.descripcion,
        precio_venta: articulo.precio_venta,
       existencia: articulo.existencia,
      cantidad: 1,
    };
    agregarArticulo(item);
  };
  return (
    <div className="border rounded-md p-4 shadow-md bg-white max-w-sm">
      <h3 className="font-bold text-lg mb-2">{articulo.nombre_articulo}</h3>
      <p className="text-gray-700 mb-2">{articulo.descripcion}</p>
      <p className="font-semibold">${articulo.precio_venta.toFixed(2)}</p>
       <p className="font-semibold">Disponible: {articulo.existencia}</p>
        <button
        onClick={handleAgregar}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
