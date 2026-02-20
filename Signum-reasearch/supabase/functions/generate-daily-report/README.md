# Edge Function: Generar Reporte Diario Automático

Genera un reporte diario consultando APIs financieras y lo guarda en `daily_reports`.

## APIs utilizadas

| API | Datos | Variable | Obtener |
|-----|-------|----------|---------|
| **Banxico SIE** | TIIE, CETES, Tipo de cambio | `BANXICO_TOKEN` | https://www.banxico.org.mx/SieAPIRest/service/v1/token |
| **Alpha Vantage** | Índices, commodities, forex | `ALPHA_VANTAGE_KEY` | https://www.alphavantage.co/support/#api-key |
| **NewsAPI** | Noticias MX y USA | `NEWSAPI_KEY` | https://newsapi.org/register |

## Despliegue

**Importante:** La función debe desplegarse en tu proyecto Supabase (fbjpmqjzaltprocobgwp).

```bash
cd Signum-reasearch
supabase link --project-ref fbjpmqjzaltprocobgwp   # si no está enlazado

# 1. Configurar secrets en Supabase Dashboard → Edge Functions → Secrets
# O por CLI:
supabase secrets set BANXICO_TOKEN=tu_token_64_chars
supabase secrets set ALPHA_VANTAGE_KEY=tu_key
supabase secrets set NEWSAPI_KEY=tu_key

# 2. Desplegar la función
supabase functions deploy generate-daily-report
```

## Uso

**Desde Admin:** Clic en "Generar automático (APIs)" en Reportes diarios.

**Manual vía curl:**
```bash
curl -X POST "https://TU_PROYECTO.supabase.co/functions/v1/generate-daily-report" \
  -H "Authorization: Bearer TU_ANON_KEY"
```

**Cron (días hábiles 18:00):** En Supabase Dashboard → Database → Extensions → pg_cron, o usar servicio externo (cron-job.org, GitHub Actions).

## Migración: client_id

Si aparece el error `Could not find the 'client_id' column`, ejecuta en SQL Editor de Supabase:

```sql
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.report_clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_daily_reports_client ON public.daily_reports(client_id);
```
