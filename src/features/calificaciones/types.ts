/** Refleja CalificacionRespuestaDTO del backend. */
export type Calificacion = {
  id: number
  puntuacion: number
  usuarioId: number
  nombreUsuario: string
  establecimientoId: number
}

/** Refleja CalificacionResumenDTO del backend. */
export type ResumenCalificaciones = {
  establecimientoId: number
  promedio: number
  totalCalificaciones: number
}

/** Mínimo de calificaciones para usar el promedio en el orden por precio-calidad. */
export const MINIMO_CALIFICACIONES = 3
