"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FormArticulo({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [nombre_articulo, setNombre_articulo] = useState("");
  const [codbar, setCodbar] = useState("");
  const [codint, setCodint] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [familia, setFamilia] = useState("");
  const [proveedor_sug, setProveedor_sug] = useState("");
  const [cod_proveedor, setCod_proveedor] = useState("");
  const [costo_compra, setCosto_compra] = useState("");
  const [porcentaje_aplicar, setPorcentaje_aplicar] = useState("");
  const [precio_venta, setPrecio_venta] = useState("");
  const [existencia, setExistencia] = useState("");
  const [situacion, setSituacion] = useState("");

  type CommaField =
    | "nombre_articulo"
    | "descripcion"
    | "costo_compra"
    | "porcentaje_aplicar"
    | "precio_venta";
  const [error, setError] = useState<string | null>(null);
  const [commaErrors, setCommaErrors] = useState<Partial<Record<CommaField, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  // FUNCION PARA CALCULAR PRECIO DE VENTA COSTO X PORCENTAJE

   function calcularPrecioVenta(costo_compra: string, porcentaje_aplicar: string) {
  const costoNum = parseFloat(costo_compra);
  const porcentajeNum = parseFloat(porcentaje_aplicar);

  if (!isNaN(costoNum) && !isNaN(porcentajeNum)) {
    const resultado = costoNum + (costoNum * porcentajeNum) / 100;
    setPrecio_venta(resultado.toFixed(2)); // lo convierte a string con 2 decimales
  } else {
    setPrecio_venta("");
  }
}

  const limpiarComa = (field: CommaField, value: string) => {
    if (value.includes(",")) {
      setCommaErrors((prev) => ({
        ...prev,
        [field]: "No se permite , use .",
      }));
      return value.replace(/,/g, "");
    }
    setCommaErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    return value;
  };

  const handleCrear = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

 


  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Paso 1: Verificar si ya existe el codigo interno para cuidar no repeticion
  const { data: existing, error: fetchError } = await supabase
    .from("articulos")
    .select("id")
    .eq("codint", codint)
    .maybeSingle(); // trae uno o null

  if (fetchError) {
    console.error("Error al verificar Codigo interno:", fetchError);
    setError("Error al verificar Codigo interno existente.");
    setIsLoading(false);
    return;
  }

  if (existing) {
    setError("Este Cod. int. ya está registrado.");
    setIsLoading(false);
    return;
  }

  // Paso 2: Insertar si no existe
  const { error: insertError } = await supabase
    .from("articulos")
    .insert([
      {

        codbar,
        codint,
        nombre_articulo,
        descripcion,
        proveedor_sug,
        cod_proveedor,
        costo_compra,
        porcentaje_aplicar,
        precio_venta,
        familia,
        existencia,
        situacion,
        uuid: user?.id,
      },
    ]);

  setIsLoading(false);

  if (insertError) {
    console.error("Error al insertar:", insertError);
    setError("Hubo un error al crear el articulo.");
  } else {
    router.push("/auth/rut-articulos/list-articulos");
  }
};


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear articulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCrear} className="flex flex-col gap-6">

              <div className="grid gap-2">
              <Label htmlFor="codbar">Codbar</Label>
              <Input
                id="codbar"
                type="text"
                value={codbar}
                onChange={(e) => setCodbar(e.target.value)}
              />
            </div>

              <div className="grid gap-2">
              <Label htmlFor="codint">Codigo interno</Label>
              <Input
                id="codint"
                type="text"
                required
                value={codint}
                onChange={(e) => setCodint(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre_articulo">Articulo</Label>
              <Input
                id="nombre_articulo"
                type="text"
                required
                value={nombre_articulo}
                onChange={(e) => {
                  const value = limpiarComa("nombre_articulo", e.target.value);
                  setNombre_articulo(value);
                }}
              />
              {commaErrors.nombre_articulo && (
                <p className="text-red-600 text-sm">{commaErrors.nombre_articulo}</p>
              )}
            </div>

             <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Input
                id="descripcion"
                type="text"
              
                value={descripcion}
                onChange={(e) => {
                  const value = limpiarComa("descripcion", e.target.value);
                  setDescripcion(value);
                }}
              />
              {commaErrors.descripcion && (
                <p className="text-red-600 text-sm">{commaErrors.descripcion}</p>
              )}
            </div>

              <div className="grid gap-2">
              <Label htmlFor="proveedor_sug">Prov. sugerido</Label>
              <Input
                id="proveedor_sug"
                type="text"
            
                value={proveedor_sug}
                onChange={(e) => setProveedor_sug(e.target.value)}
              />
            </div>

            
             <div className="grid gap-2">
              <Label htmlFor="cod_proveedor">Cod. Prov. sugerido</Label>
              <Input
                id="cod_proveedor"
                type="text"
              
                value={cod_proveedor}
                onChange={(e) => setCod_proveedor(e.target.value)}
              />
            </div>

            
           
            <div className="grid gap-2">
              <Label htmlFor="familia">Familia</Label>
              <Input
                id="familia"
                type="text"
                required
                value={familia}
                onChange={(e) => setFamilia(e.target.value)}
              />
            </div>

             <div className="grid gap-2">
              <Label htmlFor="costo_compra">Costo de compra</Label>
              <Input
                id="costo_compra"
                type="text"
                inputMode="decimal"
                value={costo_compra}
                onChange={(e) => {
                  const value = limpiarComa("costo_compra", e.target.value);
                  if (/^\d*\.?\d*$/.test(value)) {
                    setCosto_compra(value);
                    calcularPrecioVenta(value, porcentaje_aplicar);
                  }
                }}
              />
              {commaErrors.costo_compra && (
                <p className="text-red-600 text-sm">{commaErrors.costo_compra}</p>
              )}

            </div>

              <div className="grid gap-2">
              <Label htmlFor="porcentaje_aplic">Porcentaje aplicable</Label>
              <Input
                id="porcentaje_aplic"
                type="text"
                inputMode="decimal"
                value={porcentaje_aplicar}
                onChange={(e) => {
                  const value = limpiarComa("porcentaje_aplicar", e.target.value);
                  if (/^\d*\.?\d*$/.test(value)) {
                    setPorcentaje_aplicar(value);
                    calcularPrecioVenta(costo_compra, value);
                  }
                }}
              />
              {commaErrors.porcentaje_aplicar && (
                <p className="text-red-600 text-sm">{commaErrors.porcentaje_aplicar}</p>
              )}

            </div>

              <div className="grid gap-2">
              <Label htmlFor="precio_venta">Precio de venta</Label>
              <Input
                id="precio_venta"
                type="text"
             
                inputMode="numeric"
               pattern="^\d+(\.\d{1,2})?$"
                value={precio_venta}
                onChange={(e) => {
                  const value = limpiarComa("precio_venta", e.target.value);
                  if (/^\d*\.?\d*$/.test(value)) setPrecio_venta(value);
                }}
              />
              {commaErrors.precio_venta && (
                <p className="text-red-600 text-sm">{commaErrors.precio_venta}</p>
              )}
            </div>

             <div className="grid gap-2">
              <Label htmlFor="existencia">Existencia</Label>
              <Input
                id="existencia"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                value={existencia}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) setExistencia(value);
                }}
              />
            </div>

             <div className="grid gap-2">
              <Label htmlFor="situacion">Situación</Label>
              <select
                id="situacion"
                required
                value={situacion}
                onChange={(e) => setSituacion(e.target.value)}
                className="border border-input bg-background px-3 py-2 rounded-md text-sm shadow-sm"
              >
                <option value="">Seleccione situación</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
     
       

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Crear"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
