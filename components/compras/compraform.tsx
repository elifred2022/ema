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
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  familia: string;
  cant: number;
  costo_compra: string;
  articulo_id?: string; // ID del artículo en la tabla articulos
};

type Proveedor = {
  id: number;
  proveedor: string;
};

type Articulo = {
  id: string;
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
  const [busquedaArticulo, setBusquedaArticulo] = useState<{ [key: number]: string }>({});

  const idCompraParam = searchParams.get("id");

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
          .select("id, codint, nombre_articulo, descripcion, familia, costo_compra, existencia")
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
              .select("id, proveedor, items, total")
              .eq("id", id)
              .single();

            if (compraData && !compraError) {
              setProveedor(compraData.proveedor || "");
              // Parsear items si vienen como string JSON
              const itemsParsed = typeof compraData.items === 'string' 
                ? JSON.parse(compraData.items) 
                : compraData.items;
              // Agregar IDs únicos a los items si no los tienen
              const itemsConIds = (itemsParsed || []).map((item: ItemCompra) => ({
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
  }, [supabase, idCompraParam]);

  // Calcular total
  const calcularTotal = () => {
    return items.reduce((sum, item) => {
      const costo = parseFloat(item.costo_compra) || 0;
      const cantidad = item.cant || 0;
      return sum + costo * cantidad;
    }, 0);
  };

  // Agregar nuevo item
  const agregarItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID único
        codint: "",
        nombre_articulo: "",
        descripcion: "",
        familia: "",
        cant: 1,
        costo_compra: "0.00",
      },
    ]);
  };

  // Eliminar item
  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Actualizar item
  const actualizarItem = (index: number, campo: keyof ItemCompra, valor: string | number) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  // Buscar artículo por código o nombre
  const buscarArticulo = (busqueda: string) => {
    if (!busqueda.trim()) return [];
    const busquedaLower = busqueda.toLowerCase();
    return articulos.filter(
      (art) =>
        art.codint.toLowerCase().includes(busquedaLower) ||
        art.nombre_articulo.toLowerCase().includes(busquedaLower)
    );
  };

  // Seleccionar artículo y auto-completar campos
  const seleccionarArticulo = (index: number, articulo: Articulo) => {
    const nuevosItems = [...items];
    nuevosItems[index] = {
      ...nuevosItems[index],
      codint: articulo.codint,
      nombre_articulo: articulo.nombre_articulo,
      descripcion: articulo.descripcion || "",
      familia: articulo.familia || "",
      costo_compra: articulo.costo_compra || "0.00",
      articulo_id: articulo.id,
    };
    setItems(nuevosItems);
    // Limpiar búsqueda
    setBusquedaArticulo({ ...busquedaArticulo, [index]: "" });
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
        });

        if (insertError) {
          alert("Error al crear la compra: " + insertError.message);
          setGuardando(false);
          return;
        }

        // Actualizar stock de artículos solo para nuevas compras
        for (const item of items) {
          if (item.articulo_id) {
            // Buscar el artículo actual para obtener su existencia
            const articuloActual = articulos.find((a) => a.id === item.articulo_id);
            if (articuloActual) {
              const existenciaActual = parseFloat(articuloActual.existencia) || 0;
              const cantidadComprada = item.cant || 0;
              const nuevaExistencia = existenciaActual + cantidadComprada;

              // Actualizar existencia y costo_compra en la tabla articulos
              const { error: updateStockError } = await supabase
                .from("articulos")
                .update({
                  existencia: nuevaExistencia.toString(),
                  costo_compra: item.costo_compra,
                })
                .eq("id", item.articulo_id);

              if (updateStockError) {
                console.error(
                  `Error al actualizar stock del artículo ${item.codint}:`,
                  updateStockError
                );
                // Continuar con los demás artículos aunque falle uno
              }
            }
          } else {
            // Si no tiene articulo_id, intentar buscar por codint
            const articuloPorCodigo = articulos.find((a) => a.codint === item.codint);
            if (articuloPorCodigo) {
              const existenciaActual = parseFloat(articuloPorCodigo.existencia) || 0;
              const cantidadComprada = item.cant || 0;
              const nuevaExistencia = existenciaActual + cantidadComprada;

              const { error: updateStockError } = await supabase
                .from("articulos")
                .update({
                  existencia: nuevaExistencia.toString(),
                  costo_compra: item.costo_compra,
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

  const total = calcularTotal();

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
            </div>
          </CardContent>
        </Card>

        {/* Artículos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Artículos de la Compra</CardTitle>
              <Button
                type="button"
                onClick={agregarItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Artículo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No hay artículos agregados. Haz clic en "Agregar Artículo" para comenzar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={item.id || `item-${index}`} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Artículo {index + 1}</h3>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarItem(index)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Buscador de Artículos */}
                        <div className="grid gap-2 md:col-span-3">
                          <Label htmlFor={`buscar-${index}`}>
                            Buscar Artículo (por código o nombre)
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id={`buscar-${index}`}
                              value={busquedaArticulo[index] || ""}
                              onChange={(e) =>
                                setBusquedaArticulo({
                                  ...busquedaArticulo,
                                  [index]: e.target.value,
                                })
                              }
                              placeholder="Buscar por código o nombre..."
                              className="pl-10"
                            />
                            {busquedaArticulo[index] &&
                              buscarArticulo(busquedaArticulo[index]).length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {buscarArticulo(busquedaArticulo[index]).map((art) => (
                                    <button
                                      key={art.id}
                                      type="button"
                                      onClick={() => seleccionarArticulo(index, art)}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                    >
                                      <div className="font-medium">{art.nombre_articulo}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Código: {art.codint} | Stock: {art.existencia}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`codint-${index}`}>Código Interno *</Label>
                          <Input
                            id={`codint-${index}`}
                            value={item.codint}
                            onChange={(e) =>
                              actualizarItem(index, "codint", e.target.value)
                            }
                            required
                            placeholder="Código interno"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor={`nombre-${index}`}>Nombre del Artículo *</Label>
                          <Input
                            id={`nombre-${index}`}
                            value={item.nombre_articulo}
                            onChange={(e) =>
                              actualizarItem(index, "nombre_articulo", e.target.value)
                            }
                            required
                            placeholder="Nombre del artículo"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-3">
                          <Label htmlFor={`descripcion-${index}`}>Descripción</Label>
                          <Input
                            id={`descripcion-${index}`}
                            value={item.descripcion}
                            onChange={(e) =>
                              actualizarItem(index, "descripcion", e.target.value)
                            }
                            placeholder="Descripción del artículo"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`familia-${index}`}>Familia *</Label>
                          <Input
                            id={`familia-${index}`}
                            value={item.familia}
                            onChange={(e) =>
                              actualizarItem(index, "familia", e.target.value)
                            }
                            required
                            placeholder="Familia"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`cant-${index}`}>Cantidad *</Label>
                          <Input
                            id={`cant-${index}`}
                            type="number"
                            min="1"
                            value={item.cant}
                            onChange={(e) =>
                              actualizarItem(index, "cant", parseInt(e.target.value) || 1)
                            }
                            required
                          />
                          {item.articulo_id && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Stock actual:{" "}
                              {
                                articulos.find((a) => a.id === item.articulo_id)
                                  ?.existencia || "N/A"
                              }
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`costo-${index}`}>Costo de Compra *</Label>
                          <Input
                            id={`costo-${index}`}
                            type="text"
                            inputMode="decimal"
                            value={item.costo_compra}
                            onChange={(e) => {
                              const value = e.target.value.replace(",", ".");
                              if (/^\d*\.?\d*$/.test(value)) {
                                actualizarItem(index, "costo_compra", value);
                              }
                            }}
                            required
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-3">
                          <div className="text-right">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Subtotal: $
                            </span>
                            <span className="text-lg font-semibold">
                              {(
                                (parseFloat(item.costo_compra) || 0) * (item.cant || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">Total:</span>
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

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
