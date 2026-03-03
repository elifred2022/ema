"use client";

import ListaIndicadores from "@/components/indicadores/ListaIndicadores";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-7xl">
        <ListaIndicadores />
      </div>
    </div>
  );
}
