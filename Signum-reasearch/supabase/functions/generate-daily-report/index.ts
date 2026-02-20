/**
 * Edge Function: Genera reporte diario automático consultando APIs financieras
 *
 * APIs utilizadas:
 * - Banxico SIE: TIIE, CETES, Tipo de cambio (requiere BANXICO_TOKEN)
 * - Alpha Vantage: Índices, commodities, forex (requiere ALPHA_VANTAGE_KEY, 25 req/día)
 * - NewsAPI: Noticias (requiere NEWSAPI_KEY). Plan free: 24h de delay en artículos
 * - GNews: Noticias México (opcional GNEWS_API_KEY, mejora cobertura nacional)
 *
 * Traducción: LibreTranslate + MyMemory (sin API key)
 *
 * Secrets en Supabase: BANXICO_TOKEN, ALPHA_VANTAGE_KEY, NEWSAPI_KEY, GNEWS_API_KEY
 *
 * Ejecutar: POST /functions/v1/generate-daily-report
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS: debe incluir "authorization" para que el cliente envíe el JWT
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const BANXICO_TOKEN = Deno.env.get("BANXICO_TOKEN")
const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_KEY")
const NEWSAPI_KEY = Deno.env.get("NEWSAPI_KEY")
const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Series Banxico (IDs del catálogo SIE - ver https://www.banxico.org.mx/SieAPIRest/)
const BANXICO_SERIES = {
  TIIE_28D: "SF43783",
  CETES_28D: "SF60632",
  TIPO_CAMBIO_FIX: "SF60633",
  MBNO_10A: "SF61839",
}

async function fetchBanxico(seriesId: string): Promise<string> {
  if (!BANXICO_TOKEN) return "API Banxico no configurada (BANXICO_TOKEN)"
  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesId}/datos/oportuno`
    const res = await fetch(url, {
      headers: { "Bmx-Token": BANXICO_TOKEN, "Accept": "application/json" },
    })
    if (!res.ok) return `Error Banxico: ${res.status}`
    const json = await res.json()
    const datos = json?.bmx?.series?.[0]?.datos
    if (!datos?.length) return "Sin datos"
    const last = datos[datos.length - 1]
    return `${last.dato} (${last.fecha})`
  } catch (e) {
    return `Error: ${(e as Error).message}`
  }
}

async function fetchAlphaVantage(symbol: string): Promise<Record<string, unknown> | null> {
  if (!ALPHA_VANTAGE_KEY) return null
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_KEY}`
    const res = await fetch(url)
    const json = await res.json()
    if (json?.Note) return null
    const q = json?.["Global Quote"]
    return q && typeof q === "object" && Object.keys(q).length > 1 ? q : null
  } catch {
    return null
  }
}

async function fetchAlphaVantageForex(from: string, to: string): Promise<Record<string, unknown> | null> {
  if (!ALPHA_VANTAGE_KEY) return null
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${ALPHA_VANTAGE_KEY}`
    const res = await fetch(url)
    const json = await res.json()
    if (json?.Note) return null
    return json?.["Realtime Currency Exchange Rate"] || null
  } catch {
    return null
  }
}

/** Traduce texto EN→ES. Intenta LibreTranslate (más fiable en servidor), luego MyMemory. */
async function translateToSpanish(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return ""
  const truncated = text.length > 450 ? text.slice(0, 450) : text

  async function fetchWithTimeout(url: string, opts: RequestInit, ms: number): Promise<Response> {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), ms)
    try {
      return await fetch(url, { ...opts, signal: c.signal })
    } finally {
      clearTimeout(t)
    }
  }

  // LibreTranslate (permite uso server-side, sin API key en instancia pública)
  try {
    const res = await fetchWithTimeout(
      "https://libretranslate.com/translate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: truncated, source: "en", target: "es" }),
      },
      6000
    )
    if (res.ok) {
      const json = await res.json()
      const t = json?.translatedText
      if (typeof t === "string" && t.length > 0 && t !== truncated) return t
    }
  } catch (_) {}

  // MyMemory como fallback
  try {
    const res = await fetchWithTimeout(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncated)}&langpair=en|es`,
      { headers: { "User-Agent": "SignumResearch/1.0" } },
      5000
    )
    const json = await res.json()
    const t = json?.responseData?.translatedText
    if (typeof t === "string" && t.length > 0 && t !== truncated) return t
  } catch (_) {}

  return truncated
}

async function fetchNewsAPI(
  countryOrQuery: string,
  category = "business",
  useEverything = false,
  anyLanguage = false
): Promise<string[]> {
  if (!NEWSAPI_KEY) return ["API de noticias no configurada (NEWSAPI_KEY)"]
  try {
    let url: string
    if (useEverything) {
      const params: Record<string, string> = {
        q: countryOrQuery,
        sortBy: "publishedAt",
        apiKey: NEWSAPI_KEY,
        pageSize: "5",
      }
      if (!anyLanguage) params.language = "es"
      url = `https://newsapi.org/v2/everything?${new URLSearchParams(params)}`
    } else {
      const params = new URLSearchParams({
        country: countryOrQuery,
        category,
        apiKey: NEWSAPI_KEY,
        pageSize: "5",
      })
      url = `https://newsapi.org/v2/top-headlines?${params}`
    }
    const res = await fetch(url)
    const json = await res.json()
    const articles = json?.articles || []
    const mapped = articles.slice(0, 5).map((a: { title?: string; description?: string }) => {
      const title = (a.title || "").trim()
      if (!title || title === "[Removed]") return null
      const desc = a.description ? a.description.slice(0, 350).replace(/\s+/g, " ").trim() : ""
      return `• ${title}${desc ? ` — ${desc}` : ""}`
    })
    return mapped.filter((x): x is string => !!x)
  } catch (e) {
    return [`Error noticias: ${(e as Error).message}`]
  }
}

