/** Estructura completa del reporte diario tipo PDF Signum */

export interface DailyReportSections {
  /** COMENTARIO BURSÁTIL - Texto narrativo del día */
  comentario_bursatil: string

  /** Mercado doméstico - IPyC, Fibras, etc. */
  mercado_domestico: string

  /** Mercado EE.UU. - DJI, S&P 500, NASDAQ */
  mercado_eeuu: string

  /** Empresas con Mayores Movimientos - Alzas y bajas */
  empresas_mayores_movimientos: string

  /** Índices mercados accionarios - Tabla comparativa */
  indices_mercados_accionarios: string

  /** Renta fija doméstica - TIIE, CETES, Bonos */
  renta_fija_domestica: string

  /** Renta fija internacional - Treasuries, LIBOR */
  renta_fija_internacional: string

  /** Mercado cambiario - Tipos de cambio */
  mercado_cambiario: string

  /** Commodities - Petróleo, metales, energía */
  commodities: string

  /** Múltiplos Diarios - Tabla de empresas con P/U, VE/EBITDA, etc. */
  multiplos_diarios: string

  /** Resumen del mercado - Tabla de emisoras con variaciones */
  resumen_mercado: string

  /** Noticias nacionales (financieras) */
  noticias_nacionales: string

  /** Noticias internacionales */
  noticias_internacionales: string
}

export const SECTION_KEYS: (keyof DailyReportSections)[] = [
  'comentario_bursatil',
  'mercado_domestico',
  'mercado_eeuu',
  'empresas_mayores_movimientos',
  'indices_mercados_accionarios',
  'renta_fija_domestica',
  'renta_fija_internacional',
  'mercado_cambiario',
  'commodities',
  'multiplos_diarios',
  'resumen_mercado',
  'noticias_nacionales',
  'noticias_internacionales',
]

export const SECTION_LABELS: Record<keyof DailyReportSections, string> = {
  comentario_bursatil: 'COMENTARIO BURSÁTIL',
  mercado_domestico: 'Mercado doméstico',
  mercado_eeuu: 'Mercado EE.UU.',
  empresas_mayores_movimientos: 'Empresas con Mayores Movimientos',
  indices_mercados_accionarios: 'Índices mercados accionarios',
  renta_fija_domestica: 'Renta fija doméstica',
  renta_fija_internacional: 'Renta fija internacional',
  mercado_cambiario: 'Mercado cambiario',
  commodities: 'Commodities',
  multiplos_diarios: 'Múltiplos Diarios',
  resumen_mercado: 'Resumen del mercado',
  noticias_nacionales: 'Noticias nacionales (financieras)',
  noticias_internacionales: 'Noticias internacionales',
}
