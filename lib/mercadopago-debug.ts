// Archivo temporal para depurar las variables de entorno
export function debugEnvVars() {
  console.log("=== DEBUG VARIABLES DE ENTORNO ===");
  console.log("process.env.MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN);
  console.log("process.env.NEXT_PUBLIC_MP_PUBLIC_KEY:", process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
  console.log("process.env.NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
  
  // Verificar si las variables están definidas
  console.log("MP_ACCESS_TOKEN definido:", !!process.env.MP_ACCESS_TOKEN);
  console.log("NEXT_PUBLIC_MP_PUBLIC_KEY definido:", !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
  console.log("NEXT_PUBLIC_BASE_URL definido:", !!process.env.NEXT_PUBLIC_BASE_URL);
  
  // Verificar longitud de los tokens
  if (process.env.MP_ACCESS_TOKEN) {
    console.log("Longitud MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN.length);
    console.log("Primeros 20 chars:", process.env.MP_ACCESS_TOKEN.substring(0, 20));
  }
  
  if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
    console.log("Longitud NEXT_PUBLIC_MP_PUBLIC_KEY:", process.env.NEXT_PUBLIC_MP_PUBLIC_KEY.length);
  }
  
  console.log("=== FIN DEBUG ===");
}
