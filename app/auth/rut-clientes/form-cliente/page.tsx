"use client";


import ClienteForm from "@/components/clientes/clienteform";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ClienteForm/>
      </div>
    </div>
  );
}
