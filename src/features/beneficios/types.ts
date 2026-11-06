export type TipoBeneficio = 'DESCUENTO' | 'TIQUETERA'

/** Refleja BeneficioEstudiantilRespuestaDTO del backend. */
export type Beneficio = {
  id: number
  tipo: TipoBeneficio
  titulo: string
  descripcion: string | null
  porcentajeDescuento: number | null
  cantidadComidas: number | null
  precioTiquetera: number | null
  codigo: string | null
  /** Fechas "AAAA-MM-DD"; null = sin límite. */
  fechaInicio: string | null
  fechaFin: string | null
  activo: boolean
  /** Activo y dentro de las fechas (lo calcula el backend con la fecha de Bogotá). */
  vigente: boolean
  establecimientoId: number
}

/** Refleja BeneficioEstudiantilCrearDTO / ActualizarDTO. */
export type DatosBeneficio = {
  tipo: TipoBeneficio
  titulo: string
  descripcion: string | null
  porcentajeDescuento: number | null
  cantidadComidas: number | null
  precioTiquetera: number | null
  codigo: string | null
  fechaInicio: string | null
  fechaFin: string | null
  activo: boolean
}

export const NOMBRE_TIPO: Record<TipoBeneficio, string> = {
  DESCUENTO: 'Descuento',
  TIQUETERA: 'Tiquetera',
}
