"use client";

import { Suspense } from "react";
import ProveedorForm from "@/components/proveedores/proveedorform";

function FormProveedorWrapper() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <ProveedorForm redirectTo="/auth/rut-proveedores/lista-proveedores" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Cargando...</div>}>
      <FormProveedorWrapper />
    </Suspense>
  );
}
