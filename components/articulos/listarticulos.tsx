"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Plus, Search, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, X, Save } from "lucide-react";


type Articulo = {
  id: string;
  created_at: string;
  codbar: string;
  codint: string;
  nombre_articulo: string;
  descripcion: string;
  costo_compra: string;
  porcentaje_aplicar: string;
  precio_venta: string;
  proveedor_sug: string;
  cod_proveedor: string;
  familia: string;
  existencia: string;
  situacion: string;

  // Agregá más campos si los usás en el .map()
};



export default function ListArticulos() {
  const [search, setSearch] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [editingArticulo, setEditingArticulo] = useState<Articulo | null>(null);
  const [ingresarArticulo, setIngresarArticulo] = useState<Articulo | null>(null);
  const [descontarArticulo, setDescontarArticulo] = useState<Articulo | null>(null);
  const [ocultarArticuloInactivo, setOcultarArticuloInactivo] = useState(false);

    //variables ingreso y egreso articulos
    const [ingresart, setIngresArt] = useState("");
    const [descontart, setDescontArt] = useState(""); // este es cantretiro en registro de egreso
    const [retira, setRetira] = useState("");
   
    const [motivo, setMotivo] = useState("");
    const [nombreprov, setNombreprov] = useState("");
    const [rto, setRto] = useState("");
    const [fact, setFact] = useState("");
    const [fecha_ent, setFecha_ent] = useState("");
    const [observacion, setObservacion] = useState("");
    
      
  
  const [formData, setFormData] = useState<Partial<Articulo>>({});
  const supabase = createClient();

  
  /* para que no desactive checkbox al reset pagia  Al montar, leé localStorage (solo se ejecuta en el navegador) */
    useEffect(() => {
     const savedInactivo = localStorage.getItem("ocultarArticuloInactivo");
     
   
     if (savedInactivo !== null) setOcultarArticuloInactivo(savedInactivo === "true");
     
   }, []);
   
   
     /* Cada vez que cambia, actualizá localStorage */
    useEffect(() => {
     localStorage.setItem("ocultarArticuloInactivo", String(ocultarArticuloInactivo));
   }, [ocultarArticuloInactivo]);
   
 
   

  // Cargar datos
  useEffect(() => {
    const fetchArticulos = async () => {
      const { data, error } = await supabase.from("articulos").select("*")
  
      if (error) console.error("Error cargando articulos:", error);
      else setArticulos(data);
    };
    fetchArticulos();
  }, [supabase]);






  // funcion para formatear las fechas
 function formatDate(dateString: string | null): string {
  if (!dateString) return "-";

  // Evitar que el navegador aplique zona horaria
  const parts = dateString.split("T")[0].split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // meses en JS van de 0 a 11
  const day = parseInt(parts[2]);

  const date = new Date(year, month, day); // Esto crea la fecha en hora local
  return date.toLocaleDateString("es-AR");
}

//Campos de tabla que son fecha para funcion filtrar
const dateFields: (keyof Articulo)[] = [
  "created_at",
  
];

//Filtro que también contempla las fechas
const filteredArticulos = articulos
  .filter((articulo) => {
    const s = search.trim().toLowerCase();   // la búsqueda, ya normalizada
    if (!s) return true;                     // si el input está vacío, no filtra nada

    return Object.entries(articulo).some(([key, value]) => {
      if (value === null || value === undefined) return false;

      // A) Comparar contra la versión texto “tal cual viene”
      if (String(value).toLowerCase().includes(s)) return true;

      // B) Si el campo es fecha, probar otras representaciones
      if (dateFields.includes(key as keyof Articulo)) {
        const isoDate = String(value).split("T")[0];          // YYYY-MM-DD
        const niceDate = formatDate(value as string);         // DD/MM/YYYY

        return (
          isoDate.toLowerCase().includes(s) ||
          niceDate.toLowerCase().includes(s)
        );
      }
      return false;
    });
  })
  .filter((articulo) => {
  if (ocultarArticuloInactivo && articulo.situacion === "inactivo") return false;
  
  return true;
});

function renderValue(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    value === ""
  ) {
    return "-";
  }

  return String(value);
}

