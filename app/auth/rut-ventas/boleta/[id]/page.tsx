"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Boleta from "@/components/ventas/boleta";

function BoletaWrapper() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id as string) : null;

  if (!id || isNaN(id)) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">ID de venta inválido</p>
      </div>
    );
  }

  return <Boleta ventaId={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Cargando...</div>}>
      <BoletaWrapper />
    </Suspense>
  );
}
