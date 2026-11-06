import type { Establecimiento } from './types'

type ConHorario = Pick<Establecimiento, 'horaApertura' | 'horaCierre' | 'cerradoTemporalmente' | 'abiertoAhora'>

/** "07:00" → "7:00 a. m." */
export function horaLegible(hora: string): string {
  const [h = 0, m = 0] = hora.split(':').map(Number)
  return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, h, m))
}

/** Texto del horario: "7:00 a. m. – 3:00 p. m.", "Abierto 24 horas" o null si no lo publicaron. */
export function textoHorario(lugar: ConHorario): string | null {
  if (!lugar.horaApertura || !lugar.horaCierre) return null
  // Mismo criterio del backend: apertura igual a cierre = todo el día.
  if (lugar.horaApertura === lugar.horaCierre) return 'Abierto 24 horas'
  return `${horaLegible(lugar.horaApertura)} – ${horaLegible(lugar.horaCierre)}`
}

export type EstadoAhora = { texto: string; clase: 'open' | 'closed' | 'pending' }

/**
 * Estado actual. Se usa "abiertoAhora" del backend (hora de Bogotá), no el reloj del navegador.
 * Devuelve null cuando el lugar no publicó horario.
 */
export function estadoAhora(lugar: ConHorario): EstadoAhora | null {
  if (lugar.cerradoTemporalmente) return { texto: 'Cerrado temporalmente', clase: 'pending' }
  if (lugar.abiertoAhora === true) return { texto: 'Abierto ahora', clase: 'open' }
  if (lugar.abiertoAhora === false) return { texto: 'Cerrado ahora', clase: 'closed' }
  return null
}
