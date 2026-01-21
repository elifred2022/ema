"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

type ItemCompra = {
  id?: string; // ID único para React key
  codbar?: string;
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  familia: string;
  cant: number;
  costo_compra: string;
  descuento?: string; // Porcentaje de descuento
  costo_unit_neto?: string; // Costo unitario después del descuento
  otros_cargos_item?: string; // Prorrateo de impuestos y otros cargos por item
  articulo_id?: string; // ID del artículo en la tabla articulos
};

type Proveedor = {
  id: number;
  proveedor: string;
};

type Articulo = {
  id: string;
  codbar?: string;
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  familia: string;
  costo_compra: string;
  existencia: string;
};

export default function CompraForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [proveedor, setProveedor] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [compraId, setCompraId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busquedaArticulo, setBusquedaArticulo] = useState("");
  const [codbarScan, setCodbarScan] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [impuestos, setImpuestos] = useState("");
  const [otrosCargos, setOtrosCargos] = useState("");

  const idCompraParam = searchParams.get("id");
  const esModoNuevo = searchParams.get("nuevo") === "true" || !idCompraParam;

  // Calcular costo unitario neto
  const calcularCostoUnitNeto = (costoUnit: string, descuento: string) => {
    const costo = parseFloat(costoUnit) || 0;
    const desc = parseFloat(descuento) || 0;
    const costoNeto = costo - (costo * desc / 100);
    return costoNeto.toFixed(2);
  };

  // Cargar proveedores, artículos y datos de compra si existe
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar proveedores
        const { data: proveedoresData, error: proveedoresError } = await supabase
          .from("proveedores")
          .select("id, proveedor")
          .order("proveedor", { ascending: true });

        if (proveedoresError) {
          setError("Error al cargar proveedores: " + proveedoresError.message);
        } else {
          setProveedores(proveedoresData || []);
        }

        // Cargar artículos
        const { data: articulosData, error: articulosError } = await supabase
          .from("articulos")
          .select("id, codbar, codint, nombre_articulo, descripcion, familia, costo_compra, existencia")
          .order("nombre_articulo", { ascending: true });

        if (articulosError) {
          console.error("Error al cargar artículos:", articulosError);
        } else {
          setArticulos(articulosData || []);
        }

        // Si hay un ID de compra, cargar datos para editar
        if (idCompraParam) {
          const id = parseInt(idCompraParam);
          if (!isNaN(id)) {
            setCompraId(id);
            const { data: compraData, error: compraError } = await supabase
              .from("compras")
              .select("id, proveedor, items, total, impuestos, otros_cargos")
              .eq("id", id)
              .single();

            if (compraData && !compraError) {
              setProveedor(compraData.proveedor || "");
              setImpuestos(compraData.impuestos || "");
              setOtrosCargos(compraData.otros_cargos || "");
              // Parsear items si vienen como string JSON
              const itemsParsed = typeof compraData.items === 'string'
                ? JSON.parse(compraData.items)
                : compraData.items;
              // Agregar IDs únicos a los items si no los tienen y asegurar campos de descuento
              const itemsConIds = (itemsParsed || []).map((item: ItemCompra) => {
                const descuento = item.descuento || "0";
                const costoUnit = item.costo_compra || "0";
                const costoNeto = calcularCostoUnitNeto(costoUnit, descuento);
                return {
                  ...item,
                  id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  descuento: descuento,
                  costo_unit_neto: costoNeto,
                  otros_cargos_item: item.otros_cargos_item || "0.00",
                };
              });
              setItems(itemsConIds);
              // Los prorrateos se calcularán después con el useEffect
            }
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
  }, [supabase, idCompraParam]);

  // Actualizar prorrateos cuando cambien los impuestos, otros cargos o items
  useEffect(() => {
    if (items.length > 0) {
      const impuestosValor = parseFloat(impuestos) || 0;
      const otrosCargosValor = parseFloat(otrosCargos) || 0;
      const totalAProrratear = impuestosValor + otrosCargosValor;
      const cantidadTotal = items.reduce((sum, item) => sum + (item.cant || 0), 0);

      if (cantidadTotal > 0) {
        const prorrateoPorUnidad = totalAProrratear / cantidadTotal;
        setItems((prevItems) => {
          let necesitaActualizacion = false;
          const itemsActualizados = prevItems.map((item) => {
            const costoUnit = parseFloat(item.costo_compra) || 0;
            const descuento = parseFloat(item.descuento || "0") || 0;
            const cantidad = item.cant || 0;

            // Calcular prorrateo
            const prorrateo = prorrateoPorUnidad * cantidad;
            const nuevoProrrateo = prorrateo.toFixed(2);

            // Calcular costo unitario neto con otros cargos
            const costoUnitConDescuento = costoUnit - (costoUnit * descuento / 100);
            const otrosCargosUnit = cantidad > 0 ? prorrateo / cantidad : 0;
            const nuevoCostoUnitNeto = (costoUnitConDescuento + otrosCargosUnit).toFixed(2);

            const haCambiadoProrrateo = item.otros_cargos_item !== nuevoProrrateo;
            const haCambiadoCostoNeto = item.costo_unit_neto !== nuevoCostoUnitNeto;

            if (haCambiadoProrrateo || haCambiadoCostoNeto) {
              necesitaActualizacion = true;
              return {
                ...item,
                otros_cargos_item: nuevoProrrateo,
                costo_unit_neto: nuevoCostoUnitNeto,
              };
            }
            return item;
          });
          return necesitaActualizacion ? itemsActualizados : prevItems;
        });
      } else {
        // Si no hay cantidad total, poner otros_cargos_item en 0 y recalcular costo_unit_neto sin otros cargos
        setItems((prevItems) => {
          const tieneProrrateos = prevItems.some(item => item.otros_cargos_item !== "0.00" && item.otros_cargos_item);
          if (tieneProrrateos) {
            return prevItems.map((item) => {
              const costoUnit = parseFloat(item.costo_compra) || 0;
              const descuento = parseFloat(item.descuento || "0") || 0;
              const costoUnitConDescuento = costoUnit - (costoUnit * descuento / 100);
              return {
                ...item,
                otros_cargos_item: "0.00",
                costo_unit_neto: costoUnitConDescuento.toFixed(2),
              };
            });
          }
          return prevItems;
        });
      }
    }
  }, [impuestos, otrosCargos, items.length, items.map(i => `${i.id}-${i.cant}-${i.costo_compra}-${i.descuento}`).join(',')]);

  // Calcular subtotal (incluye prorrateo de impuestos y otros cargos)
  const calcularSubtotal = () => {
    return items.reduce((sum, item) => {
      const costoUnit = parseFloat(item.costo_compra) || 0;
      const descuento = parseFloat(item.descuento || "0") || 0;
      const costoNeto = costoUnit - (costoUnit * descuento / 100);
      const cantidad = item.cant || 0;
      const otrosCargosItem = parseFloat(item.otros_cargos_item || "0") || 0;
      return sum + (costoNeto * cantidad) + otrosCargosItem;
    }, 0);
  };

  // Calcular total (el subtotal ya incluye los prorrateos)
  const calcularTotal = () => {
    return calcularSubtotal();
  };

  // Eliminar item
  const eliminarItem = (itemId: string) => {
    const nuevosItems = items.filter((item) => item.id !== itemId);
    setItems(nuevosItems);
    // Los prorrateos se actualizarán automáticamente con el useEffect
  };

  // Actualizar item
  const actualizarItem = (itemId: string, campo: keyof ItemCompra, valor: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [campo]: valor } : item
      )
    );
  };

  // Actualizar múltiples campos de un item a la vez
  const actualizarItemMultiple = (itemId: string, campos: Partial<ItemCompra>) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...campos } : item
      )
    );
  };

  // Buscar artículo por código o nombre
  const buscarArticulo = (busqueda: string) => {
    if (!busqueda.trim()) return [];
    const busquedaLower = busqueda.toLowerCase();
    return articulos.filter(
      (art) =>
        (art.codbar ?? "").toLowerCase().includes(busquedaLower) ||
        (art.codint ?? "").toLowerCase().includes(busquedaLower) ||
        (art.nombre_articulo ?? "").toLowerCase().includes(busquedaLower)
    );
  };

  // Seleccionar artículo y agregarlo a la lista
  const seleccionarArticulo = (articulo: Articulo) => {
    // Verificar si el artículo ya está en la lista
    const existe = items.find((item) => item.articulo_id === articulo.id);

    if (existe) {
      // Si ya existe, aumentar la cantidad en 1
      actualizarItem(existe.id!, "cant", (existe.cant || 1) + 1);
    } else {
      // Si no existe, agregarlo como nuevo item
      const nuevoItem: ItemCompra = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        codbar: articulo.codbar ?? "",
        codint: articulo.codint,
        nombre_articulo: articulo.nombre_articulo,
        descripcion: articulo.descripcion || "",
        familia: articulo.familia || "",
        cant: 1,
        costo_compra: articulo.costo_compra || "0.00",
        descuento: "0",
        costo_unit_neto: articulo.costo_compra || "0.00",
        otros_cargos_item: "0.00",
        articulo_id: articulo.id,
      };
      setItems([...items, nuevoItem]);
    }
    // Limpiar búsqueda
    setBusquedaArticulo("");
  };

  const procesarCodbar = (codigo: string) => {
    const valor = codigo.trim();
    if (!valor) return;
    const articulo = articulos.find((art) => art.codbar === valor);
    if (articulo) {
      seleccionarArticulo(articulo);
      setCodbarScan("");
    } else {
      alert(`No se encontró artículo con codbar: ${valor}`);
      setCodbarScan("");
    }
  };

  // Guardar compra
  const guardarCompra = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedor) {
      alert("Por favor selecciona un proveedor");
      return;
    }

    if (items.length === 0) {
      alert("Por favor agrega al menos un artículo");
      return;
    }

    // Validar que todos los items tengan los campos requeridos
    const itemsInvalidos = items.some(
      (item) =>
        !item.codint ||
        !item.nombre_articulo ||
        !item.familia ||
        item.cant <= 0 ||
        parseFloat(item.costo_compra) <= 0
    );

    if (itemsInvalidos) {
      alert("Por favor completa todos los campos de los artículos correctamente");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const total = calcularTotal().toFixed(2);

      // Limpiar el campo 'id' de los items antes de guardar (solo es para React)
      const itemsParaGuardar = items.map(({ id, ...item }) => item);

      if (compraId) {
        // Actualizar compra existente
        const { error: updateError } = await supabase
          .from("compras")
          .update({
            proveedor,
            items: itemsParaGuardar,
            total,
          })
          .eq("id", compraId);

        if (updateError) {
          alert("Error al actualizar la compra: " + updateError.message);
          setGuardando(false);
          return;
        }
      } else {
        // Crear nueva compra (el ID se genera automáticamente en Supabase)
        const { error: insertError } = await supabase.from("compras").insert({
          proveedor,
          items: itemsParaGuardar,
          total,
          fac: numeroFactura || null,
        });

        if (insertError) {
          alert("Error al crear la compra: " + insertError.message);
          setGuardando(false);
          return;
        }

        // Actualizar stock de artículos solo para nuevas compras
        for (const item of items) {
          const filtroArticulo =
            item.articulo_id
              ? { id: item.articulo_id }
              : item.codint
                ? { codint: item.codint }
                : item.codbar
                  ? { codbar: item.codbar }
                  : null;

          if (!filtroArticulo) {
            console.warn("Item sin identificador para actualizar stock:", item);
            continue;
          }

          const { data: articuloActual, error: fetchArticuloError } = await supabase
            .from("articulos")
            .select("id, existencia, porcentaje_aplicar")
            .match(filtroArticulo)
            .single();

          if (fetchArticuloError || !articuloActual) {
            console.error(
              `Error al obtener artículo para stock (${item.codint || item.codbar || item.articulo_id}):`,
              fetchArticuloError
            );
            continue;
          }

          const existenciaActual = parseFloat(articuloActual.existencia) || 0;
          const cantidadComprada = item.cant || 0;
          const nuevaExistencia = existenciaActual + cantidadComprada;

          // Calcular nuevo precio de venta usando el porcentaje aplicable existente
          const nuevoCostoCompra = parseFloat(item.costo_unit_neto || "0");
          const porcentajeAplicar = parseFloat(articuloActual.porcentaje_aplicar || "0");
          let nuevoPrecioVenta = "";

          if (!isNaN(nuevoCostoCompra) && !isNaN(porcentajeAplicar) && nuevoCostoCompra > 0) {
            nuevoPrecioVenta = (nuevoCostoCompra * (1 + porcentajeAplicar / 100)).toFixed(2);
          }

          const datosActualizar: any = {
            existencia: nuevaExistencia.toString(),
            costo_compra: item.costo_unit_neto,
          };

          // Solo actualizar precio_venta si se pudo calcular
          if (nuevoPrecioVenta) {
            datosActualizar.precio_venta = nuevoPrecioVenta;
          }

          const { error: updateStockError } = await supabase
            .from("articulos")
            .update(datosActualizar)
            .eq("id", articuloActual.id);

          if (updateStockError) {
            console.error(
              `Error al actualizar stock del artículo ${item.codint || item.codbar || item.articulo_id}:`,
              updateStockError
            );
          }
        }
      }

      router.push("/auth/rut-compras/lista-compras");
    } catch (err) {
      alert("Error inesperado al guardar la compra");
      console.error(err);
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {compraId ? "Editar Compra" : "Nueva Compra"}
        </h2>
        <Link href="/auth/rut-compras/lista-compras">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={guardarCompra} className="space-y-6">
        {/* Información del Proveedor */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="proveedor">Proveedor *</Label>
                <select
                  id="proveedor"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.proveedor}>
                      {prov.proveedor}
                    </option>
                  ))}
                </select>
              </div>
              {esModoNuevo && (
                <div className="grid gap-2">
                  <Label htmlFor="numero-factura">Número de Factura</Label>
                  <Input
                    id="numero-factura"
                    type="text"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    placeholder="Ingrese el número de factura..."
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buscador de Artículos */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Artículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="codbar-scan">Codbar (lector)</Label>
                <Input
                  id="codbar-scan"
                  value={codbarScan}
                  onChange={(e) => setCodbarScan(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    procesarCodbar(codbarScan);
                  }}
                  placeholder="Escanea el código de barras..."
                  autoComplete="off"
                />
              </div>
              <Label htmlFor="buscar-articulo">
                Buscar Artículo (por código o nombre)
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="buscar-articulo"
                  value={busquedaArticulo}
                  onChange={(e) => setBusquedaArticulo(e.target.value)}
                  placeholder="Escribe el código o nombre del artículo..."
                  className="pl-10"
                  autoComplete="off"
                />
                {busquedaArticulo &&
                  buscarArticulo(busquedaArticulo).length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {buscarArticulo(busquedaArticulo).map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => seleccionarArticulo(art)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {art.nombre_articulo}
                          </div>
                          {art.descripcion && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 italic mt-1">
                              {art.descripcion}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex flex-wrap gap-2">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              Código: {art.codint}
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              Stock: {art.existencia}
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                              Costo: ${art.costo_compra}
                            </span>
                            {art.familia && (
                              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                {art.familia}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Artículos Agregados */}
        <Card>
          <CardHeader>
            <CardTitle>Artículos de la Compra ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg">No hay artículos agregados.</p>
                <p className="text-sm mt-1">Busca y selecciona artículos arriba para comenzar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full border-collapse bg-white dark:bg-gray-800">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Artículo
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Costo Unit.
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Descuento %
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Costo Unit. con Descuento
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Otros Cargos por und
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Costo Unit. Neto
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item, index) => {
                      const articuloActual = item.articulo_id
                        ? articulos.find((a) => a.id === item.articulo_id)
                        : null;
                      const stockDisponible = articuloActual
                        ? parseFloat(articuloActual.existencia) || 0
                        : 0;
                      const costoUnit = parseFloat(item.costo_compra) || 0;
                      const descuento = parseFloat(item.descuento || "0") || 0;
                      const otrosCargosItem = parseFloat(item.otros_cargos_item || "0") || 0;
                      const cantidad = item.cant || 0;
                      const costoUnitConDescuento = costoUnit - (costoUnit * descuento / 100);
                      const otrosCargosUnit = cantidad > 0 ? otrosCargosItem / cantidad : 0;
                      const costoUnitNeto = costoUnitConDescuento + otrosCargosUnit;
                      const subtotal = costoUnitNeto * cantidad;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.codint}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {item.nombre_articulo}
                              </div>
                              {item.descripcion && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 italic">
                                  {item.descripcion}
                                </div>
                              )}
                              {item.familia && (
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                                  <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                    {item.familia}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-sm font-semibold px-2 py-1 rounded ${stockDisponible > 10
                                ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                                : stockDisponible > 0
                                  ? "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
                                  : "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30"
                                }`}
                            >
                              {stockDisponible}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              min="1"
                              value={item.cant}
                              onChange={(e) =>
                                actualizarItem(
                                  item.id!,
                                  "cant",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-gray-500 dark:text-gray-400">$</span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.costo_compra || ""}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  // Reemplazar comas por puntos
                                  let value = inputValue.replace(",", ".");
                                  // Solo permitir números y un punto decimal
                                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                    setItems((prevItems) => {
                                      return prevItems.map((prevItem) => {
                                        if (prevItem.id === item.id) {
                                          const desc = prevItem.descuento || "0";
                                          const costoNum = parseFloat(value);
                                          const updatedItem: ItemCompra = {
                                            ...prevItem,
                                            costo_compra: value,
                                          };

                                          // El costo_unit_neto se actualizará automáticamente en el useEffect
                                          // que incluye los otros cargos

                                          return updatedItem;
                                        }
                                        return prevItem;
                                      });
                                    });
                                  }
                                }}
                                className="w-24 text-right"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.descuento || ""}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  // Reemplazar comas por puntos
                                  let value = inputValue.replace(",", ".");
                                  // Solo permitir números y un punto decimal
                                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                    const desc = parseFloat(value);
                                    // Validar que esté entre 0 y 100
                                    if (value === "" || (!isNaN(desc) && desc >= 0 && desc <= 100)) {
                                      setItems((prevItems) => {
                                        return prevItems.map((prevItem) => {
                                          if (prevItem.id === item.id) {
                                            const costoUnit = prevItem.costo_compra || "0";
                                            const updatedItem: ItemCompra = {
                                              ...prevItem,
                                              descuento: value,
                                            };

                                            // El costo_unit_neto se actualizará automáticamente en el useEffect
                                            // que incluye los otros cargos

                                            return updatedItem;
                                          }
                                          return prevItem;
                                        });
                                      });
                                    }
                                  }
                                }}
                                className="w-20 text-right"
                                placeholder="0"
                              />
                              <span className="text-gray-500 dark:text-gray-400">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-base text-gray-700 dark:text-gray-300">
                              ${costoUnitConDescuento.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                              ${otrosCargosUnit.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-base text-gray-700 dark:text-gray-300">
                              ${costoUnitNeto.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                              ${subtotal.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarItem(item.id!)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impuestos y Total */}
        {items.length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6 space-y-4">
              {/* Input de Impuestos */}
              <div className="flex items-center justify-between">
                <Label htmlFor="impuestos" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Impuestos:
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="impuestos"
                    type="text"
                    inputMode="decimal"
                    value={impuestos}
                    onChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setImpuestos(value);
                      }
                    }}
                    className="w-32 text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Input de Otros Cargos */}
              <div className="flex items-center justify-between">
                <Label htmlFor="otros-cargos" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Otros Cargos:
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="otros-cargos"
                    type="text"
                    inputMode="decimal"
                    value={otrosCargos}
                    onChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setOtrosCargos(value);
                      }
                    }}
                    className="w-32 text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Total de la Compra */}
              <div className="flex items-center justify-between pt-4 border-t border-indigo-200 dark:border-indigo-700">
                <div>
                  <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    Total de la Compra:
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {items.length} {items.length === 1 ? "artículo" : "artículos"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          <Link href="/auth/rut-compras/lista-compras">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={guardando || items.length === 0}>
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {compraId ? "Actualizar Compra" : "Guardar Compra"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
