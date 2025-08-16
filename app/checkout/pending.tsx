"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-yellow-200">
        {/* Icono de espera */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">⏳</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-yellow-600 mb-4">
          ¡Pago Pendiente!
        </h1>
        
        <p className="text-gray-700 mb-6 text-lg">
          Estamos esperando la confirmación de tu pago. 
          <br />
          <span className="font-semibold">Este proceso puede tomar unos minutos.</span>
        </p>

        {/* Mensaje informativo */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg mb-6 border border-yellow-200">
          <p className="font-bold text-yellow-800 text-lg">
            ¿Qué está pasando? 🔍
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            Tu pago está siendo procesado por el banco. 
            Recibirás una notificación por correo electrónico 
            cuando sea aprobado.
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p className="font-semibold text-blue-800 text-sm">
            💡 Consejo: Puedes cerrar esta página y volver más tarde
          </p>
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
            className="block w-full bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🛒 Seguir comprando
          </button>
        </div>

        {/* Información de contacto */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ¿Tienes dudas? Contacta a nuestro soporte
          </p>
        </div>
      </div>
    </div>
  );
}