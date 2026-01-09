"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";



function HomeAdmin() {
  


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Administrador</h1>
      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/auth/rut-articulos/list-articulos">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Sección Artículos
          </Button>
        </Link>  
           
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/auth/rut-clientes/lista-clientes">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Sección Clientes
          </Button>
        </Link>  
           
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/auth/rut-proveedores/lista-proveedores">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Sección Proveedores
          </Button>
        </Link>  
           
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/auth/rut-ventas/lista-ventas">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Sección Ventas
          </Button>
        </Link>  
           
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/auth/rut-compras/lista-compras">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Sección Compras
          </Button>
        </Link>  
           
      </div>
    </div>
  );
}

export default HomeAdmin;
