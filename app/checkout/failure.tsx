"use client";

import Link from 'next/link';

// Componente para la página de fallo.
// Se muestra si la transacción no se pudo completar.
export default function FailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">¡Fallo en el Pago! 😥</h1>
        <p className="text-gray-700 mb-6">No pudimos procesar tu pago. Por favor, revisa tus datos o inténtalo de nuevo más tarde.</p>
        <Link href="/checkout" className="inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md">
          Intentar de nuevo
        </Link>
      </div>
    </div>
  );
}