"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FailurePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-red-200">
        {/* Icono de error */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">😞</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-red-600 mb-4">
          ¡Pago Rechazado!
        </h1>
        
        <p className="text-gray-700 mb-6 text-lg">
          Hubo un problema al procesar tu pago. 
          <br />
          <span className="font-semibold">No te preocupes, no se ha cobrado nada.</span>
        </p>

        {/* Mensaje de ayuda */}
        <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 rounded-lg mb-6 border border-red-200">
          <p className="font-bold text-red-800 text-lg">
            ¿Qué puedes hacer? 🤔
          </p>
          <ul className="text-red-700 text-sm mt-2 text-left space-y-1">
            <li>• Verificar que tu tarjeta tenga fondos</li>
            <li>• Revisar que los datos sean correctos</li>
            <li>• Intentar con otro método de pago</li>
            <li>• Contactar a soporte si persiste</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🏠 Volver a la tienda
          </Link>
          
          <button
            onClick={() => router.push('/')}
            className="block w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🛒 Seguir comprando
          </button>
        </div>

        {/* Información de soporte */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? Contacta a nuestro soporte técnico
          </p>
        </div>
      </div>
    </div>
  );
}