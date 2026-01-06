import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración de Turbopack (Next.js 16+)
  turbopack: {
    // Configuración vacía para usar Turbopack por defecto
  },
  
  // Configuración de webpack para compatibilidad (solo si es necesario)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Module not found/,
      ];
    }
    return config;
  },
};

export default nextConfig;
