# Reporte Diario - Automatización

## Resumen

La sección de **Reporte Diario** permite crear reportes similares al PDF de Signum con las siguientes secciones:

- **COMENTARIO BURSÁTIL** - Narrativo del día
- **Mercado doméstico** - IPyC, Fibras
- **Mercado EE.UU.** - DJI, S&P 500, NASDAQ
- **Empresas con Mayores Movimientos**
- **Índices mercados accionarios**
- **Renta fija doméstica** / **Renta fija internacional**
- **Mercado cambiario** / **Commodities**
- **Múltiplos Diarios** / **Resumen del mercado**
- **Noticias nacionales** (financieras) / **Noticias internacionales**

## Personalización por cliente

Al crear o editar un reporte en Admin → Reportes Diarios, puedes seleccionar un **Cliente** (de Admin → Clientes Reporte). Si se selecciona un cliente:

- Se usará su **logo** en el encabezado
- Se usarán sus **colores** (primario y secundario) en títulos y bordes

## ¿Se puede hacer automático diario?

Sí. Para automatizar la generación diaria necesitas:

### 1. Fuentes de datos

- **Bloomberg API** - Datos institucionales (requiere suscripción)
- **Yahoo Finance** (yfinance en Python) - Cotizaciones, índices
- **Banxico** - TIIE, CETES, tipo de cambio
- **APIs de noticias** - Reuters, Bloomberg, El Economista

### 2. Backend de automatización

**Opción A: Edge Function + Cron (Supabase)**

```ts
// supabase/functions/generate-daily-report/index.ts
// Se ejecuta diariamente vía pg_cron o servicio externo
// 1. Obtiene datos de APIs
// 2. Genera contenido por sección
// 3. Inserta en daily_reports
```

**Opción B: Script Node/Python + Cron (VPS o GitHub Actions)**

- Script que obtiene datos, formatea y hace `INSERT` vía Supabase client
- Cron: `0 18 * * 1-5` (días hábiles, 6 PM)

### 3. Pasos sugeridos

1. Crear servicios para cada fuente (ej: `BloombergService`, `BanxicoService`)
2. Definir plantillas de texto con placeholders
3. Programar ejecución diaria (Cron, GitHub Actions, Supabase Edge + pg_cron)
4. Revisar y publicar manualmente o publicar automáticamente si la calidad es consistente

### 4. Migración pendiente

Ejecuta la migración para habilitar `client_id` en reportes:

```bash
npx supabase db push
# o aplicar manualmente supabase/migrations/005_add_client_id_daily_reports.sql
```
