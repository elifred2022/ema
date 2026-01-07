"use client";

import { Suspense } from "react";
import ClienteForm from "@/components/clientes/clienteform";

function FormClienteWrapper() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <ClienteForm redirectTo="/auth/rut-clientes/lista-clientes" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Cargando...</div>}>
      <FormClienteWrapper />
    </Suspense>
  );
}