/** GNews: noticias por país y categoría (opcional GNEWS_API_KEY) */
async function fetchGNewsNational(): Promise<string[]> {
  if (!GNEWS_API_KEY) return []
  try {
    const url = `https://gnews.io/api/v4/top-headlines?country=mx&category=business&max=5&apikey=${GNEWS_API_KEY}`
    const res = await fetch(url)
    const json = await res.json()
    const articles = json?.articles || []
    return articles.slice(0, 5).map((a: { title?: string; description?: string }) => {
      const title = (a.title || "").trim()
      if (!title) return null
      const desc = a.description ? a.description.slice(0, 350).replace(/\s+/g, " ").trim() : ""
      return `• ${title}${desc ? ` — ${desc}` : ""}`
    }).filter((x): x is string => !!x)
  } catch {
    return []
  }
}

/** GNews search como fallback */
async function fetchGNewsSearch(query: string): Promise<string[]> {
  if (!GNEWS_API_KEY) return []
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=es&max=5&apikey=${GNEWS_API_KEY}`
    const res = await fetch(url)
    const json = await res.json()
    const articles = json?.articles || []
    return articles.slice(0, 5).map((a: { title?: string; description?: string }) => {
      const title = (a.title || "").trim()
      if (!title) return null
      const desc = a.description ? a.description.slice(0, 350).replace(/\s+/g, " ").trim() : ""
      return `• ${title}${desc ? ` — ${desc}` : ""}`
    }).filter((x): x is string => !!x)
  } catch {
    return []
  }
}

/** Noticias nacionales: NewsAPI + GNews (si hay key) + queries amplias */
async function fetchNewsNational(): Promise<string[]> {
  // 1. GNews top-headlines México (más fiable, sin delay de 24h en plan free)
  const gnewsHeadlines = await fetchGNewsNational()
  if (gnewsHeadlines.length > 0) return gnewsHeadlines

  // 2. NewsAPI top-headlines mx
  const headlines = await fetchNewsAPI("mx", "business")
  if (headlines.length > 0 && !headlines[0].includes("Error")) return headlines

  const headlinesGeneral = await fetchNewsAPI("mx", "general")
  if (headlinesGeneral.length > 0 && !headlinesGeneral[0].includes("Error")) return headlinesGeneral

  // 3. NewsAPI everything (algunas búsquedas sin filtro idioma para más resultados)
  const queries: [string, boolean][] = [
    ["México economía Banxico BMV IPC", false],
    ["Mexico economy BMV stock market", true],
    ["Bolsa Mexicana valores", false],
    ["Banxico tasa interés", false],
  ]
  for (const [q, anyLang] of queries) {
    const results = await fetchNewsAPI(q, "business", true, anyLang)
    if (results.length > 0 && !results[0].includes("Error")) return results
    await delay(300)
  }

  // 4. GNews search como último recurso
  const gnewsSearch = await fetchGNewsSearch("México economía finanzas")
  if (gnewsSearch.length > 0) return gnewsSearch

  return []
}

/** Noticias internacionales + traducción al español */
async function fetchNewsInternational(): Promise<string[]> {
  const raw = await fetchNewsAPI("us", "business")
  if (raw.length === 0 || raw[0].includes("Error")) return raw
  const translated: string[] = []
  for (const item of raw) {
    const clean = item.replace(/^•\s*/, "")
    const sep = clean.indexOf(" — ")
    const title = sep > 0 ? clean.slice(0, sep) : clean
    const desc = sep > 0 ? clean.slice(sep + 3) : ""
    const titleEs = await translateToSpanish(title.slice(0, 450))
    await delay(400)
    const descEs = desc ? await translateToSpanish(desc.slice(0, 450)) : ""
    translated.push(`• ${titleEs}${descEs ? ` — ${descEs}` : ""}`)
    await delay(400)
  }
  return translated
}

function formatQuote(q: Record<string, unknown> | null): string {
  if (!q) return "N/D"
  const price = q["05. price"]
  const change = q["09. change"]
  const pct = q["10. change percent"]
  return `${price} (${change} ${pct})`
}

/** Alpha Vantage free tier: 5 req/min. Ejecutar en 2 lotes con pausa. */
async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const sections: Record<string, string> = {}

    // Banxico + Noticias nacionales (sin límite de rate)
    const [tiie, cetes, mbono, fix, noticiasNac] = await Promise.all([
      fetchBanxico(BANXICO_SERIES.TIIE_28D),
      fetchBanxico(BANXICO_SERIES.CETES_28D),
      fetchBanxico(BANXICO_SERIES.MBNO_10A),
      fetchBanxico(BANXICO_SERIES.TIPO_CAMBIO_FIX),
      fetchNewsNational(),
    ])

    // Alpha Vantage free: 5 req/min. Lote 1 (5 req) → pausa 65s → lote 2 (5 req)
    const [fx, spyQ, diaQ, qqqQ, ewwQ] = await Promise.all([
      fetchAlphaVantageForex("MXN", "USD"),
      fetchAlphaVantage("SPY"),
      fetchAlphaVantage("DIA"),
      fetchAlphaVantage("QQQ"),
      fetchAlphaVantage("EWW"),
    ])
    await delay(65000)
    const [[gcQ, siQ, clQ, bzQ, tnxQ], noticiasInt] = await Promise.all([
      Promise.all([
        fetchAlphaVantage("GC=F"),
        fetchAlphaVantage("SI=F"),
        fetchAlphaVantage("CL=F"),
        fetchAlphaVantage("BZ=F"),
        fetchAlphaVantage("TNX"),
      ]),
      fetchNewsInternational(),
    ])

    sections.renta_fija_domestica = `TIIE 28D: ${tiie}\nCETES 28D: ${cetes}\nMbono 10 años: ${mbono}\n\nFuente: Banxico SIE`

    const usdmxn = fx ? `${(fx["5. Exchange Rate"] as string) || "N/D"} (realtime)` : "N/D"
    sections.mercado_cambiario = `Tipo de cambio FIX: ${fix}\nMXN/USD (Alpha Vantage): ${usdmxn}\n\nFuente: Banxico / Alpha Vantage`

    const quotes = [
      `S&P 500 (ETF): ${formatQuote(spyQ)}`,
      `Dow Jones (ETF): ${formatQuote(diaQ)}`,
      `NASDAQ (ETF): ${formatQuote(qqqQ)}`,
      `México (ETF): ${formatQuote(ewwQ)}`,
    ]
    sections.mercado_eeuu = quotes.join("\n")
    sections.indices_mercados_accionarios = quotes.join("\n") + "\n\nFuente: Alpha Vantage"

    const commQuotes = [
      `Oro: ${formatQuote(gcQ)}`,
      `Plata: ${formatQuote(siQ)}`,
      `WTI: ${formatQuote(clQ)}`,
      `Brent: ${formatQuote(bzQ)}`,
    ]
    sections.commodities = commQuotes.join("\n") + "\n\nFuente: Alpha Vantage"

    sections.renta_fija_internacional = `US Treasury 10Y: ${formatQuote(tnxQ)}\n\nFuente: Alpha Vantage`
    sections.mercado_domestico = `IPC México (ETF EWW): ${quotes.find((q) => q.startsWith("México")) || "N/D"}\n\nGenerado automáticamente. Para datos BMV completos, integrar Yahoo Finance (yfinance) vía backend Python.`
    sections.noticias_nacionales = noticiasNac.join("\n\n") || "Sin noticias disponibles"
    sections.noticias_internacionales = noticiasInt.join("\n\n") || "Sin noticias disponibles"

    // --- Comentario bursátil (resumen automático) ---
    const hasIndices = !quotes.every((q) => q.includes("N/D"))
    const hasCommodities = !commQuotes.every((q) => q.includes("N/D"))
    const sources = ["Banxico", "Alpha Vantage", "NewsAPI"].filter(Boolean)
    sections.comentario_bursatil = `Reporte diario generado automáticamente el ${today}. Incluye: renta fija (TIIE, CETES, Mbono), mercado cambiario (FIX, MXN/USD), índices y commodities${hasIndices || hasCommodities ? " con datos de mercado" : ""}, y noticias financieras. Fuentes: ${sources.join(", ")}.`

    // --- Placeholders para secciones que requieren datos adicionales ---
    sections.empresas_mayores_movimientos = "Top alzas y bajas BMV. Requiere integración con Yahoo Finance o similar (futura actualización)."
    sections.multiplos_diarios = "P/E, VE/EBITDA y demás múltiplos. Requiere integración con Financial Modeling Prep (plan gratuito) o similar."
    sections.resumen_mercado = `Resumen del ${today}. Consolidado de índices y commodities.`

    const formResponses = {
      comentario_bursatil: sections.comentario_bursatil,
      mercado_domestico: sections.mercado_domestico,
      mercado_eeuu: sections.mercado_eeuu,
      empresas_mayores_movimientos: sections.empresas_mayores_movimientos,
      indices_mercados_accionarios: sections.indices_mercados_accionarios,
      renta_fija_domestica: sections.renta_fija_domestica,
      renta_fija_internacional: sections.renta_fija_internacional,
      mercado_cambiario: sections.mercado_cambiario,
      commodities: sections.commodities,
      multiplos_diarios: sections.multiplos_diarios,
      resumen_mercado: sections.resumen_mercado,
      noticias_nacionales: sections.noticias_nacionales,
      noticias_internacionales: sections.noticias_internacionales,
    }

    const { data, error } = await supabase.from("daily_reports").insert({
      title: `Reporte Diario - ${today}`,
      report_date: today,
      form_responses: formResponses,
      is_published: true,
      author_id: null,
    }).select("id").single()

    if (error) {
      return Response.json({ error: error.message }, {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return Response.json(
      {
        success: true,
        reportId: data?.id,
        message: "Reporte diario generado y publicado.",
      },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
