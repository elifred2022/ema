import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para ignorar errores de MercadoPago en consola
  experimental: {
    // Ignorar errores de consola en desarrollo
    ignoreBuildErrors: false,
  },
  
  // Configuración de webpack para ignorar warnings
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
