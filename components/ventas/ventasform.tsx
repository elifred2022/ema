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

type ItemVenta = {
  id?: string; // ID único para React key
  codbar: string;
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  familia: string;
  cant: number;
  precio_venta: string;
  articulo_id?: string; // ID del artículo en la tabla articulos
};

type Cliente = {
  id: number;
  nombre: string;
};

type Articulo = {
  id: string;
  codbar: string;
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  familia: string;
  precio_venta: string;
  existencia: string;
};

export default function VentasForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cliente, setCliente] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ventaId, setVentaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busquedaArticulo, setBusquedaArticulo] = useState("");
  const [codbarScan, setCodbarScan] = useState("");

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

  const idVentaParam = searchParams.get("id");

  // Cargar clientes, artículos y datos de venta si existe
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from("clientes")
          .select("id, nombre")
          .order("nombre", { ascending: true });

        if (clientesError) {
          setError("Error al cargar clientes: " + clientesError.message);
        } else {
          setClientes(clientesData || []);
        }

        // Cargar artículos
        const { data: articulosData, error: articulosError } = await supabase
          .from("articulos")
          .select("id, codbar, codint, nombre_articulo, descripcion, familia, precio_venta, existencia")
          .order("nombre_articulo", { ascending: true });

        if (articulosError) {
          console.error("Error al cargar artículos:", articulosError);
        } else {
          setArticulos(articulosData || []);
        }

        // Si hay un ID de venta, cargar datos para editar
        if (idVentaParam) {
          const id = parseInt(idVentaParam);
          if (!isNaN(id)) {
            setVentaId(id);
            const { data: ventaData, error: ventaError } = await supabase
              .from("ventas")
              .select("id, cliente, items, total")
              .eq("id", id)
              .single();

            if (ventaData && !ventaError) {
              setCliente(ventaData.cliente || "");
              // Parsear items si vienen como string JSON
              const itemsParsed = typeof ventaData.items === 'string' 
                ? JSON.parse(ventaData.items) 
                : ventaData.items;
              // Agregar IDs únicos a los items si no los tienen
              const itemsConIds = (itemsParsed || []).map((item: ItemVenta) => ({
                ...item,
                id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              }));
              setItems(itemsConIds);
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
  }, [supabase, idVentaParam]);

  // Calcular total
  const calcularTotal = () => {
    return items.reduce((sum, item) => {
      const precio = parseFloat(item.precio_venta) || 0;
      const cantidad = item.cant || 0;
      return sum + precio * cantidad;
    }, 0);
  };

  // Eliminar item
  const eliminarItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Actualizar item
  const actualizarItem = (itemId: string, campo: keyof ItemVenta, valor: string | number) => {
    const nuevosItems = items.map((item) =>
      item.id === itemId ? { ...item, [campo]: valor } : item
    );
    setItems(nuevosItems);
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
      const nuevoItem: ItemVenta = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        codbar: articulo.codbar,
        codint: articulo.codint,
        nombre_articulo: articulo.nombre_articulo,
        descripcion: articulo.descripcion || "",
        familia: articulo.familia || "",
        cant: 1,
        precio_venta: articulo.precio_venta || "0.00",
        articulo_id: articulo.id,
      };
      setItems([...items, nuevoItem]);
    }
    // Limpiar búsqueda
    setBusquedaArticulo("");
  };

  // Guardar venta
  const guardarVenta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente) {
      alert("Por favor selecciona un cliente");
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
        parseFloat(item.precio_venta) <= 0
    );

    if (itemsInvalidos) {
      alert("Por favor completa todos los campos de los artículos correctamente");
      return;
    }

    // Validar stock disponible antes de guardar
    for (const item of items) {
      if (item.articulo_id) {
        const articuloActual = articulos.find((a) => a.id === item.articulo_id);
        if (articuloActual) {
          const existenciaActual = parseFloat(articuloActual.existencia) || 0;
          const cantidadVenta = item.cant || 0;
          if (cantidadVenta > existenciaActual) {
            alert(
              `No hay stock suficiente para "${item.nombre_articulo}". Stock disponible: ${existenciaActual}, Cantidad solicitada: ${cantidadVenta}`
            );
            return;
          }
        }
      }
    }

    setGuardando(true);
    setError(null);

    try {
      const total = calcularTotal().toFixed(2);

      // Limpiar el campo 'id' de los items antes de guardar (solo es para React)
      const itemsParaGuardar = items.map(({ id, ...item }) => item);

      if (ventaId) {
        // Actualizar venta existente
        const { error: updateError } = await supabase
          .from("ventas")
          .update({
            cliente,
            items: itemsParaGuardar,
            total,
          })
          .eq("id", ventaId);

        if (updateError) {
          alert("Error al actualizar la venta: " + updateError.message);
          setGuardando(false);
          return;
        }
      } else {
        // Crear nueva venta (el ID se genera automáticamente en Supabase)
        const { error: insertError } = await supabase.from("ventas").insert({
          cliente,
          items: itemsParaGuardar,
          total,
        });

        if (insertError) {
          alert("Error al crear la venta: " + insertError.message);
          setGuardando(false);
          return;
        }

        // Actualizar stock de artículos solo para nuevas ventas (restar del stock)
        for (const item of items) {
          if (item.articulo_id) {
            // Buscar el artículo actual para obtener su existencia
            const articuloActual = articulos.find((a) => a.id === item.articulo_id);
            if (articuloActual) {
              const existenciaActual = parseFloat(articuloActual.existencia) || 0;
              const cantidadVendida = item.cant || 0;
              const nuevaExistencia = existenciaActual - cantidadVendida;

              // Actualizar existencia en la tabla articulos
              const { error: updateStockError } = await supabase
                .from("articulos")
                .update({
                  existencia: nuevaExistencia.toString(),
                })
                .eq("id", item.articulo_id);

              if (updateStockError) {
                console.error(
                  `Error al actualizar stock del artículo ${item.codint} ${item.codbar}:`,
                  updateStockError
                );
                // Continuar con los demás artículos aunque falle uno
              }
            }
          } else {
            // Si no tiene articulo_id, intentar buscar por codint o codbar
            const articuloPorCodigo = articulos.find((a) => a.codint === item.codint);
            if (articuloPorCodigo) {
              const existenciaActual = parseFloat(articuloPorCodigo.existencia) || 0;
              const cantidadVendida = item.cant || 0;
              const nuevaExistencia = existenciaActual - cantidadVendida;

              const { error: updateStockError } = await supabase
                .from("articulos")
                .update({
                  existencia: nuevaExistencia.toString(),
                })
                .eq("codint", item.codint);

              if (updateStockError) {
                console.error(
                  `Error al actualizar stock del artículo ${item.codint}:`,
                  updateStockError
                );
              }
            }
          }
        }
      }

      router.push("/auth/rut-ventas/lista-ventas");
    } catch (err) {
      alert("Error inesperado al guardar la venta");
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

  const total = calcularTotal();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {ventaId ? "Editar Venta" : "Nueva Venta"}
        </h2>
        <Link href="/auth/rut-ventas/lista-ventas">
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

      <form onSubmit={guardarVenta} className="space-y-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <select
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cli) => (
                    <option key={cli.id} value={cli.nombre}>
                      {cli.nombre}
                    </option>
                  ))}
                </select>
              </div>
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
                              Precio: ${art.precio_venta}
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
            <CardTitle>Artículos de la Venta ({items.length})</CardTitle>
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
                        Codbar
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
                        Precio Unit.
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
                      const subtotal =
                        (parseFloat(item.precio_venta) || 0) * (item.cant || 0);
                      const stockInsuficiente = stockDisponible < item.cant;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            stockInsuficiente
                              ? "bg-red-50/50 dark:bg-red-900/10"
                              : index % 2 === 0
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
                            <Input
                              type="text"
                              value={item.codbar ?? ""}
                              onChange={(e) =>
                                actualizarItem(item.id!, "codbar", e.target.value)
                              }
                              className="w-32 font-mono text-sm"
                            />
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
                              className={`text-sm font-semibold px-2 py-1 rounded ${
                                stockInsuficiente
                                  ? "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                                  : stockDisponible > 10
                                  ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                                  : "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
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
                              className={`w-20 text-center ${
                                stockInsuficiente
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                            />
                            {stockInsuficiente && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Stock insuficiente
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-gray-500 dark:text-gray-400">$</span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.precio_venta}
                                onChange={(e) => {
                                  const value = e.target.value.replace(",", ".");
                                  if (/^\d*\.?\d*$/.test(value)) {
                                    actualizarItem(item.id!, "precio_venta", value);
                                  }
                                }}
                                className="w-24 text-right"
                              />
                            </div>
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

        {/* Total */}
        {items.length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    Total de la Venta:
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {items.length} {items.length === 1 ? "artículo" : "artículos"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          <Link href="/auth/rut-ventas/lista-ventas">
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
                {ventaId ? "Actualizar Venta" : "Guardar Venta"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
