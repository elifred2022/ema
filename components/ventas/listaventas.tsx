"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ShoppingCart, Loader2, Plus, Edit, Trash2, Eye, Printer } from "lucide-react";

type Ventas = {
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
  total: string | number;
  created_at?: string;
};

export default function ListaVentas() {
  const supabase = createClient();
  const [ventas, setVentas] = useState<Ventas[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [mostrandoItems, setMostrandoItems] = useState<number | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [totalConsulta, setTotalConsulta] = useState(0);

  const parseCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const normalized = String(value)
      .replace(/[^0-9.,-]/g, "")
      .trim();

    if (!normalized) return 0;

    if (normalized.includes(".") && normalized.includes(",")) {
      const noThousands = normalized.replace(/\./g, "");
      return Number.parseFloat(noThousands.replace(",", "."));
    }

    return Number.parseFloat(normalized.replace(",", "."));
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const toStartOfDayIso = (fecha: string) => {
    const date = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const toEndOfDayIso = (fecha: string) => {
    const date = new Date(`${fecha}T23:59:59.999`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const cargarVentas = async (filtros?: { desde?: string; hasta?: string; cliente?: string }) => {
    setCargando(true);
    setError(null);
    try {
      let query = supabase
        .from("ventas")
        .select("id, cliente, items, total, created_at")
        .order("created_at", { ascending: false });

      if (filtros?.desde) {
        const desdeIso = toStartOfDayIso(filtros.desde);
        if (desdeIso) {
          query = query.gte("created_at", desdeIso);
        }
      }

      if (filtros?.hasta) {
        const hastaIso = toEndOfDayIso(filtros.hasta);
        if (hastaIso) {
          query = query.lte("created_at", hastaIso);
        }
      }

      if (filtros?.cliente?.trim()) {
        query = query.ilike("cliente", `%${filtros.cliente.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const ventasParsed = (data || []).map((venta) => ({
        ...venta,
        items: typeof venta.items === "string" ? JSON.parse(venta.items) : venta.items,
      }));

      setVentas(ventasParsed);
      const suma = ventasParsed.reduce((acc, venta) => {
        return acc + parseCurrency(venta.total || "0");
      }, 0);
      setTotalConsulta(suma);
    } catch (err) {
      setError("Error al cargar las ventas");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [supabase]);

  const aplicarFiltros = async () => {
    await cargarVentas({
      desde: fechaDesde,
      hasta: fechaHasta,
      cliente: busquedaCliente,
    });
  };

  const limpiarFiltros = async () => {
    setFechaDesde("");
    setFechaHasta("");
    setBusquedaCliente("");
    await cargarVentas();
  };

  const imprimirReporte = () => {
    window.print();
  };

  const eliminarVenta = async (id: number, cliente: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la venta al cliente "${cliente}"?`)) {
      return;
    }

    setEliminandoId(id);
    try {
      const { error: deleteError } = await supabase
        .from("ventas")
        .delete()
        .eq("id", id);

      if (deleteError) {
        alert("Error al eliminar la venta: " + deleteError.message);
        setEliminandoId(null);
        return;
      }

      // Actualizar la lista local
      setVentas(ventas.filter((venta) => venta.id !== id));
    } catch (err) {
      alert("Error al eliminar la venta");
      console.error(err);
    } finally {
      setEliminandoId(null);
    }
  };

  const toggleItems = (id: number) => {
    setMostrandoItems(mostrandoItems === id ? null : id);
  };

  const contarItems = (items: Ventas['items']) => {
    return items ? items.length : 0;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando ventas...</p>
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
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Lista de Ventas
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/rut-ventas/form-ventas">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus className="h-5 w-5" />
              Nueva Venta
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

      {/* Contador de compras */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>
            Total de ventas:{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{ventas.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Suma total (consulta):</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalConsulta)}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-sm text-gray-600 dark:text-gray-400">Cliente</label>
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={aplicarFiltros}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Buscar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={limpiarFiltros}
            className="border-gray-300 dark:border-gray-600"
          >
            Limpiar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={imprimirReporte}
            className="border-gray-300 dark:border-gray-600 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir reporte
          </Button>
        </div>
      </div>

      {/* Tabla de compras */}
      {ventas.length === 0 ? (
        <div className="p-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-center text-gray-600 dark:text-gray-400">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-lg">No hay ventas registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className={headerClass}>ID</th>
                <th className={headerClass}>Cliente</th>
                <th className={headerClass}>Items</th>
                <th className={headerClass}>Total</th>
                <th className={headerClass}>Fecha</th>
                <th className={headerClass}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ventas.flatMap((venta) => [
                <tr
                  key={venta.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {venta.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {venta.cliente || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{contarItems(venta.items)}</span>
                      <span className="text-gray-500">artículos</span>
                      {venta.items && venta.items.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleItems(venta.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {mostrandoItems === venta.id ? "Ocultar" : "Ver"}
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${venta.total || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {venta.created_at
                      ? new Date(venta.created_at).toLocaleDateString("es-ES", {
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
                      <Link href={`/auth/rut-ventas/boleta/${venta.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                          title="Ver Boleta"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/auth/rut-ventas/form-ventas?id=${venta.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => eliminarVenta(venta.id, venta.cliente)}
                        disabled={eliminandoId === venta.id}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 disabled:opacity-50"
                        title="Eliminar"
                      >
                        {eliminandoId === venta.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>,
                mostrandoItems === venta.id && venta.items && venta.items.length > 0 ? (
                  <tr key={`${venta.id}-details`}>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Detalle de Artículos:
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-300 dark:border-gray-600">
                                <th className="px-2 py-2 text-left">Código</th>
                                <th className="px-2 py-2 text-left">Artículo</th>
                                <th className="px-2 py-2 text-left">Familia</th>
                                <th className="px-2 py-2 text-right">Cantidad</th>
                                <th className="px-2 py-2 text-right">Costo</th>
                                <th className="px-2 py-2 text-right">% Aplicar</th>
                                <th className="px-2 py-2 text-right">Precio Venta</th>
                              </tr>
                            </thead>
                            <tbody>
                              {venta.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                                  <td className="px-2 py-2 font-mono">{item.codint}</td>
                                  <td className="px-2 py-2">
                                    <div>
                                      <div className="font-medium">{item.nombre_articulo}</div>
                                      {item.descripcion && (
                                        <div className="text-gray-500 text-xs">{item.descripcion}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 py-2">{item.familia || "N/A"}</td>
                                  <td className="px-2 py-2 text-right">{item.cant}</td>
                                  <td className="px-2 py-2 text-right">${item.precio_venta || "0.00"}</td>
                                  
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null,
              ].filter(Boolean))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

