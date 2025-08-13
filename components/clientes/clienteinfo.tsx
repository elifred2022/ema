"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Cliente = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
};

export default function ClienteInfo() {
  const supabase = createClient();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCliente = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, direccion, telefono")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setCliente(data);
      }

      setCargando(false);
    };

    cargarCliente();
  }, [supabase]);

  if (cargando) {
    return null; // no mostrar nada mientras carga
  }

  return (
    <div className="fixed top-4 left-4 bg-yellow-100 shadow-lg p-3 rounded-lg border text-sm z-50">

      {cliente ? (
        <div  >
            <p>Almacen Dios con nosotros</p>
            <p>Cliente</p>
          <p className="font-bold">{cliente.nombre}</p>
          <Link
            href="/auth/rut-clientes/form-cliente"
            className="inline-block px-4 py-2 mb-4 bg-gray-400 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
          >
            Agrear/Editar datos
          </Link>
          
          
        </div>
         
      ) : (
        <div>
          <p className="text-gray-600">Datos no registrados</p>
          <Link
            href="/cliente-form"
            className="text-blue-500 underline text-xs"
          >
            Completar datos
          </Link>
        </div>
      )}
    </div>
  );
}
