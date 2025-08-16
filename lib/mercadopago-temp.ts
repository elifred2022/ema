// Configuración temporal para depurar
export const tempConfig = {
  accessToken: "TEST-1512573458100912-081508-5e98a69543f8eed54b81cb630e16e49a-328467488",
  publicKey: "TEST-9a080af3-0084-4845-a941-0d9c7690aa65",
  baseUrl: "http://localhost:3000"
};

// Función para verificar si las variables de entorno están cargadas
export function checkEnvVars() {
  console.log("=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===");
  console.log("process.env.MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN);
  console.log("process.env.NEXT_PUBLIC_MP_PUBLIC_KEY:", process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
  console.log("process.env.NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
  
  // Verificar si están definidas
  const hasAccessToken = !!process.env.MP_ACCESS_TOKEN;
  const hasPublicKey = !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  const hasBaseUrl = !!process.env.NEXT_PUBLIC_BASE_URL;
  
  console.log("MP_ACCESS_TOKEN definido:", hasAccessToken);
  console.log("NEXT_PUBLIC_MP_PUBLIC_KEY definido:", hasPublicKey);
  console.log("NEXT_PUBLIC_BASE_URL definido:", hasBaseUrl);
  
  return { hasAccessToken, hasPublicKey, hasBaseUrl };
}
