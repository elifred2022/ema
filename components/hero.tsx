
import Link from "next/link";
import { Package, ShoppingBag, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center">
      {/* Título principal */}
      <div className="flex flex-col gap-6 items-center text-center">
        <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Almacén Dios con nosotros
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl">
          Bienvenido a nuestro sistema de gestión
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <Link href="/auth/rut-articulos/list-articulos">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Package className="h-5 w-5" />
            Artículos
          </Button>
        </Link>

        <Link href="/auth/rut-clientes/lista-clientes">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 font-semibold px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <Users className="h-5 w-5" />
            Clientes
          </Button>
        </Link>

        <Link href="/protected">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 font-semibold px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <ShoppingBag className="h-5 w-5" />
            Administración
          </Button>
        </Link>
      </div>

      {/* Separador decorativo */}
      <div className="w-full max-w-2xl p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-4" />
    </div>
  );
}
