// context/CarritoContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ArticuloCarrito = {
  id: number;
  nombre_articulo: string;
  descripcion: string;
  precio_venta: number;
  existencia: number;
  cantidad: number;
};

type CarritoContextType = {
  carrito: ArticuloCarrito[];
  agregarArticulo: (articulo: ArticuloCarrito) => void;
  eliminarArticulo: (id: number) => void;
  aumentarCantidad: (id: number) => void;
  disminuirCantidad: (id: number) => void;
  total: number;
 limpiarCarrito: () => void; // 👈 añadimos esta línea
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return context;
};

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<ArticuloCarrito[]>([]);

  const agregarArticulo = (articulo: ArticuloCarrito) => {
    setCarrito((prev) => {
      const existe = prev.find((a) => a.id === articulo.id);
      if (existe) {
        // Si ya está, aumentamos cantidad
        return prev.map((a) =>
          a.id === articulo.id ? { ...a, cantidad: a.cantidad + articulo.cantidad } : a
        );
      } else {
        return [...prev, articulo];
      }
    });
  };

  const eliminarArticulo = (id: number) => {
    setCarrito((prev) => prev.filter((a) => a.id !== id));
  };

  const aumentarCantidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((a) => (a.id === id ? { ...a, cantidad: a.cantidad + 1 } : a))
    );
  };

  const disminuirCantidad = (id: number) => {
    setCarrito((prev) =>
      prev
        .map((a) => (a.id === id ? { ...a, cantidad: a.cantidad - 1 } : a))
        .filter((a) => a.cantidad > 0)
    );
  };

  // 👇 Nueva función
  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito"); // si lo guardas en localStorage
  };


  const total = carrito.reduce((acc, a) => acc + a.precio_venta * a.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarArticulo,
        eliminarArticulo,
        aumentarCantidad,
        disminuirCantidad,
        limpiarCarrito,
        total,
       
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}