// Calcular automáticamente el precio de venta si cambia costo o porcentaje MODAL EDITAR
useEffect(() => {
  const costo = parseFloat(formData.costo_compra ?? "0");
  const porcentaje = parseFloat(formData.porcentaje_aplicar ?? "0");

  if (!isNaN(costo) && !isNaN(porcentaje)) {
    const nuevoPrecio = costo * (1 + porcentaje / 100);
    setFormData((prev) => ({
      ...prev,
      precio_venta: nuevoPrecio.toFixed(2),
    }));
  }
}, [formData.costo_compra, formData.porcentaje_aplicar]);

// Calcular automáticamente el precio_venta en ingreso si cambia costo o porcentaje MODAL INGRESO ARTICULO
useEffect(() => {
  if (!ingresarArticulo) return; // solo si hay modal abierto

  const costo = parseFloat(formData.costo_compra ?? "0");
  const porcentaje = parseFloat(formData.porcentaje_aplicar ?? "0");

  if (!isNaN(costo) && !isNaN(porcentaje)) {
    const nuevoPrecio = costo * (1 + porcentaje / 100);
    setFormData((prev) => ({
      ...prev,
      precio_venta: nuevoPrecio.toFixed(2),
    }));
  }
}, [formData.costo_compra, formData.porcentaje_aplicar, ingresarArticulo]);


const headerClass =
  "px-4 py-3 border text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white whitespace-nowrap sticky top-0"; // ← evita saltos de línea y fija el encabezado
