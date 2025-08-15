import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">¡Pago Rechazado! 😞</h1>
        <p className="text-gray-700 mb-6">
          Hubo un problema al procesar tu pago. Por favor, verifica tus datos e intenta de nuevo.
        </p>
        <div className="bg-red-100 p-4 rounded-md mb-6">
          <p className="font-semibold text-red-800">
            Puedes intentar con otro método de pago o contactar a soporte si el problema persiste.
          </p>
        </div>
        <Link 
          href="/checkout" 
          className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar pago
        </Link>
      </div>
    </div>
  );
}