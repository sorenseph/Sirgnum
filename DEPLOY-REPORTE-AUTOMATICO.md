# Desplegar Reporte Automático (Edge Function)

El error **"Edge Function no desplegada o inaccesible"** significa que la función aún no está en tu proyecto Supabase.

---

## Método rápido (sin Docker)

El CLI v1 **no tiene** el flag `--use-api`. Usa la versión **beta** que sí lo incluye:

```powershell
cd "g:\trabajos\Signum\project\Signum research\Sirgnum\Signum-reasearch"

# 1. Iniciar sesión (si aún no lo hiciste)
npx supabase login

# 2. Desplegar SIN Docker (usa CLI beta con --use-api)
npx supabase@beta functions deploy generate-daily-report --project-ref fbjpmqjzaltprocobgwp --use-api --no-verify-jwt
```

> **Nota:** Si tienes Docker instalado, puedes usar `npx supabase functions deploy generate-daily-report --project-ref fbjpmqjzaltprocobgwp` sin `@beta` ni `--use-api`.

---

## ⚠️ Configurar APIs (obligatorio para datos reales)

**Si ves "API no configurada", "N/D" o noticias vacías**, debes añadir los API keys en Supabase:

1. **Abre:** [Supabase → Project Settings → Edge Functions → Secrets](https://supabase.com/dashboard/project/fbjpmqjzaltprocobgwp/settings/functions)
2. **Clic en "Add new secret"** y añade estos 3:

| Secret | Cómo obtenerlo |
|--------|----------------|
| **BANXICO_TOKEN** | [Banxico SIE - Obtener token](https://www.banxico.org.mx/SieAPIRest/service/v1/token) (registro gratuito) |
| **ALPHA_VANTAGE_KEY** | [Alpha Vantage - API Key](https://www.alphavantage.co/support/#api-key) (gratis: 25 req/día) |
| **NEWSAPI_KEY** | [NewsAPI - Register](https://newsapi.org/register) (gratis: 100 req/día) |

3. **Redespliega** la función para que tome los secrets:
   ```powershell
   npx supabase@beta functions deploy generate-daily-report --project-ref fbjpmqjzaltprocobgwp --use-api --no-verify-jwt
   ```

> Sin estos secrets, índices (S&P 500, etc.), commodities, Banxico (TIIE, CETES) y noticias aparecerán como N/D o "API no configurada".

**Nota Alpha Vantage:** Plan gratuito = 5 solicitudes/minuto. El reporte hace 10 llamadas en 2 lotes con pausa de 15s. Puede tardar ~30 s. Si ves N/D en índices/commodities, espera 1 min y genera de nuevo (límite de tasa).

**Noticias:** Nacionales usan búsqueda México/Banxico/BMV si top-headlines está vacío. Internacionales se traducen automáticamente al español (MyMemory).

---

## Opción 1: Con Supabase CLI (instalado en el sistema)

> **Nota:** `npm install -g supabase` NO está soportado. Usa uno de estos métodos:

### 1. Instalar Supabase CLI

**Opción A - Scoop (recomendado en Windows):**
```powershell
# Si no tienes Scoop: https://scoop.sh
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Opción B - Chocolatey (requiere admin):**
```powershell
choco install supabase
```

**Opción C - npx (sin instalar globalmente):**
```powershell
cd "g:\trabajos\Signum\project\Signum research\Sirgnum\Signum-reasearch"
npm install supabase --save-dev
# Luego usa: npx supabase <comando>
```

### 2. Iniciar sesión en Supabase

```powershell
# Si instalaste con Scoop/Chocolatey:
supabase login

# Si usas npx:
npx supabase login
```

Se abrirá el navegador para autenticarte.

### 3. Enlazar tu proyecto

```powershell
cd "g:\trabajos\Signum\project\Signum research\Sirgnum\Signum-reasearch"
npx supabase link --project-ref fbjpmqjzaltprocobgwp
```

Introduce la contraseña de la base de datos si la pide.

### 4. Desplegar la función

```powershell
npx supabase functions deploy generate-daily-report
```

### 5. Configurar Secrets (API keys)

En **Supabase Dashboard** → tu proyecto → **Edge Functions** → **Secrets**:

| Nombre | Dónde obtenerlo |
|--------|-----------------|
| `BANXICO_TOKEN` | https://www.banxico.org.mx/SieAPIRest/service/v1/token |
| `ALPHA_VANTAGE_KEY` | https://www.alphavantage.co/support/#api-key |
| `NEWSAPI_KEY` | https://newsapi.org/register |

Sin estos secrets, el reporte se generará pero con mensajes "API no configurada" en algunas secciones.

---

## Opción 2: Desde Supabase Dashboard (sin CLI ni Docker)

Si el CLI falla o no tienes Docker:

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard/project/fbjpmqjzaltprocobgwp)
2. Ve a **Edge Functions** en el menú izquierdo
3. Clic en **Create a new function**
4. Nombre: `generate-daily-report`
5. Copia todo el contenido de `supabase/functions/generate-daily-report/index.ts`
6. Pégalo en el editor y haz clic en **Deploy**
7. En **Secrets** (Project Settings → Edge Functions), añade: BANXICO_TOKEN, ALPHA_VANTAGE_KEY, NEWSAPI_KEY

---

## Verificar

Después del deploy, en Admin → Reportes diarios, haz clic en **"Generar automático (APIs)"**. Debería crear un reporte borrador.
