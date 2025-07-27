"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";


type Articulo = {
  id: string;
  created_at: string;
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
  "px-2 py-1 border text-xs font-semibold bg-gray-100 whitespace-nowrap"; // ← evita saltos de línea
const cellClass =
  "px-2 py-1 border align-top text-sm text-justify whitespace-pre-wrap break-words";

  return (
    <div className="flex-2 w-full overflow-auto p-2">
        <div className="flex flex-wrap gap-4 items-center" >
             <Link
              href="/protected"
              className="inline-block px-4 py-2 mb-4 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
            >
              Home
            </Link>
           
        </div>
           
    <h1 className="text-xl font-bold mb-4">Modulo Articulos</h1>

        <div className="flex flex-wrap gap-3 items-center">
          
             <Link
            href="/auth/rut-articulos/form-crear-articulo"
            className="inline-block px-4 py-2 mb-4 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
          >
            Crear nuevo articulo
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

       <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ocultarArticuloInactivo}
            onChange={() => setOcultarArticuloInactivo((v) => !v)}
            className="w-4 h-4"
          />
          Ocultar articulos inactivos
        </label>
    </div>
        <input
            type="text"
            placeholder="Buscar articulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-4 py-2 border rounded w-full max-w-md"
          />
     
      <table className="min-w-full table-auto border border-gray-300 shadow-md rounded-md overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr className="bg-gray-100">

           
            <th  className={headerClass}>Accion</th>
             <th  className={headerClass}>Id</th>
             <th  className={headerClass}>Fecha de alta</th>
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
                <div className="flex gap-2">
                    
                  <button
                    className="px-4 py-2 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
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
                    Ingr
                  </button>

                  
                  <button
                    className="px-4 py-2 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
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
                    Egr
                  </button>

                  <button
                    className="px-4 py-2 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
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
                    Edit
                  </button>


                  <button
                    className="px-4 py-2 bg-white text-red-700 font-semibold rounded-md shadow hover:bg-red-700 hover:text-black transition-colors duration-200"
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
                    Elim
                  </button>

                  
                </div></td>

                <td className={cellClass}>{articulo.id}</td>
              <td className={cellClass}>{formatDate(articulo.created_at) || "-"}</td>
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

      

      {/* MODAL */}
      {editingArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-black font-bold mb-4">Editar articulo #{editingArticulo.id}</h2>
           
            
            
              <div className="mb-4 flex justify-between">
                <span className="text-black font-semibold">Articulo: {editingArticulo.nombre_articulo}</span>
               
              </div>

            
                  <label className="block mb-4">
                    <p className="text-black">Articulo</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.nombre_articulo ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, nombre_articulo: e.target.value})
                            }
                        />
                </label>

                 <label className="block mb-4">
                    <p className="text-black">Descripcion</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.descripcion ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, descripcion: e.target.value})
                            }
                        />
                </label>

                  <label className="block mb-4">
                    <p className="text-black">Familia</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.familia ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, familia: e.target.value})
                            }
                        />
                </label>

                <label className="block mb-4">
                    <p className="text-black">Prov sugerido</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.proveedor_sug ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, proveedor_sug: e.target.value})
                            }
                        />
                </label>

                  <label className="block mb-4">
                    <p className="text-black">Cod. prov. sug.</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.cod_proveedor ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, cod_proveedor: e.target.value})
                            }
                        />
                </label>

                  <label className="block mb-4">
                    <p className="text-black">Cost. compra</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="numeric"
                         
                            value={formData.costo_compra ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, costo_compra: e.target.value})
                            }
                        />
                </label>

                
                  <label className="block mb-4">
                    <p className="text-black">Porcentaje aplicable</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="numeric"
                         
                            value={formData.porcentaje_aplicar ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, porcentaje_aplicar: e.target.value})
                            }
                        />
                </label>

                 <label className="block mb-4">
                    <p className="text-black">Precio de venta</p>
                       <input
                          className="w-full border p-2 rounded mt-1 bg-gray-100"
                          type="text"
                          value={formData.precio_venta ?? ""}
                          readOnly
                        />

                </label>

                

                 <label className="block mb-4">
                    <p className="text-black">Existencia</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            value={formData.existencia ?? ""}
                            onChange={(e) =>
                            setFormData({ ...formData, existencia: e.target.value})
                            }
                        />
                </label>

                 <label className="block mb-4">
                    <p className="text-black">Situacion</p>
                    <select
                      className="w-full border p-2 rounded mt-1"
                      value={formData.situacion ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, situacion: e.target.value })
                      }
                    >
                      <option value="">Seleccionar situacion</option>
                      <option value="activo" className="bg-yellow-300 text-black">
                        Activo
                      </option>
                      <option value="inactivo" className="bg-green-400 text-white">
                        Inactivo
                      </option>
                      
                    </select>
                  </label>

           
              <div className="flex justify-end space-x-2">
                <button
                    onClick={() => setEditingArticulo(null)}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                    Cancelar
                </button>
                <button
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
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Guardar
                  </button>
            </div>
          </div>
        </div>
      )}
        
       {ingresarArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-black font-bold mb-4">Ingresar articulo #{ingresarArticulo.id}</h2>

              <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Código:</span>
                  <span className="text-black">{ingresarArticulo.codint}</span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Artículo:</span>
                  <span className="text-black">{ingresarArticulo.nombre_articulo}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-sm font-semibold text-gray-700">Descripción:</span>
                  <span className="text-black">{ingresarArticulo.descripcion}</span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Stock actual:</span>
                  <span className="text-black">{ingresarArticulo.existencia}</span>
                 
                </div>
                 <div>
                  <span className="block text-sm font-semibold text-gray-700">Precio de venta actual:</span>
                  <span className="text-black">$ {ingresarArticulo.precio_venta}</span>
                </div>
              </div>

                 <label className="block mb-4">
                    <p className="text-black">Cant. a ingresar</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            inputMode="numeric"
                            value={ingresart}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) setIngresArt(value);
                            }}
                            
                        />
                    </label>

                   
                  <label className="block">
                        <p className="text-black mb-1">Proveedor</p>
                        <input
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        required
                        value={nombreprov}
                        onChange={(e) => setNombreprov(e.target.value)}
                        />
                    </label>
                          
                 <label className="block mb-4">
                  <p className="text-black">Fact.</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            inputMode="numeric"
                            value={fact}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) setFact(value);
                            }}
                            
                        />
                    </label>

                   <label className="block mb-4">
                  <p className="text-black">Rto.</p>
                        <input
                            className="w-full border p-2 rounded mt-1"
                            type="text"
                            inputMode="numeric"
                            value={rto}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) setRto(value);
                            }}
                            
                        />
                    </label>

                    <label className="block mb-4">
                        <p className="text-black">Costo de compra</p>
                        <input
                          className="w-full border p-2 rounded mt-1"
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
                        <p className="text-black mb-1">Fecha recibido</p>
                        <input
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="date"
                        required
                        value={fecha_ent}
                        onChange={(e) => setFecha_ent(e.target.value)}
                        />
                    </label>

                      <label className="block">
                      <p className="text-black">Con observacion</p>
                    <select
                      className="w-full border p-2 rounded mt-1"
                      value={observacion}
                      onChange={(e) =>
                        setObservacion(e.target.value)
                      }
                    >
                      <option value="">Observado?</option>
                      <option value="si" className="bg-yellow-300 text-black">
                        Si
                      </option>
                      <option value="no" className="bg-green-400 text-white">
                        No
                      </option>
                      
                    </select>
                       
                    </label>

                    <label className="block mb-4">
                        <p className="text-black">Precio de venta (calculado)</p>
                        <input
                          className="w-full border p-2 rounded mt-1 bg-gray-100"
                          type="text"
                          readOnly
                          value={formData.precio_venta ?? ""}
                        />
                      </label>


                    


                <div className="flex justify-end space-x-2 mt-6">
                <button
                    onClick={() => setIngresarArticulo(null)}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                    Cancelar
                </button>
               <button
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


                    

                    // 2. Insertar en ingarticulos

                    {/**/}
                    const { error: insertError } = await supabase.from("ingarticulos").insert({
                    codint: ingresarArticulo.codint,
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
                className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                Guardar
                </button>

            </div>
          </div>
        </div>
      )} 
       {descontarArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-black font-bold mb-4">Salida de articulo #{descontarArticulo.id}</h2>
            
             <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Código:</span>
                  <span className="text-black">{descontarArticulo.codint}</span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Artículo:</span>
                  <span className="text-black">{descontarArticulo.nombre_articulo}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-sm font-semibold text-gray-700">Descripción:</span>
                  <span className="text-black">{descontarArticulo.descripcion}</span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Stock actual:</span>
                  <span className="text-black">{descontarArticulo.existencia}</span>
                </div>
              </div>


              <div className="grid gap-4">
                    <label className="block">
                        <p className="text-black mb-1">Cant. a descontar</p>
                        <input
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <p className="text-black mb-1">Retira</p>
                        <input
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        required
                        value={retira}
                        onChange={(e) => setRetira(e.target.value)}
                        />
                    </label>

                    <label className="block">
                        <p className="text-black mb-1">Motivo</p>
                        <input
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        required
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        />
                    </label>

                    
                </div>
             

                <div className="flex justify-end space-x-2 mt-6">
                <button
                    onClick={() => setDescontarArticulo(null)}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                    Cancelar
                </button>
               <button
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
                className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                Guardar
                </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}