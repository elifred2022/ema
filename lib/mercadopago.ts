import { MercadoPagoConfig } from "mercadopago";

// Configuración de MercadoPago
export const mercadopagoConfig = {
  // Clave pública para el frontend - PRODUCCIÓN
  publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "",
  
  // Clave privada para el backend - PRODUCCIÓN
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  
  // Configuración regional
  locale: "es-AR" as const,
  
  // Moneda por defecto
  currency: "ARS" as const,
  
  // URLs base para redirecciones
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  
  // URLs de redirección
  redirectUrls: {
    success: "/checkout/success",
    failure: "/checkout/failure", 
    pending: "/checkout/pending"
  },
  
  // URL del webhook
  webhookUrl: "/api/webhooks/mercadopago"
};

// Cliente de MercadoPago para el backend
export const createMercadoPagoClient = () => {
  // Durante el build, las variables de entorno pueden no estar disponibles
  if (typeof window === 'undefined' && !process.env.MP_ACCESS_TOKEN) {
    // En el servidor durante el build, retornar un cliente mock
    return null;
  }
  
  if (!mercadopagoConfig.accessToken) {
    throw new Error("MP_ACCESS_TOKEN no está configurado en las variables de entorno");
  }
  
  return new MercadoPagoConfig({
    accessToken: mercadopagoConfig.accessToken,
  });
};

// Función para construir URLs completas
export const buildRedirectUrl = (path: string) => {
  return `${mercadopagoConfig.baseUrl}${path}`;
};

// Función para validar que la configuración esté completa
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Durante el build, las variables de entorno pueden no estar disponibles
  if (typeof window === 'undefined' && !process.env.MP_ACCESS_TOKEN) {
    // En el servidor durante el build, retornar configuración válida
    return {
      isValid: true,
      errors: [],
      isBuildTime: true
    };
  }
  
  if (!mercadopagoConfig.accessToken) {
    errors.push("MP_ACCESS_TOKEN no está configurado");
  }
  
  if (!mercadopagoConfig.publicKey) {
    errors.push("NEXT_PUBLIC_MP_PUBLIC_KEY no está configurado");
  }
  
  if (!mercadopagoConfig.baseUrl) {
    errors.push("NEXT_PUBLIC_BASE_URL no está configurado");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    isBuildTime: false
  };
};
