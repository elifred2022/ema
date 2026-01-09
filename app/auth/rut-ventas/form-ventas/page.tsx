"use client";

import { Suspense } from "react";
import VentasForm from "@/components/ventas/ventasform";

function FormVentasWrapper() {
  return (
    <div className="flex min-h-screen w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-7xl">
        <VentasForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Cargando...</div>}>
      <FormVentasWrapper />
    </Suspense>
  );
}
