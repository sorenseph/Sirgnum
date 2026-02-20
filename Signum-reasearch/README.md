# Signum Research

Plataforma de análisis financiero con panel de administración.

## Conexión Backend-Frontend

**No necesitas Next.js ni backend separado.** El frontend (Vue) se conecta directamente a Supabase, que actúa como backend completo (auth, base de datos, storage).

- **Frontend**: Vue 3 + Vite → `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- **Base de datos**: Ya migrada en tu proyecto Supabase
- **URL del proyecto**: https://fbjpmqjzaltprocobgwp.supabase.co

---

## Error: "Email not confirmed" al iniciar sesión

Por defecto Supabase exige confirmar el correo. Para desarrollo puedes desactivarlo:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Desactiva **"Confirm email"**

O confirma tu correo: entra al email que usaste al registrarte y haz clic en el enlace de verificación.

---

## Error: "Invalid App ID" (Facebook)

Facebook requiere un **App ID numérico** (ej: `123456789012345`), no texto como "Signum".

1. Entra a [Meta for Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App** → elige "Consumer" u otro tipo
3. Añade el producto **Facebook Login**
4. En **Settings** → **Basic**, copia **App ID** (numérico) y **App Secret**
5. En Supabase → **Providers** → **Facebook**, pega ese App ID y Secret
6. En Facebook: **Facebook Login** → **Settings** → añade en **Valid OAuth Redirect URIs**:
   `https://fbjpmqjzaltprocobgwp.supabase.co/auth/v1/callback`

---

## Error: "provider is not enabled" (Google/Facebook)

Debes **activar los proveedores** en Supabase:

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard/project/fbjpmqjzaltprocobgwp)
2. Ve a **Authentication** → **Providers**
3. Busca **Google** y **Facebook** en la lista
4. Actívalos (toggle **Enabled** = ON)
5. Para cada uno, añade:
   - **Google**: Client ID y Client Secret desde [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **Facebook**: App ID y App Secret desde [Meta for Developers](https://developers.facebook.com/)
6. En **Authentication** → **URL Configuration**, añade en **Redirect URLs**:
   - `http://localhost:5173/**` (desarrollo)
   - Tu URL de producción cuando la tengas
7. Guarda los cambios

---

## Crear Super Admin

### Paso 1: Registrarte con email/contraseña

1. Ve a tu app en `http://localhost:5173/login`
2. Clic en "Regístrate"
3. Usa un correo y contraseña (ej: `admin@signum.com` / `Admin123!`)

### Paso 2: Añadir URL de confirmación en Supabase

En **Authentication** → **URL Configuration** → **Redirect URLs**, añade:
- `http://localhost:5173/confirmacion`

Así, al hacer clic en "Confirm your mail" del correo, te llevará a esa página.

### Paso 3: Promover tu usuario a super_admin

En Supabase Dashboard:

1. **Authentication** → **Users** → verás tu usuario
2. **Table Editor** → **profiles** → verás el perfil creado automáticamente

O ejecuta en **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'israelcardenas6@gmail.com';  -- Reemplaza con tu email si usas otro
```

### Paso 3: Ver usuarios y super admin

- **Tabla `profiles`**: Supabase → **Table Editor** → **profiles**
- Allí verás: `id`, `email`, `full_name`, `role`, `is_active`, `can_read`, etc.
- El super admin tendrá `role = super_admin`

### Credenciales de prueba (opcional)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@signum.com | (la que elijas al registrarte) | super_admin (tras el UPDATE) |

---

## Supabase CLI (opcional)

```bash
# Vincular proyecto
supabase link --project-ref fbjpmqjzaltprocobgwp

# Nueva migración
supabase migration new nombre-migracion

# Aplicar migraciones
supabase db push
```

---

## Configuración

### Variables de entorno (`.env`)

```
VITE_SUPABASE_URL=https://fbjpmqjzaltprocobgwp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0RrUil1AaeQlysKxmmdCKQ_YhVTcBdY
```

### Instalación y desarrollo

```sh
npm install
npm run dev
```

---

## Paneles y roles

| Panel | Super Admin | Admin | Editor |
|-------|-------------|-------|--------|
| Notas | ✓ | ✓ | ✓ |
| Reportes Diarios | ✓ | ✓ | ✓ |
| Clientes Reporte | ✓ | ✓ | ✓ |
| Usuarios (activar/desactivar) | ✓ | ✓ | ✗ |
| Permisos (cambiar roles) | ✓ | ✓ | ✗ |
