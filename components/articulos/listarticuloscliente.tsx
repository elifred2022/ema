// components/ListaArticulos.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ArticuloCard from "./articulocard";

type Articulo = {
 id: number;
  nombre_articulo: string;
  descripcion: string;
  precio_venta: number;
  existencia: number;
};

export default function ListaArticulosCliente() {
  const supabase = createClient();
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticulos = async () => {
      const { data, error } = await supabase.from("articulos").select("*");

      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }

      if (data) {
        setArticulos(data);
      }

      setCargando(false);
    };

    fetchArticulos();
  }, [supabase]);

  if (cargando) return <p>Cargando artículos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (articulos.length === 0) return <p>No hay artículos disponibles.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {articulos.map((articulo) => (
        <ArticuloCard key={articulo.id} articulo={articulo} />
      ))}
    </div>
  );
}
