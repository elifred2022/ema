# Configuración de MercadoPago para tu aplicación

## 📋 Requisitos previos

1. **Cuenta de MercadoPago**: Necesitas una cuenta en [MercadoPago](https://www.mercadopago.com/)
2. **Credenciales de API**: Obtén tus claves de acceso desde el panel de desarrolladores

## 🔑 Variables de entorno necesarias

Crea un archivo `.env.local` en la raíz de tu proyecto con las siguientes variables:

```bash
# MercadoPago Configuration
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL para redirecciones y webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration (si no está ya configurado)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔐 Obtener credenciales de MercadoPago

### 1. Accede a tu cuenta de MercadoPago

- Ve a [MercadoPago Developers](https://www.mercadopago.com/developers)
- Inicia sesión con tu cuenta

### 2. Obtén tus credenciales

- En el panel de desarrolladores, ve a "Tus integraciones"
- Selecciona tu aplicación o crea una nueva
- Copia las siguientes credenciales:
  - **Access Token** (clave privada para el backend)
  - **Public Key** (clave pública para el frontend)

### 3. Configuración de ambiente

- **TEST**: Para desarrollo y pruebas
- **PROD**: Para producción (cambia las claves cuando estés listo)

## 🚀 Configuración del proyecto

### 1. Instalar dependencias

```bash
npm install @mercadopago/sdk-react mercadopago
```

### 2. Verificar archivos de configuración

Los siguientes archivos ya están configurados:

- `lib/mercadopago.ts` - Configuración centralizada
- `app/api/mercadopago/route.ts` - API para crear preferencias
- `app/api/webhooks/mercadopago/route.ts` - Webhook para notificaciones
- `app/checkout/[id]/page.tsx` - Página de checkout

### 3. Configurar webhook en MercadoPago

En tu panel de desarrolladores de MercadoPago:

- Ve a "Webhooks"
- Agrega la URL: `https://tu-dominio.com/api/webhooks/mercadopago`
- Selecciona los eventos: `payment`, `payment.created`, `payment.updated`

## 🧪 Probar la integración

### 1. Crear una orden de prueba

- Navega a tu página de checkout
- Crea una orden con productos de prueba

### 2. Procesar pago de prueba

- Usa las tarjetas de prueba de MercadoPago:
  - **Aprobada**: 4509 9535 6623 3704
  - **Rechazada**: 4509 9535 6623 3704
  - **Pendiente**: 4509 9535 6623 3704

### 3. Verificar webhook

- Revisa los logs del servidor para confirmar que se reciben las notificaciones
- Verifica que el estado de la orden se actualice en Supabase

## 🔍 Solución de problemas comunes

### Error: "MP_ACCESS_TOKEN no está configurado"

- Verifica que la variable `MP_ACCESS_TOKEN` esté en tu archivo `.env.local`
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "No se pudo crear la preferencia de pago"

- Verifica que tu `MP_ACCESS_TOKEN` sea válido
- Confirma que los datos de la orden tengan el formato correcto
- Revisa los logs del servidor para más detalles

### Webhook no recibe notificaciones

- Verifica que la URL del webhook esté configurada correctamente en MercadoPago
- Asegúrate de que tu servidor sea accesible desde internet (para producción)
- Revisa que no haya firewalls bloqueando las conexiones

### Error de CORS

- Verifica que tu `NEXT_PUBLIC_BASE_URL` esté configurado correctamente
- Asegúrate de que las URLs de redirección sean válidas

## 📱 Personalización

### Cambiar moneda

Edita `lib/mercadopago.ts`:

```typescript
currency: "USD" as const, // Cambia a la moneda deseada
```

### Cambiar idioma

Edita `lib/mercadopago.ts`:

```typescript
locale: "en-US" as const, // Cambia al idioma deseado
```

### Personalizar URLs de redirección

Edita `lib/mercadopago.ts`:

```typescript
redirectUrls: {
  success: "/mi-pagina-exito",
  failure: "/mi-pagina-error",
  pending: "/mi-pagina-pendiente"
}
```

## 🚀 Despliegue a producción

### 1. Cambiar a credenciales de producción

- Obtén tus credenciales de producción desde MercadoPago
- Actualiza las variables de entorno en tu servidor de producción

### 2. Configurar webhook de producción

- Actualiza la URL del webhook en MercadoPago para usar tu dominio de producción
- Verifica que el webhook funcione correctamente

### 3. Configurar URLs de producción

- Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio de producción
- Verifica que todas las redirecciones funcionen correctamente

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Confirma que las credenciales de MercadoPago sean válidas
4. Consulta la [documentación oficial de MercadoPago](https://www.mercadopago.com/developers)

## ✅ Checklist de configuración

- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Webhook configurado en MercadoPago
- [ ] Página de checkout funcionando
- [ ] API de MercadoPago respondiendo
- [ ] Webhook recibiendo notificaciones
- [ ] Estados de orden actualizándose
- [ ] Páginas de éxito/error/pendiente funcionando
