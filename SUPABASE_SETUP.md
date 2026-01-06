# Configuración de Supabase para tu aplicación

## 📋 Requisitos previos

1. **Cuenta de Supabase**: Necesitas una cuenta en [Supabase](https://supabase.com/)
2. **Proyecto de Supabase**: Crea un nuevo proyecto o usa uno existente

## 🔑 Variables de entorno necesarias

Crea un archivo `.env.local` en la raíz de tu proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

## 🔐 Obtener credenciales de Supabase

### 1. Accede a tu proyecto de Supabase

- Ve a [Supabase Dashboard](https://supabase.com/dashboard)
- Inicia sesión con tu cuenta
- Selecciona tu proyecto o crea uno nuevo

### 2. Obtén tus credenciales

- En el panel de tu proyecto, ve a **Settings** (Configuración)
- Haz clic en **API** en el menú lateral
- Encontrarás dos valores importantes:

  - **Project URL** → Esta es tu `NEXT_PUBLIC_SUPABASE_URL`
    - Ejemplo: `https://xxxxxxxxxxxxx.supabase.co`
  
  - **anon/public key** → Esta es tu `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
    - Es la clave que comienza con `eyJ...`
    - **Importante**: Usa la clave `anon` o `public`, NO la clave `service_role` (es privada)

### 3. Configuración del archivo .env.local

1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y reemplaza los valores:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Reinicia el servidor de desarrollo

Después de configurar las variables de entorno, **debes reiniciar el servidor**:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

## ✅ Verificar la configuración

Una vez configuradas las variables de entorno correctamente:

1. El mensaje "Supabase environment variables required" desaparecerá
2. Verás los botones de "Sign in" y "Sign up" habilitados
3. Podrás usar todas las funcionalidades de autenticación

## 🚨 Solución de problemas

### El mensaje sigue apareciendo después de configurar

1. **Verifica que el archivo se llame exactamente `.env.local`** (no `.env`, `.env.example`, etc.)
2. **Asegúrate de que el archivo esté en la raíz del proyecto** (mismo nivel que `package.json`)
3. **Reinicia el servidor de desarrollo** completamente (detén y vuelve a iniciar)
4. **Verifica que no haya espacios** antes o después del signo `=` en las variables

### Error: "Invalid API key"

- Verifica que estés usando la clave `anon` o `public`, no la `service_role`
- Asegúrate de copiar la clave completa sin espacios adicionales

### Error: "Invalid URL"

- Verifica que la URL de Supabase esté completa (incluye `https://`)
- No debe terminar con una barra `/`

## 📚 Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de autenticación](https://supabase.com/docs/guides/auth)
- [Configuración de Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
