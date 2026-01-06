# Guía de Deployment

## 🚀 Opción 1: Deploy en Vercel (Recomendado)

Vercel es la plataforma recomendada para proyectos Next.js y ofrece deployment automático desde GitHub.

### Pasos para deployar en Vercel:

1. **Sube tu código a GitHub** (si aún no lo has hecho):
   ```bash
   git add .
   git commit -m "Preparar para deployment"
   git push origin main
   ```

2. **Ve a [Vercel](https://vercel.com)** y:
   - Inicia sesión o crea una cuenta
   - Haz clic en "Add New Project"
   - Conecta tu repositorio de GitHub
   - Selecciona este proyecto

3. **Configura las variables de entorno** en Vercel:
   - Ve a Settings → Environment Variables
   - Agrega las siguientes variables:

   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu_clave_anon

   # MercadoPago (si lo usas)
   MP_ACCESS_TOKEN=tu_access_token
   NEXT_PUBLIC_MP_PUBLIC_KEY=tu_public_key
   NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app

   # Anthropic (si lo usas)
   ANTHROPIC_API_KEY=tu_api_key
   ```

4. **Haz clic en "Deploy"**
   - Vercel construirá y desplegará tu aplicación automáticamente
   - Obtendrás una URL como: `tu-proyecto.vercel.app`

### Deploy usando Vercel CLI (Alternativa):

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Hacer login
vercel login

# Deployar
vercel

# Para producción
vercel --prod
```

## 🔧 Opción 2: Deploy en otras plataformas

### Netlify:
1. Conecta tu repositorio de GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Configura las variables de entorno

### Railway:
1. Conecta tu repositorio
2. Configura las variables de entorno
3. Railway detectará automáticamente Next.js

### Render:
1. Conecta tu repositorio
2. Build command: `npm run build`
3. Start command: `npm start`
4. Configura las variables de entorno

## ⚠️ Importante antes de deployar:

1. **Verifica que el build funcione localmente**:
   ```bash
   npm run build
   ```

2. **Asegúrate de tener todas las variables de entorno configuradas** en la plataforma de deployment

3. **Actualiza `NEXT_PUBLIC_BASE_URL`** con la URL de tu aplicación desplegada

4. **Configura los webhooks de MercadoPago** (si los usas) con la URL de producción

## 📝 Checklist pre-deployment:

- [ ] Build local funciona sin errores (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] `.env.local` NO está en el repositorio (está en `.gitignore`)
- [ ] Código subido a GitHub
- [ ] Webhooks configurados (si aplica)
- [ ] URLs de producción actualizadas
