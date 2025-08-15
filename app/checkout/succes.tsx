"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Componente para la página de éxito.
// Ahora verifica el pago con la API de tu servidor.
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verificando tu pago...");

  useEffect(() => {
    // Solo se ejecuta si hay un paymentId en la URL
    if (paymentId) {
      const confirmPayment = async () => {
        try {
          const res = await fetch("/api/confirm-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });

          const data = await res.json();
          
          if (res.ok && data.success) {
            setSuccess(true);
            setMessage("¡Tu pago se ha procesado correctamente y tu pedido ha sido confirmado!");
          } else {
            setSuccess(false);
            setMessage(data.message || "No pudimos confirmar tu pago. Contacta a soporte.");
          }
        } catch (error) {
          console.error("Error al confirmar el pago:", error);
          setSuccess(false);
          setMessage("Ocurrió un error inesperado al confirmar el pago. Por favor, revisa la consola.");
        } finally {
          setLoading(false);
        }
      };

      confirmPayment();
    } else {
      // Si no hay paymentId, la página muestra un mensaje genérico.
      setLoading(false);
      setMessage("El ID de pago no se encontró en la URL. Por favor, verifica el estado de tu pedido.");
    }
  }, [paymentId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        {loading ? (
          <>
            <div className="flex justify-center items-center mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{message}</h1>
            <p className="text-gray-600">Esto puede tardar unos segundos.</p>
          </>
        ) : (
          <>
            <h1 className={`text-4xl font-bold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
              {success ? '¡Pago Exitoso! 🎉' : 'Error en la Confirmación ❌'}
            </h1>
            <p className="text-gray-700 mb-6">{message}</p>
            <Link 
              href="/" 
              className={`inline-block font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              Volver a la tienda
            </Link>
          </>
        )}
      </div>
    </div>
  );
}