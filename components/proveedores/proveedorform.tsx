"use client";

import { useEffect, useState } from "react";
import { createProveedor } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

interface FormProveedorProps {
  modoNuevo?: boolean;
  redirectTo?: string;
}

export default function ProveedorForm({ modoNuevo = false, redirectTo }: FormProveedorProps) {
  const supabase = createProveedor();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [proveedor, setProveedor] = useState("");
  const [cuit, setCuit] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [situacion, setSituacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  
  // Detectar si es modo nuevo desde URL
  const esModoNuevo = modoNuevo || searchParams.get("nuevo") === "true";
  // Detectar si hay un ID de proveedor para editar
  const idProveedorParam = searchParams.get("id");

  useEffect(() => {
    const cargarDatos = async () => {
      // Si hay un ID de proveedor en la URL, cargar ese proveedor específico
      if (idProveedorParam) {
        const id = parseInt(idProveedorParam);
        if (!isNaN(id)) {
          setProveedorId(id);
          const { data, error } = await supabase
            .from("proveedores")
            .select("id, proveedor, cuit, direccion, telefono, email, contacto, situacion")
            .eq("id", id)
            .single();

          if (data && !error) {
            setProveedor(data.proveedor || "");
            setCuit(data.cuit || "");
            setDireccion(data.direccion || "");
            setTelefono(data.telefono || "");
            setEmail(data.email || "");
            setContacto(data.contacto || "");
            setSituacion(data.situacion || "");
            setCargando(false);
            return;
          }
        }
      }

      // Si es modo nuevo, dejar el email en blanco
      if (esModoNuevo) {
        setCargando(false);
        return;
      }

      setCargando(false);
    };

    cargarDatos();
  }, [supabase, esModoNuevo, idProveedorParam]);

  const guardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay un proveedorId, actualizar ese proveedor específico
    if (proveedorId) {
      const { error } = await supabase
        .from("proveedores")
        .update({ 
          proveedor, 
          cuit, 
          direccion, 
          telefono, 
          email, 
          contacto, 
          situacion 
        })
        .eq("id", proveedorId);

      if (error) {
        alert("Error al actualizar el proveedor: " + error.message);
        return;
      }

      router.push(redirectTo || "/auth/rut-proveedores/lista-proveedores");
      return;
    }

    if (esModoNuevo) {
      // Crear nuevo proveedor
      const { error } = await supabase.from("proveedores").insert({
        proveedor,
        cuit,
        direccion,
        telefono,
        email,
        contacto,
        situacion,
      });

      if (error) {
        alert("Error al crear el proveedor: " + error.message);
        return;
      }

      router.push(redirectTo || "/auth/rut-proveedores/lista-proveedores");
    }
  };

  if (cargando) {
    return <p className="p-4">Cargando datos...</p>;
  }

  return (
    <form
      onSubmit={guardarProveedor}
      className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg space-y-4"
    >
      <h2 className="text-xl font-bold">
        {proveedorId ? "Editar Proveedor" : esModoNuevo ? "Agregar Nuevo Proveedor" : "Datos del Proveedor"}
      </h2>

      <div>
        <label className="block font-medium">Proveedor</label>
        <input
          type="text"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          required
          className="border p-2 w-full rounded"
          placeholder="Nombre del proveedor"
        />
      </div>

      <div>
        <label className="block font-medium">CUIT</label>
        <input
          type="text"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          required
          className="border p-2 w-full rounded"
          placeholder="CUIT del proveedor"
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
          placeholder="Dirección del proveedor"
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
          placeholder="Teléfono del proveedor"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full rounded"
          placeholder="Email del proveedor"
        />
      </div>

      <div>
        <label className="block font-medium">Contacto</label>
        <input
          type="text"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="Persona de contacto"
        />
      </div>

      <div>
        <label className="block font-medium">Situación</label>
        <select
          value={situacion}
          onChange={(e) => setSituacion(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">Seleccione una opción</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push(redirectTo || "/auth/rut-proveedores/lista-proveedores")}
          className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
