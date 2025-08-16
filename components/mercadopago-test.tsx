"use client";

import { useState, useEffect } from "react";
import { mercadopagoConfig, validateConfig } from "@/lib/mercadopago";
import { debugEnvVars } from "@/lib/mercadopago-debug";
import { checkEnvVars, tempConfig } from "@/lib/mercadopago-temp";

export default function MercadoPagoTest() {
  const [configStatus, setConfigStatus] = useState<ReturnType<typeof validateConfig> | null>(null);
  const [testResult, setTestResult] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkConfig = async () => {
    try {
      setConfigStatus(null);
      setTestResult("Verificando configuración...");
      
      const response = await fetch("/api/mercadopago", { method: "GET" });
      const data = await response.json();
      
      if (response.ok) {
        setTestResult("✅ Configuración válida - API respondiendo correctamente");
        setConfigStatus({ isValid: true, errors: [] });
      } else {
        setTestResult(`❌ Error en configuración: ${data.message}`);
        setConfigStatus({ isValid: false, errors: data.details || [data.message] });
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`);
      setConfigStatus({ isValid: false, errors: ["Error de conexión"] });
    }
  };

  const testAPI = async () => {
    try {
      setTestResult("Probando API...");
      
      // Primero probar el método GET para verificar la configuración
      const getResponse = await fetch("/api/mercadopago", { method: "GET" });
      if (!getResponse.ok) {
        const errorData = await getResponse.json();
        setTestResult(`❌ Error en configuración: ${errorData.message || "Error desconocido"}`);
        return;
      }

      // Si GET funciona, probar POST
      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              title: "Producto de prueba",
              quantity: 1,
              unit_price: 100
            }
          ],
          metadata: {
            order_id: "test-123"
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ API funcionando correctamente. Preference ID: ${data.id}`);
      } else {
        const errorData = await response.json();
        setTestResult(`❌ Error en API: ${errorData.error || "Error desconocido"}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  };

  // Renderizar un placeholder mientras se hidrata
  if (!isClient) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Prueba de MercadoPago</h2>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Prueba de MercadoPago</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Configuración</h3>
          <button
            onClick={checkConfig}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verificar Configuración
          </button>
          
          {configStatus && (
            <div className={`mt-2 p-3 rounded-lg ${
              configStatus.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {configStatus.isValid ? (
                <p>✅ Configuración válida</p>
              ) : (
                <div>
                  <p>❌ Errores de configuración:</p>
                  <ul className="list-disc list-inside mt-1">
                    {configStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Prueba de API</h3>
          <div className="space-y-2">
            <button
              onClick={checkConfig}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Probar Configuración (GET)
            </button>
            
            <button
              onClick={testAPI}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Probar Crear Preferencia (POST)
            </button>
          </div>
          
          {testResult && (
            <div className="mt-2 p-3 rounded-lg bg-gray-100">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Variables de entorno</h3>
          <div className="text-sm space-y-1">
            <p><strong>MP_ACCESS_TOKEN:</strong> {mercadopagoConfig.accessToken ? "✅ Configurado" : "❌ No configurado"}</p>
            <p><strong>Token (primeros 20 chars):</strong> {mercadopagoConfig.accessToken ? `${mercadopagoConfig.accessToken.substring(0, 20)}...` : "No disponible"}</p>
            <p><strong>NEXT_PUBLIC_MP_PUBLIC_KEY:</strong> {mercadopagoConfig.publicKey ? "✅ Configurado" : "❌ No configurado"}</p>
            <p><strong>NEXT_PUBLIC_BASE_URL:</strong> {mercadopagoConfig.baseUrl}</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Asegúrate de tener un archivo <code>.env.local</code> con las variables de entorno necesarias.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-2">Depuración</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log("=== DEPURACIÓN DEL COMPONENTE ===");
                checkEnvVars();
                console.log("Configuración temporal:", tempConfig);
                console.log("mercadopagoConfig:", mercadopagoConfig);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Depurar en Consola (F12)
            </button>
            <p className="text-xs text-blue-600">
              Haz clic y luego abre la consola del navegador (F12 → Console)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
