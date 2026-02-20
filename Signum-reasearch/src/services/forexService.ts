// Divisas en tiempo (casi) real vía Frankfurter API (gratuita, sin key)
// https://www.frankfurter.app/docs/

export interface ForexRate {
  base: string
  rates: Record<string, number>
  date: string
}

export async function fetchForexRates(base = 'MXN'): Promise<ForexRate> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${base}&to=USD,EUR,GBP,JPY,CAD,CHF`
  )
  if (!res.ok) throw new Error('Error al obtener cotizaciones')
  return res.json()
}

export async function fetchAllCurrencies(): Promise<Record<string, string>> {
  const res = await fetch('https://api.frankfurter.app/currencies')
  if (!res.ok) return {}
  return res.json()
}
