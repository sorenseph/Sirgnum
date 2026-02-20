# Configuración de Supabase - Signum Research

## Proyecto
- **URL**: https://fbjpmqjzaltprocobgwp.supabase.co
- **Base de datos**: postgresql://postgres:***@db.fbjpmqjzaltprocobgwp.supabase.co:5432/postgres

## 1. Ejecutar migración inicial

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard/project/fbjpmqjzaltprocobgwp)
2. Ve a **SQL Editor**
3. Crea una nueva query y pega el contenido completo de `supabase/migrations/001_initial_schema.sql`
4. Ejecuta la query (Run)

## 2. Configurar proveedores OAuth (opcional)

Para login con Google/Facebook:

1. **Authentication** → **Providers**
2. Activa **Google** y/o **Facebook**
3. Añade el Client ID y Client Secret de cada proveedor (desde Google Cloud Console / Meta for Developers)

## 3. Verificar variables de entorno

El archivo `.env` debe tener:

```
VITE_SUPABASE_URL=https://fbjpmqjzaltprocobgwp.supabase.co
VITE_SUPABASE_ANON_KEY=<tu clave anon o sb_publishable>
```

Si la clave no funciona, copia la correcta desde:
**Project Settings** → **API** → **Publishable key** (o **anon public** en Legacy)

## 4. Crear Super Admin

Después del primer registro de usuario:

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'tu-email@ejemplo.com';
```
