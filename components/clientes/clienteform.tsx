"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ClienteForm() {
  const supabase = createClient();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null); // ID de la tabla clientes
  const [cargando, setCargando] = useState(true);

  // Cargar datos del cliente si existen
  useEffect(() => {
    const cargarDatos = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMensaje("Error: No se encontró usuario autenticado.");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setClienteId(data.id);
        setNombre(data.nombre);
        setDireccion(data.direccion);
        setTelefono(data.telefono);
      }

      setCargando(false);
    };

    cargarDatos();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMensaje("Error: No se encontró usuario autenticado.");
      return;
    }

    let error;

    if (clienteId) {
      // Si ya existe registro → UPDATE
      ({ error } = await supabase
        .from("clientes")
        .update({
          nombre,
          direccion,
          telefono,
        })
        .eq("id", clienteId)
        .eq("user_id", user.id));
    } else {
      // Si no existe → INSERT
      ({ error } = await supabase.from("clientes").insert([
        {
          user_id: user.id,
          nombre,
          direccion,
          telefono,
        },
      ]));
    }

    if (error) {
      setMensaje(`Error al guardar: ${error.message}`);
    } else {
      router.push("/protected");
    }
  };

  if (cargando) {
    return <p className="p-4">Cargando datos...</p>;
  }

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-lg font-bold mb-4">
        {clienteId ? "Editar datos del Cliente" : "Registro de Cliente"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre"
          className="border p-2 w-full rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          className="border p-2 w-full rounded"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          className="border p-2 w-full rounded"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded w-full"
        >
          {clienteId ? "Actualizar" : "Guardar"}
        </button>
          <button
            type="button"
            className="bg-gray-400 text-white p-2 rounded w-full"
            onClick={() => router.push("/protected")} // 👈 Cierra sin guardar
          >
            Cerrar
          </button>
      </form>
      {mensaje && <p className="mt-3 text-sm">{mensaje}</p>}
    </div>
  );
}
