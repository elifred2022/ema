import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">¡Pago Pendiente! ⏳</h1>
        <p className="text-gray-700 mb-6">
          Estamos esperando la confirmación de tu pago. Este proceso puede tomar unos minutos.
        </p>
        <div className="bg-yellow-100 p-4 rounded-md mb-6">
          <p className="font-semibold text-yellow-800">
            Recibirás una notificación por correo electrónico cuando tu pago sea aprobado.
          </p>
        </div>
        <Link 
          href="/" 
          className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}