const cellClass =
  "px-4 py-3 border align-top text-sm text-justify whitespace-pre-wrap break-words bg-white dark:bg-gray-800";

  return (
    <>
    <div className="flex-2 w-full overflow-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        {/* Header con navegación */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Link href="/protected">
            <Button 
              variant="outline"
              className="flex items-center gap-2 border-2 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
           
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Módulo Artículos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu inventario de artículos</p>
        </div>

        {/* Botón crear nuevo artículo */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <Link href="/auth/rut-articulos/form-crear-articulo">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus className="h-5 w-5" />
              Crear nuevo artículo
            </Button>
          </Link>

        {/*
           <Link
              href="/auth/list-egresoart"
              className="inline-block px-4 py-2 mb-4 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
            >
              Registros de Egresos
            </Link>

             <Link
              href="/auth/list-ingresoart"
              className="inline-block px-4 py-2 mb-4 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
            >
              Registros de ingresos
            </Link>
        
        */}   

        
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={ocultarArticuloInactivo}
              onChange={() => setOcultarArticuloInactivo((v) => !v)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ocultar artículos inactivos
            </span>
          </label>
        </div>
     
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
          <tr>

           
            <th  className={headerClass}>Accion</th>
             <th  className={headerClass}>Id</th>
             <th  className={headerClass}>Fecha de alta</th>
              <th  className={headerClass}>Cod barra</th>
            <th  className={headerClass}>Cod int</th>
            <th  className={headerClass}>Articulo</th>
            <th  className={headerClass}>Descripcion</th>
            <th  className={headerClass}>Familia</th>
            <th  className={headerClass}>Prov. sug.</th>
            <th  className={headerClass}>Cod. porv. sug.</th>
             <th  className={headerClass}>Costo de compra</th>
             <th  className={headerClass}>Porcentaje aplicable</th>
            <th  className={headerClass}>Precio de venta</th>
             <th  className={headerClass}>Existencia</th>
            <th  className={headerClass}>Situacion</th>       
              
          </tr>
        </thead>
        <tbody>
          {filteredArticulos.map((articulo) => (
            <tr key={articulo.id}>
              <td className={cellClass}>
                <div className="flex flex-nowrap gap-1 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 whitespace-nowrap p-2"
                    title="Ingresar artículo"
                    onClick={() => {
                        setIngresArt(""); // limpiar antes de abrir
                        setIngresarArticulo(articulo);
                        setFormData({
                        created_at: articulo.created_at,
                        id: articulo.id,
                        codint: articulo.codint,
                        nombre_articulo: articulo.nombre_articulo,
                        descripcion: articulo.descripcion,
                        existencia: articulo.existencia,
                        proveedor_sug: articulo.proveedor_sug,
                        cod_proveedor: articulo.cod_proveedor,
                        familia: articulo.familia,
                        situacion: articulo.situacion,
                        costo_compra: articulo.costo_compra,
                        porcentaje_aplicar: articulo.porcentaje_aplicar,
                        precio_venta: articulo.precio_venta,
                       

                      });
                    }}
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center border-orange-500 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap p-2"
                    title="Egresar artículo"
                    onClick={() => {
                      setDescontArt(""); // limpiar antes de abrir
                      setDescontarArticulo(articulo);
                      setFormData({
                        created_at: articulo.created_at,
                        id: articulo.id,
                        codint: articulo.codint,
                        nombre_articulo: articulo.nombre_articulo,
                        descripcion: articulo.descripcion,
                        existencia: articulo.existencia,
                        proveedor_sug: articulo.proveedor_sug,
                        cod_proveedor: articulo.cod_proveedor,
                        familia: articulo.familia,
                        situacion: articulo.situacion,
                        costo_compra: articulo.costo_compra,
                        porcentaje_aplicar: articulo.porcentaje_aplicar,
                        precio_venta: articulo.precio_venta,
                      });
                    }}
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap p-2"
                    title="Editar artículo"
                    onClick={() => {
                      setEditingArticulo(articulo);
                      setFormData({
                        created_at: articulo.created_at,
                        id: articulo.id,
                        codint: articulo.codint,
                        nombre_articulo: articulo.nombre_articulo,
                        descripcion: articulo.descripcion,
                        existencia: articulo.existencia,
                        proveedor_sug: articulo.proveedor_sug,
                        cod_proveedor: articulo.cod_proveedor,
                        familia: articulo.familia,
                        situacion: articulo.situacion,
                        costo_compra: articulo.costo_compra,
                        porcentaje_aplicar: articulo.porcentaje_aplicar,
                        precio_venta: articulo.precio_venta,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center border-red-500 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap p-2"
                    title="Eliminar artículo"
                    onClick={async () => {
                      const confirm = window.confirm(
                        `¿Estás seguro de que querés eliminar el articulo ${articulo.id} ${articulo.nombre_articulo} ?`
                      );
                      if (!confirm) return;

                      const { error } = await supabase.from("articulos").delete().eq("id", articulo.id);
                      if (error) {
                        alert("Error al eliminar");
                        console.error(error);
                      } else {
                        alert("articulo eliminado");
                        const { data } = await supabase.from("articulos").select("*");
                        if (data) setArticulos(data);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  
                </div></td>

                <td className={cellClass}>{articulo.id}</td>
              <td className={cellClass}>{formatDate(articulo.created_at) || "-"}</td>
              <td className={cellClass}>{renderValue(articulo.codbar)}</td>
              <td className={cellClass}>{renderValue(articulo.codint)}</td>
                <td className={cellClass}>{articulo.nombre_articulo}</td>
                <td className={cellClass}>{articulo.descripcion}</td>
                <td className={cellClass}>{articulo.familia}</td>
                <td className={cellClass}>{articulo.proveedor_sug}</td>
                <td className={cellClass}>{articulo.cod_proveedor}</td>
                <td className={cellClass}>{renderValue(articulo.costo_compra)}</td>
                <td className={cellClass}>{articulo.porcentaje_aplicar}</td>
                <td className={cellClass}>{articulo.precio_venta}</td>
                <td className={cellClass}>{articulo.existencia}</td>
                <td className={cellClass}>{articulo.situacion}</td>

            </tr>
          ))}
        </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {/* MODAL EDITAR */}
      {editingArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Editar artículo #{editingArticulo.id}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingArticulo(null)}
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
           
            
            
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold">
                Artículo: {editingArticulo.nombre_articulo}
              </span>
            </div>

            
            <label className="block mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Artículo</p>
              <Input
                className="w-full"
                type="text"
                value={formData.nombre_articulo ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_articulo: e.target.value})
                }
              />
            </label>

            <label className="block mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Descripción</p>
              <Input
                className="w-full"
                type="text"
                value={formData.descripcion ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value})
                }
              />
            </label>

            <label className="block mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Familia</p>
              <Input
                className="w-full"
                type="text"
                value={formData.familia ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, familia: e.target.value})
                }
              />
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Prov. sugerido</p>
                <Input
                  className="w-full"
                  type="text"
                  value={formData.proveedor_sug ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, proveedor_sug: e.target.value})
                  }
                />
              </label>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Cod. prov.</p>
                <Input
                  className="w-full"
                  type="text"
                  value={formData.cod_proveedor ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cod_proveedor: e.target.value})
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Costo compra</p>
                <Input
                  className="w-full"
                  type="number"
                  value={formData.costo_compra ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, costo_compra: e.target.value})
                  }
                />
              </label>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">% aplicable</p>
                <Input
                  className="w-full"
                  type="number"
                  value={formData.porcentaje_aplicar ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, porcentaje_aplicar: e.target.value})
                  }
                />
              </label>
            </div>

            <label className="block mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Precio de venta</p>
              <Input
                className="w-full bg-gray-100 dark:bg-gray-700"
                type="text"
                value={formData.precio_venta ?? ""}
                readOnly
              />
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Existencia</p>
                <Input
                  className="w-full"
                  type="text"
                  value={formData.existencia ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, existencia: e.target.value})
                  }
                />
              </label>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Situación</p>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.situacion ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, situacion: e.target.value })
                  }
                >
                  <option value="">Seleccionar</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setEditingArticulo(null)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                      if (
                        formData.costo_compra === undefined ||
                        formData.costo_compra === null ||
                        formData.costo_compra.toString().trim() === ""
                      ) {
                        alert("El campo 'Costo de compra' no puede estar vacío. Si no tiene valor, usá 0.");
                        return;
                      }

                      const { error } = await supabase
                        .from("articulos")
                        .update(formData)
                        .eq("id", editingArticulo.id);

                      if (error) {
                        alert("Error actualizando");
                        console.error(error);
                      } else {
                        alert("Actualizado correctamente");
                        setEditingArticulo(null);
                        setFormData({});
                        const { data } = await supabase.from("articulos").select("*");
                        if (data) setArticulos(data);
                      }
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
            </div>
          </div>
        </div>
      )}
        
       {ingresarArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Ingresar artículo #{ingresarArticulo.id}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIngresarArticulo(null)}
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg grid grid-cols-2 gap-3">
            <div>
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Código:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{ingresarArticulo.codbar}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Código:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{ingresarArticulo.codint}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Stock actual:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{ingresarArticulo.existencia}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Artículo:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{ingresarArticulo.nombre_articulo}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Precio de venta:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">$ {ingresarArticulo.precio_venta}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Cantidad a ingresar</p>
                <Input
                  className="w-full"
                  type="text"
                  inputMode="numeric"
                  value={ingresart}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setIngresArt(value);
                  }}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Proveedor</p>
                  <Input
                    className="w-full"
                    type="text"
                    required
                    value={nombreprov}
                    onChange={(e) => setNombreprov(e.target.value)}
                  />
                </label>

                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Factura</p>
                  <Input
                    className="w-full"
                    type="text"
                    inputMode="numeric"
                    value={fact}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) setFact(value);
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Remito</p>
                  <Input
                    className="w-full"
                    type="text"
                    inputMode="numeric"
                    value={rto}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) setRto(value);
                    }}
                  />
                </label>

                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Fecha recibido</p>
                  <Input
                    className="w-full"
                    type="date"
                    required
                    value={fecha_ent}
                    onChange={(e) => setFecha_ent(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Costo de compra</p>
                  <Input
                    className="w-full"
                    type="number"
                    value={formData.costo_compra ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        costo_compra: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="block">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Observación</p>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Precio de venta (calculado)</p>
                <Input
                  className="w-full bg-gray-100 dark:bg-gray-700"
                  type="text"
                  readOnly
                  value={formData.precio_venta ?? ""}
                />
              </label>
            </div>


                    


            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setIngresarArticulo(null)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                    const cantExist = Number(ingresarArticulo.existencia ?? 0);
                    const cantIngreso = Number(ingresart ?? 0);

                    if (cantIngreso <= 0) {
                      alert("La cantidad a ingresar debe ser mayor a 0");
                      return;
                    }

                    if (nombreprov.trim() === "") {
                      alert("El campo Proveedor no puede estar vacío");
                      return;
                    }

                    if (fact.trim() === "") {
                      alert("El campo Factura (Fact.) no puede estar vacío");
                      return;
                    }

                    if (rto.trim() === "") {
                      alert("El campo Remito (Rto.) no puede estar vacío");
                      return;
                    }

                    if (fecha_ent.trim() === "") {
                      alert("Falta fecha de ingreso");
                      return;
                    }

                    if (observacion.trim() === "") {
                      alert("Fue observado si o no?");
                      return;
                    }

                   
                    const nuevaExistencia = cantExist + cantIngreso;

                  

                    // 1. Actualizar existencia y precio venta en tabla articulos
                   
                    const { error: updateError } = await supabase
                    .from("articulos")
                    .update({
                      existencia: nuevaExistencia,
                      costo_compra: formData.costo_compra,
                      porcentaje_aplicar: formData.porcentaje_aplicar,
                      precio_venta: formData.precio_venta, // ← esto es lo que faltaba
                    })
                    .eq("id", ingresarArticulo.id);

                    if (updateError) {
                      alert("Error al actualizar el stock y precio de venta");
                      console.error(updateError);
                      return;
                    }

                    

                    // 2. Insertar en ingarticulos
                    const { error: insertError } = await supabase.from("ingarticulos").insert({
                    codint: ingresarArticulo.codint,
                    codbar: ingresarArticulo.codbar,
                    nombre_articulo: ingresarArticulo.nombre_articulo,
                    descripcion: ingresarArticulo.descripcion,
                    ingresart: cantIngreso,
                    nombreprov,
                    rto,
                    fact,
                    fecha_ent,
                    observacion,

                    });

                    if (insertError) {
                    alert("Stock actualizado, pero error al guardar el ingreso.");
                    console.error(insertError);
                    } else {
                    alert("Ingreso registrado correctamente");
                    }

                    setIngresarArticulo(null);
                    setFormData({});
                    setNombreprov("");
                    setFact("");
                    setRto("");
                    setIngresArt("");
                    setFecha_ent("");
                    setObservacion("");

                    const { data } = await supabase.from("articulos").select("*");
                    if (data) setArticulos(data);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )} 
       {descontarArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Salida de artículo #{descontarArticulo.id}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescontarArticulo(null)}
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Código:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{descontarArticulo.codint}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Stock actual:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{descontarArticulo.existencia}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Artículo:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{descontarArticulo.nombre_articulo}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Cantidad a descontar</p>
                <Input
                  className="w-full"
                  type="text"
                  inputMode="numeric"
                  value={descontart}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setDescontArt(value);
                  }}
                />
              </label>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Retira</p>
                <Input
                  className="w-full"
                  type="text"
                  required
                  value={retira}
                  onChange={(e) => setRetira(e.target.value)}
                />
              </label>

              <label className="block">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Motivo</p>
                <Input
                  className="w-full"
                  type="text"
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </label>
            </div>
             

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setDescontarArticulo(null)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                    const cantExist = Number(descontarArticulo.existencia ?? 0);
                    const cantEgreso = Number(descontart ?? 0);

                     if (cantEgreso <= 0) {
                    alert("La cantidad a descontar debe ser mayor a 0");
                    return;
                    }

                     if (cantEgreso > cantExist) {
                    alert("No hay suficiente stock para realizar el egreso");
                    return;
                    }

                     if (retira.trim() === "") {
                      alert("El campo Retira no puede estar vacío");
                      return;
                    }

                     if (motivo.trim() === "") {
                      alert("El campo motivo no puede estar vacío");
                      return;
                    }

                  

                   

                    const nuevaExistencia = cantExist - cantEgreso;

                    // 1. Actualizar existencia
                    const { error: updateError } = await supabase
                    .from("articulos")
                    .update({ existencia: nuevaExistencia })
                    .eq("id", descontarArticulo.id);

                    if (updateError) {
                    alert("Error al actualizar el stock");
                    console.error(updateError);
                    return;
                    }

                      // 2. Insertar en egarticulos

                const { error: insertError } = await supabase.from("egarticulos").insert({
                    codint: descontarArticulo.codint,
                    nombre_articulo: descontarArticulo.nombre_articulo,
                    descripcion: descontarArticulo.descripcion,
                    descontart: cantEgreso,
                    retira,
                    motivo,
                 
                    });

                    if (insertError) {
                    alert("Stock actualizado, pero error al guardar el egreso.");
                    console.error(insertError);
                    } else {
                    alert("Egreso registrado correctamente");
                    }

                    setDescontarArticulo(null);
                    setFormData({});
                    setRetira("");
                    setMotivo("");
                    setDescontArt("");

                  
                    

                    const { data } = await supabase.from("articulos").select("*");
                    if (data) setArticulos(data);
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}