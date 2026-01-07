"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

interface FormClienteProps {
  modoNuevo?: boolean;
  redirectTo?: string;
}

export default function FormCliente({ modoNuevo = false, redirectTo }: FormClienteProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [cargando, setCargando] = useState(true);
  
  // Detectar si es modo nuevo desde URL
  const esModoNuevo = modoNuevo || searchParams.get("nuevo") === "true";

  useEffect(() => {
    const cargarDatos = async () => {
      // Siempre obtener el usuario autenticado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCargando(false);
        return;
      }

      // Guardar el user_id siempre
      setUserId(user.id);

      // Si es modo nuevo, solo establecer el email del usuario actual como valor por defecto
      if (esModoNuevo) {
        setEmail(user.email || "");
        setCargando(false);
        return;
      }

      // Modo normal: cargar datos del cliente del usuario
      setEmail(user.email || "");

      // buscar si el cliente ya tiene datos
      const { data, error } = await supabase
        .from("clientes")
        .select("nombre, direccion, telefono")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setNombre(data.nombre || "");
        setDireccion(data.direccion || "");
        setTelefono(data.telefono || "");
      }

      setCargando(false);
    };

    cargarDatos();
  }, [supabase, esModoNuevo]);

  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (esModoNuevo) {
      // Crear nuevo cliente con el user_id del usuario que lo está creando
      const { error } = await supabase.from("clientes").insert({
        nombre,
        direccion,
        telefono,
        email,
        user_id: userId, // Asignar el user_id del usuario que crea el cliente
      });

      if (error) {
        alert("Error al crear el cliente: " + error.message);
        return;
      }

      router.push(redirectTo || "/auth/rut-clientes/lista-clientes");
    } else {
      // Modo original: editar perfil del usuario actual
      const { data: existente } = await supabase
        .from("clientes")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existente) {
        await supabase
          .from("clientes")
          .update({ nombre, direccion, telefono, email })
          .eq("user_id", userId);
      } else {
        await supabase.from("clientes").insert({
          nombre,
          direccion,
          telefono,
          email,
          user_id: userId,
        });
      }

      router.push(redirectTo || "/protected");
    }
  };

  if (cargando) {
    return <p className="p-4">Cargando datos...</p>;
  }

  return (
    <form
      onSubmit={guardarCliente}
      className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg space-y-4"
    >
      <h2 className="text-xl font-bold">
        {esModoNuevo ? "Agregar Nuevo Cliente" : "Datos del Cliente"}
      </h2>

      <div>
        <label className="block font-medium">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Dirección</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Teléfono</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Campo email editable en modo nuevo */}
      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={!esModoNuevo}
          required={esModoNuevo}
          className={`border p-2 w-full rounded ${esModoNuevo ? "" : "bg-gray-100"}`}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Guardar
      </button>
    </form>
  );
}
