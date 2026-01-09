"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Venta = {
  id: number;
  cliente: string;
  items: Array<{
    codint: string;
    nombre_articulo: string;
    descripcion: string;
    familia: string;
    cant: number;
    precio_venta: string;
  }>;
  total: string;
  created_at?: string;
};

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
};

export default function Boleta({ ventaId }: { ventaId: number }) {
  const supabase = createClient();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar datos de la venta
        const { data: ventaData, error: ventaError } = await supabase
          .from("ventas")
          .select("id, cliente, items, total, created_at")
          .eq("id", ventaId)
          .single();

        if (ventaError || !ventaData) {
          setError("No se pudo cargar la venta");
          setCargando(false);
          return;
        }

        // Parsear items si vienen como string JSON
        const itemsParsed = typeof ventaData.items === 'string' 
          ? JSON.parse(ventaData.items) 
          : ventaData.items;

        const ventaCompleta: Venta = {
          ...ventaData,
          items: itemsParsed || [],
        };
        setVenta(ventaCompleta);

        // Buscar datos del cliente por nombre
        if (ventaData.cliente) {
          const { data: clienteData, error: clienteError } = await supabase
            .from("clientes")
            .select("id, nombre, telefono")
            .eq("nombre", ventaData.cliente)
            .single();

          if (!clienteError && clienteData) {
            setCliente(clienteData);
          }
        }
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [supabase, ventaId]);

  const handleImprimir = () => {
    window.print();
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando boleta...</p>
        </div>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
        <p>{error || "No se encontró la venta"}</p>
        <Link href="/auth/rut-ventas/lista-ventas">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  const fecha = venta.created_at
    ? new Date(venta.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Botones de acción - ocultos al imprimir */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/auth/rut-ventas/lista-ventas">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <Button onClick={handleImprimir} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Boleta - visible al imprimir */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 shadow-lg print:shadow-none print:border-0">
        {/* Encabezado */}
        <div className="text-center mb-8 border-b-2 border-gray-300 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            BOLETA DE VENTA
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Venta N° {venta.id}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fecha: {fecha}
          </p>
        </div>

        {/* Datos del Cliente */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            Datos del Cliente
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Nombre:</span> {venta.cliente || "N/A"}
            </p>
            {cliente && cliente.telefono && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Teléfono:</span> {cliente.telefono}
              </p>
            )}
          </div>
        </div>

        {/* Artículos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            Artículos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold">
                    Código
                  </th>
                  <th className="text-left py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold">
                    Artículo
                  </th>
                  <th className="text-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold">
                    Cant.
                  </th>
                  <th className="text-right py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold">
                    Precio Unit.
                  </th>
                  <th className="text-right py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item, index) => {
                  const subtotal = (parseFloat(item.precio_venta) || 0) * (item.cant || 0);
                  return (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                        {item.codint}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{item.nombre_articulo}</div>
                          {item.descripcion && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                              {item.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-sm text-center text-gray-700 dark:text-gray-300">
                        {item.cant}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                        ${parseFloat(item.precio_venta || "0").toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-700">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Total: ${parseFloat(venta.total || "0").toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Gracias por su compra</p>
        </div>
      </div>
    </div>
  );
}
