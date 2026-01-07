"use client";

import { useState, useEffect } from "react";
import { createProveedor } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Users, Loader2, Plus, Edit, Trash2 } from "lucide-react";

type Proveedor = {
  id: number;
  proveedor: string;
  cuit: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  situacion: string;
  created_at?: string;
};

export default function ListaProveedores() {
  const supabase = createProveedor();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("proveedores")
          .select("id, proveedor, cuit, direccion, telefono, email, contacto, situacion, created_at")
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          setCargando(false);
          return;
        }

        setProveedores(data || []);
      } catch (err) {
        setError("Error al cargar los proveedores");
      } finally {
        setCargando(false);
      }
    };

    cargarProveedores();
  }, [supabase]);

  const eliminarProveedor = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al proveedor "${nombre}"?`)) {
      return;
    }

    setEliminandoId(id);
    try {
      const { error: deleteError } = await supabase
        .from("proveedores")
        .delete()
        .eq("id", id);

      if (deleteError) {
        alert("Error al eliminar el proveedor: " + deleteError.message);
        setEliminandoId(null);
        return;
      }

      // Actualizar la lista local
      setProveedores(proveedores.filter((proveedor) => proveedor.id !== id));
    } catch (err) {
      alert("Error al eliminar el proveedor");
    } finally {
      setEliminandoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando proveedores...</p>
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
            Lista de Proveedores
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/rut-proveedores/form-proveedor?nuevo=true">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus className="h-5 w-5" />
              Agregar Proveedor
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
          Total de proveedores: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{proveedores.length}</span>
        </span>
      </div>

      {/* Tabla de clientes */}
      {proveedores.length === 0 ? (
        <div className="p-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-lg">No hay proveedores registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
              <tr>
              
                <th className={headerClass}>ID</th>
                <th className={headerClass}>Proveedor</th>
                <th className={headerClass}>Cuit</th>
                <th className={headerClass}>Direccion</th>
                <th className={headerClass}>Telefono</th>
                <th className={headerClass}>Email</th>
                <th className={headerClass}>Contacto</th>
                <th className={headerClass}>Situacion</th>
                <th className={headerClass}>Fecha de Registro</th>
                <th className={headerClass}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {proveedores.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {proveedor.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {proveedor.proveedor}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {proveedor.cuit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {proveedor.direccion || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {proveedor.telefono || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {proveedor.email || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {proveedor.contacto || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {proveedor.situacion || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {proveedor.created_at
                      ? new Date(proveedor.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : (
                        <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                      )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Link href={`/auth/rut-proveedores/form-proveedor?id=${proveedor.id}`}>
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
                        onClick={() => eliminarProveedor(proveedor.id, proveedor.proveedor)}
                        disabled={eliminandoId === proveedor.id}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 disabled:opacity-50"
                      >
                        {eliminandoId === proveedor.id ? (
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

