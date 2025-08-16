#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Configurando MercadoPago para tu aplicación...\n");

// Verificar si ya existe .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log("⚠️  El archivo .env.local ya existe.");
  console.log("   Revisa que contenga las siguientes variables:\n");
} else {
  console.log("📝 Creando archivo .env.local...\n");
}

// Contenido del archivo .env.local
const envContent = `# MercadoPago Configuration
# Obtén estas credenciales desde: https://www.mercadopago.com/developers
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL para redirecciones y webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration (si no está ya configurado)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

if (!envExists) {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Archivo .env.local creado exitosamente");
  } catch (error) {
    console.error("❌ Error al crear .env.local:", error.message);
    process.exit(1);
  }
}

console.log("\n📋 Variables de entorno necesarias:");
console.log("   MP_ACCESS_TOKEN - Tu token de acceso privado de MercadoPago");
console.log("   NEXT_PUBLIC_MP_PUBLIC_KEY - Tu clave pública de MercadoPago");
console.log("   NEXT_PUBLIC_BASE_URL - URL base de tu aplicación\n");

console.log("🔑 Para obtener tus credenciales:");
console.log("   1. Ve a https://www.mercadopago.com/developers");
console.log("   2. Inicia sesión con tu cuenta");
console.log('   3. Ve a "Tus integraciones"');
console.log("   4. Copia Access Token y Public Key\n");

console.log("🧪 Para probar la integración:");
console.log("   1. Actualiza las credenciales en .env.local");
console.log("   2. Reinicia tu servidor de desarrollo");
console.log("   3. Ve a la página principal para ver el componente de prueba");
console.log("   4. Usa las tarjetas de prueba de MercadoPago\n");

console.log("📚 Documentación completa: MERCADOPAGO_SETUP.md\n");

if (envExists) {
  console.log(
    "💡 Tip: Si quieres recrear el archivo .env.local, elimínalo y ejecuta este script nuevamente."
  );
}
