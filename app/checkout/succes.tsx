import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Aprobado! 🎉</h1>
        <p className="text-gray-700 mb-6">
          Tu pago ha sido procesado exitosamente. Tu pedido será preparado y enviado pronto.
        </p>
        <div className="bg-green-100 p-4 rounded-md mb-6">
          <p className="font-semibold text-green-800">¡Gracias por tu compra!</p>
        </div>
        <Link 
          href="/" 
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}