# APIs y servicios para automatizar el Reporte Diario

## Resumen por sección

| Sección | Fuentes de datos | API/Servicio | Costo | Notas |
|--------|------------------|--------------|-------|-------|
| **COMENTARIO BURSÁTIL** | AI + datos | OpenAI/Claude API | Variable | Generar narrativa a partir del resumen de datos |
| **Mercado doméstico** | BMV, IPyC, Fibras | Yahoo Finance (yfinance) | Gratis | Tickers: ^MXX, FIBRAS*.MX |
| **Mercado EE.UU.** | DJI, S&P500, NASDAQ | Yahoo Finance, Alpha Vantage | Gratis (límite) | ^DJI, ^GSPC, ^IXIC |
| **Empresas Mayores Movimientos** | Top gainers/losers | Yahoo Finance | Gratis | `ticker.gainers`, `ticker.losers` |
| **Índices mercados accionarios** | Global indices | Yahoo Finance, Alpha Vantage | Gratis | Bovespa, Nikkei, etc. |
| **Renta fija doméstica** | TIIE, CETES | **Banxico SIE API** | Gratis | Token gratuito, TLS 1.3 |
| **Renta fija internacional** | Treasuries, LIBOR | Alpha Vantage, FRED | Gratis | Series económicas |
| **Mercado cambiario** | MXP/USD, pares FX | **Banxico SIE API**, Alpha Vantage | Gratis | Tipo de cambio FIX |
| **Commodities** | Oro, plata, petróleo | Yahoo Finance, Alpha Vantage | Gratis | GC=F, SI=F, CL=F |
| **Múltiplos Diarios** | P/E, EV/EBITDA | Financial Modeling Prep, yfinance | Gratis/Limitado | Requiere datos fundamentales |
| **Resumen del mercado** | Agregado | Derivado de otras secciones | - | Combinar datos |
| **Noticias nacionales** | Medios MX | NewsAPI, GNews, mediastack | Gratis (cupo diario) | Filtrar categoría business |
| **Noticias internacionales** | Reuters, Bloomberg | Marketaux, NewsAPI | Gratis/Limitado | business, finance |

---

## 1. Yahoo Finance (yfinance) – Python

**Uso:** Mercado doméstico, EE.UU., índices, commodities, top movers.

```python
# pip install yfinance
import yfinance as yf

# IPyC (México)
mxx = yf.Ticker("^MXX")
mxx.info  # datos actuales
mxx.history(period="5d")  # histórico

# EE.UU.
dji = yf.Ticker("^DJI")
sp500 = yf.Ticker("^GSPC")
nasdaq = yf.Ticker("^IXIC")

# Tipo de cambio MXN/USD
usdmxn = yf.Ticker("MXN=X")

# Commodities
oro = yf.Ticker("GC=F")
petroleo_brent = yf.Ticker("BZ=F")
petroleo_wti = yf.Ticker("CL=F")

# Top gainers/losers (requiere screener)
# Alternativa: yf.download(["ALFAA.MX", "GMEXICOB.MX", ...], group_by='ticker')
```

**Tickers BMV:** Sufijo `.MX` (ej: `GMEXICOB.MX`, `ALFAA.MX`, `CEMEXCPO.MX`).

---

## 2. Banxico SIE API – Renta fija y tipo de cambio

**Uso:** TIIE, CETES, tipo de cambio FIX, Mbono.

- **Documentación:** https://www.banxico.org.mx/SieAPIRest/
- **Token:** Gratuito en https://www.banxico.org.mx/SieAPIRest/service/v1/token
- **Requisito:** TLS 1.3

```bash
# Ejemplo: TIIE 28 días (serie SF43783)
GET https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43783/datos/oportun?token=TU_TOKEN
```

**Series útiles (IDs en catálogo Banxico):**
- TIIE 28d, 91d, 182d
- CETES 28d, 91d, 182d, 364d
- Tipo de cambio FIX
- Mbono 10 años

---

## 3. Alpha Vantage

