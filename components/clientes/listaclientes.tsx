"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Users, Loader2, Plus, Edit, Trash2 } from "lucide-react";

type Cliente = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  user_id?: string;
  created_at?: string;
};

export default function ListaClientes() {
  const supabase = createClient();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const inputBusquedaRef = useRef<HTMLInputElement | null>(null);

  const cargarClientes = async (filtro?: string) => {
    setCargando(true);
    setError(null);
    try {
      let query = supabase
        .from("clientes")
        .select("id, nombre, direccion, telefono, email, user_id, created_at")
        .order("created_at", { ascending: false });

      const termino = filtro?.trim();
      if (termino) {
        const pattern = `%${termino}%`;
        query = query.or(
          `nombre.ilike.${pattern},email.ilike.${pattern},telefono.ilike.${pattern}`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setClientes(data || []);
    } catch (err) {
      setError("Error al cargar los clientes");
    } finally {
      setCargando(false);
      setCargandoInicial(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [supabase]);

  const limpiarBusqueda = async () => {
    setBusqueda("");
    await cargarClientes();
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      cargarClientes(busqueda);
    }, 300);

    return () => clearTimeout(handle);
  }, [busqueda]);

  useEffect(() => {
    inputBusquedaRef.current?.focus();
  }, []);

  const eliminarCliente = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al cliente "${nombre}"?`)) {
      return;
    }

    setEliminandoId(id);
    try {
      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        alert("Error al eliminar el cliente: " + deleteError.message);
        setEliminandoId(null);
        return;
      }

      // Actualizar la lista local
      setClientes(clientes.filter((cliente) => cliente.id !== id));
    } catch (err) {
      alert("Error al eliminar el cliente");
    } finally {
      setEliminandoId(null);
    }
  };

  if (cargandoInicial) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  const headerClass = "px-4 py-3 text-left text-sm font-semibold uppercase";

  return (
    <div className="w-full space-y-6">
      {/* Header con título y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Lista de Clientes
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/rut-clientes/form-cliente?nuevo=true">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus className="h-5 w-5" />
              Agregar Cliente
            </Button>
          </Link>
          <Link href="/protected">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Home className="h-5 w-5" />
              Volver a Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Contador de clientes */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Users className="h-4 w-4" />
        <span>
          Total de clientes: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{clientes.length}</span>
        </span>
      </div>

      {/* Buscador */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label className="text-sm text-gray-600 dark:text-gray-400">Buscar</label>
          <input
            type="text"
            placeholder="Nombre, email o teléfono"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            ref={inputBusquedaRef}
            className="h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => cargarClientes(busqueda)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Buscar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={limpiarBusqueda}
            className="border-gray-300 dark:border-gray-600"
          >
            Limpiar
          </Button>
        </div>
        {cargando && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Buscando...</span>
          </div>
        )}
      </div>

      {/* Tabla de clientes */}
      {clientes.length === 0 ? (
        <div className="p-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-lg">No hay clientes registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className={headerClass}>ID</th>
                <th className={headerClass}>Nombre</th>
                <th className={headerClass}>Email</th>
                <th className={headerClass}>Teléfono</th>
                <th className={headerClass}>Dirección</th>
                <th className={headerClass}>Fecha de Registro</th>
                <th className={headerClass}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {cliente.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {cliente.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {cliente.email || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {cliente.telefono || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {cliente.direccion || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {cliente.created_at
                      ? new Date(cliente.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : (
                        <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                      )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/auth/rut-clientes/form-cliente?id=${cliente.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => eliminarCliente(cliente.id, cliente.nombre)}
                        disabled={eliminandoId === cliente.id}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 disabled:opacity-50"
                      >
                        {eliminandoId === cliente.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

