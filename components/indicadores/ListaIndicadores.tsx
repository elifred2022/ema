"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, BarChart3, TrendingUp, TrendingDown, Loader2, ShoppingCart, DollarSign, Download } from "lucide-react";
import * as XLSX from "xlsx";

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

export default function ListaIndicadores() {
  const supabase = createClient();
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const cargarIndicadores = async (filtros?: { desde?: string; hasta?: string }) => {
    setCargando(true);
    setError(null);
    try {
      // Query ventas
      let queryVentas = supabase
        .from("ventas")
        .select("total");

      if (filtros?.desde) {
        const desdeIso = toStartOfDayIso(filtros.desde);
        if (desdeIso) queryVentas = queryVentas.gte("created_at", desdeIso);
      }
      if (filtros?.hasta) {
        const hastaIso = toEndOfDayIso(filtros.hasta);
        if (hastaIso) queryVentas = queryVentas.lte("created_at", hastaIso);
      }

      const { data: ventasData, error: ventasError } = await queryVentas;

      if (ventasError) {
        setError(ventasError.message);
        return;
      }

      const sumaVentas = (ventasData || []).reduce((acc, v) => acc + parseCurrency(v.total || "0"), 0);
      setTotalVentas(sumaVentas);

      // Query compras
      let queryCompras = supabase
        .from("compras")
        .select("total");

      if (filtros?.desde) {
        const desdeIso = toStartOfDayIso(filtros.desde);
        if (desdeIso) queryCompras = queryCompras.gte("created_at", desdeIso);
      }
      if (filtros?.hasta) {
        const hastaIso = toEndOfDayIso(filtros.hasta);
        if (hastaIso) queryCompras = queryCompras.lte("created_at", hastaIso);
      }

      const { data: comprasData, error: comprasError } = await queryCompras;

      if (comprasError) {
        setError(comprasError.message);
        return;
      }

      const sumaCompras = (comprasData || []).reduce((acc, c) => acc + parseCurrency(c.total || "0"), 0);
      setTotalCompras(sumaCompras);
    } catch (err) {
      setError("Error al cargar los indicadores");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIndicadores();
  }, [supabase]);

  const aplicarFiltros = async () => {
    await cargarIndicadores({
      desde: fechaDesde,
      hasta: fechaHasta,
    });
  };

  const limpiarFiltros = async () => {
    setFechaDesde("");
    setFechaHasta("");
    await cargarIndicadores();
  };

  const diferencia = totalVentas - totalCompras;
  const esGanancia = diferencia >= 0;

  const exportarExcel = () => {
    const periodo =
      fechaDesde || fechaHasta
        ? `Período: ${fechaDesde || "inicio"} - ${fechaHasta || "hoy"}`
        : "Todos los registros";

    const rows = [
      ["Indicadores - Reporte comparativo"],
      [periodo],
      [""],
      ["Indicador", "Valor"],
      ["Total Ventas", totalVentas],
      ["Total Compras", totalCompras],
      ["Diferencia (Ventas - Compras)", diferencia],
      ["Resultado", esGanancia ? "Ganancia" : "Pérdida"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicadores");
    XLSX.writeFile(workbook, `indicadores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (cargando && totalVentas === 0 && totalCompras === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando indicadores...</p>
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Indicadores
          </h2>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={exportarExcel}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          >
            <Download className="h-5 w-5" />
            Descargar Excel
          </Button>
          <Link href="/protected">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
            >
              <Home className="h-5 w-5" />
              Volver a Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros por fecha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
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
        <div className="flex gap-2">
          <Button size="sm" onClick={aplicarFiltros} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Filtrar
          </Button>
          <Button size="sm" variant="outline" onClick={limpiarFiltros} className="border-gray-300 dark:border-gray-600">
            Limpiar
          </Button>
        </div>
        {cargando && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Actualizando...</span>
          </div>
        )}
      </div>

      {/* Tarjetas de totales y comparativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ventas */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(totalVentas)}
            </p>
          </CardContent>
        </Card>

        {/* Total Compras */}
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Total Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
              {formatCurrency(totalCompras)}
            </p>
          </CardContent>
        </Card>

        {/* Diferencia (Ventas - Compras) */}
        <Card
          className={`border-2 ${
            esGanancia
              ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-900"
              : "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-gray-900"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center gap-2 ${
                esGanancia ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }`}
            >
              {esGanancia ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              Diferencia (Ventas - Compras)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                esGanancia ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
              }`}
            >
              {formatCurrency(diferencia)}
            </p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {esGanancia ? "Ganancia" : "Pérdida"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen comparativo */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen comparativo
          </CardTitle>
          <CardDescription>
            Ventas vs Compras en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Ventas totales</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalVentas)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Compras totales</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(totalCompras)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-800 dark:text-gray-200">Resultado</span>
              <span
                className={`font-bold ${esGanancia ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatCurrency(diferencia)} ({esGanancia ? "Ganancia" : "Pérdida"})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
