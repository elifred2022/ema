"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(5);

  // Redirección automática después de 5 segundos usando window.location
  useEffect(() => {
    console.log("🔄 Iniciando redirección automática...");
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        console.log(`⏱️ Contador: ${prev} segundos`);
        
        if (prev <= 1) {
          console.log("🚀 Redirigiendo a home con window.location...");
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpiar timer al desmontar
    return () => {
      console.log("🧹 Limpiando timer de redirección");
      clearInterval(timer);
    };
  }, []);

  // Función de redirección manual
  const redirectToHome = () => {
    console.log("🔄 Redirección manual a home");
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-green-200">
        {/* Icono de éxito animado */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🎉</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ¡Pago Aprobado!
        </h1>
        
        <p className="text-gray-700 mb-6 text-lg">
          Tu pago ha sido procesado exitosamente. 
          <br />
          <span className="font-semibold">¡Tu pedido será preparado y enviado pronto!</span>
        </p>

        {/* Mensaje de agradecimiento */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-6 border border-green-200">
          <p className="font-bold text-green-800 text-lg">
            ¡Gracias por tu compra! 🛍️
          </p>
          <p className="text-green-700 text-sm mt-1">
            Recibirás un email de confirmación
          </p>
        </div>

        {/* Contador de redirección */}
        <div className="mb-6 p-3 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-sm">
            Serás redirigido automáticamente en:
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {countdown} segundos
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🏠 Ir a la tienda ahora
          </Link>
          
          <button
            onClick={redirectToHome}
            className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🚀 Continuar comprando
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ¿Tienes alguna pregunta? Contacta a nuestro soporte
          </p>
        </div>
      </div>
    </div>
  );
}