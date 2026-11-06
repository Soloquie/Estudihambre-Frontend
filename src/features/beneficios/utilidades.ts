import { monedaCOP } from '@/lib/format'
import type { Beneficio } from './types'

/** "2026-11-30" → Date local (sin desfase por zona horaria). */
function fechaLocal(valor: string): Date {
  const [anio = 0, mes = 1, dia = 1] = valor.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

const formatoDia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const dia = (valor: string) => formatoDia.format(fechaLocal(valor))

export function precioPorComida(beneficio: Beneficio): number | null {
  if (beneficio.tipo !== 'TIQUETERA' || !beneficio.cantidadComidas || beneficio.precioTiquetera == null) return null
  return beneficio.precioTiquetera / beneficio.cantidadComidas
}

/** Lo más importante del beneficio en pocas palabras: "20% de descuento" o "10 comidas por $90.000". */
export function valorBeneficio(beneficio: Beneficio): string {
  if (beneficio.tipo === 'DESCUENTO') return `${beneficio.porcentajeDescuento ?? 0}% de descuento`
  return `${beneficio.cantidadComidas ?? 0} comidas por ${monedaCOP(beneficio.precioTiquetera ?? 0)}`
}

export function textoVigencia(beneficio: Beneficio): string {
  const { fechaInicio, fechaFin } = beneficio
  if (fechaInicio && fechaFin) return `Del ${dia(fechaInicio)} al ${dia(fechaFin)}`
  if (fechaFin) return `Hasta el ${dia(fechaFin)}`
  if (fechaInicio) return `Desde el ${dia(fechaInicio)}`
  return 'Sin fecha límite'
}

/**
 * Ahorro de la tiquetera frente a comprar el menú más económico del lugar esa misma
 * cantidad de veces. Solo se muestra si de verdad hay ahorro.
 */
export function ahorroTiquetera(beneficio: Beneficio, precioMinimo: number | null | undefined): number | null {
  if (beneficio.tipo !== 'TIQUETERA' || precioMinimo == null || !beneficio.cantidadComidas) return null
  const ahorro = precioMinimo * beneficio.cantidadComidas - (beneficio.precioTiquetera ?? 0)
  return ahorro > 0 ? ahorro : null
}

export type EstadoGestion = { texto: string; clase: 'open' | 'pending' | 'rejected' | 'closed' }

/** Estado que ve el propietario: el backend solo dice "vigente", aquí se explica el porqué. */
export function estadoGestion(beneficio: Beneficio, hoy = new Date()): EstadoGestion {
  if (!beneficio.activo) return { texto: 'Pausado', clase: 'closed' }
  if (beneficio.vigente) return { texto: 'Visible para estudiantes', clase: 'open' }
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  if (beneficio.fechaInicio && fechaLocal(beneficio.fechaInicio) > inicioHoy) return { texto: 'Programado', clase: 'pending' }
  return { texto: 'Vencido', clase: 'rejected' }
}

/** Orden para estudiantes: mejor descuento primero; tiqueteras por menor precio por comida. */
export function compararBeneficios(a: Beneficio, b: Beneficio): number {
  if (a.tipo !== b.tipo) return a.tipo === 'DESCUENTO' ? -1 : 1
  if (a.tipo === 'DESCUENTO') return (b.porcentajeDescuento ?? 0) - (a.porcentajeDescuento ?? 0)
  return (precioPorComida(a) ?? Infinity) - (precioPorComida(b) ?? Infinity)
}