**Uso:** Stocks, forex, commodities, indicadores técnicos. Plan gratuito: ~25 req/día.

- **Registro:** https://www.alphavantage.co/support/#api-key
- **Docs:** https://www.alphavantage.co/documentation/

```javascript
// Ejemplo: Cotización de IPC Mexico (símbolo puede variar)
fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^MXX&apikey=TU_KEY`)
```

---

## 4. News APIs – Noticias financieras

| API | Cupo gratis | Uso |
|-----|-------------|-----|
| **NewsAPI** | 100 req/día | `country=mx`, `category=business` |
| **GNews** | 100 req/día | Búsqueda por keywords "bolsa", "BMV" |
| **Marketaux** | Limitado | Noticias financieras con sentiment |
| **mediastack** | 100 req/mes | `country=mx`, `languages=es` |

---

## 5. Gráficos en el frontend (Vue)

Para mostrar datos dinámicos con gráficos:

| Librería | Uso | Instalación |
|----------|-----|-------------|
| **Chart.js** + **vue-chartjs** | Líneas, barras, áreas | `npm i chart.js vue-chartjs` |
| **ApexCharts** + **vue3-apexcharts** | Interactivos, múltiples series | `npm i apexcharts vue3-apexcharts` |
| **Lightweight Charts** (TradingView) | Gráficos bursátiles profesionales | `npm i lightweight-charts` |

---

## 6. Arquitectura sugerida

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRON / GitHub Actions                         │
│              (diario, ej: 18:00 hora México)                      │
└──────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function / Script Node/Python                  │
│  1. Fetch datos (Banxico, yfinance, Alpha Vantage, News)        │
│  2. Transformar a estructura del reporte                        │
│  3. Generar Comentario Bursátil (opcional: LLM)                  │
│  4. INSERT/UPDATE en Supabase daily_reports                     │
└──────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (daily_reports)                      │
│  form_responses: { datos + metadata para gráficos }              │
└──────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vue DailyReportView                           │
│  - Renderizar tablas desde form_responses                        │
│  - Gráficos con Chart.js/ApexCharts desde datos numéricos       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Limitaciones importantes

1. **Múltiplos Diarios (P/E, VE/EBITDA):** Datos fundamentales requieren Bloomberg, FMP o similar. Alternativa: calcular desde yfinance si hay datos (info.financialData).

2. **Datos en tiempo real:** La mayoría de APIs gratuitas tienen retraso (15 min – 1 día). Para tiempo real se necesitan planes de pago.

3. **Rate limits:** Alpha Vantage ~25/día; NewsAPI ~100/día. Planificar llamadas para no exceder.

4. **yfinance (Python):** No es API oficial; puede haber bloqueos si se abusa. Usar con respeto a rate limits.

5. **Comentario Bursátil:** Requiere análisis humano o integración con LLM (OpenAI/Claude) para generar texto a partir de los datos.

---

## 8. Reporte automático ya implementado

Hay una **Edge Function** en `supabase/functions/generate-daily-report/` que:

1. Consulta Banxico (TIIE, CETES, tipo de cambio)
2. Consulta Alpha Vantage (índices, commodities, forex)
3. Consulta NewsAPI (noticias MX y USA)
4. Guarda el reporte en `daily_reports`

**Configurar:** En Supabase Dashboard → Edge Functions → Secrets:
- `BANXICO_TOKEN` (obtener en banxico.org.mx/SieAPIRest)
- `ALPHA_VANTAGE_KEY` (alphavantage.co)
- `NEWSAPI_KEY` (newsapi.org)

**Usar:** Botón "Generar automático (APIs)" en Admin → Reportes diarios.

---

## 9. Siguiente paso

¿Quieres que implemente:
1. **Servicios de datos** (Edge Function o API interna) que consulten Banxico + Yahoo/Alpha Vantage?
2. **Componentes de gráficos** en Vue para mostrar series históricas en el reporte?
3. **Estructura de datos** en `form_responses` para guardar tanto texto como datos numéricos para gráficos?
