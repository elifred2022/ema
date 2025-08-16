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

  // Determinar el estado del stock
  const stockDisponible = Number(articulo.existencia) || 0;
  const tieneStock = stockDisponible > 0;
  const stockBajo = stockDisponible <= 5 && stockDisponible > 0;
  const sinStock = stockDisponible === 0;

  // Función para obtener el color del stock
  const getStockColor = () => {
    if (sinStock) return "text-red-600 font-bold";
    if (stockBajo) return "text-orange-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  // Función para obtener el texto del stock
  const getStockText = () => {
    if (sinStock) return "❌ Sin stock";
    if (stockBajo) return `⚠️ Solo ${stockDisponible} disponibles`;
    return `✅ ${stockDisponible} disponibles`;
  };

  return (
    <div className="border rounded-md p-4 shadow-md bg-white max-w-sm">
      <h3 className="font-bold text-lg mb-2">{articulo.nombre_articulo}</h3>
      <p className="text-gray-700 mb-2">{articulo.descripcion}</p>
      <p className="font-semibold text-lg text-blue-600 mb-2">
        ${articulo.precio_venta.toFixed(2)}
      </p>
      
      {/* Indicador de stock mejorado */}
      <div className="mb-3">
        <p className={`text-sm ${getStockColor()}`}>
          {getStockText()}
        </p>
      </div>

      <button
        onClick={handleAgregar}
        disabled={!tieneStock}
        className={`px-3 py-2 rounded font-medium transition-colors ${
          tieneStock
            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
        }`}
        title={tieneStock ? "Agregar al carrito" : "Sin stock disponible"}
      >
        {tieneStock ? "🛒 Agregar al carrito" : "❌ Sin stock"}
      </button>
    </div>
  );
}
