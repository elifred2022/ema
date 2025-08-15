"use client";

import Link from 'next/link';

// Componente para la página de pago pendiente.
// Se muestra si el pago está en proceso de verificación.
export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-yellow-600 mb-4">Pago Pendiente... ⏳</h1>
        <p className="text-gray-700 mb-6">Tu pago está siendo procesado. Te enviaremos una notificación cuando se confirme.</p>
        <Link href="/" className="inline-block bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-700 transition duration-300 shadow-md">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
