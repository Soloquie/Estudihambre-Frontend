import { METROS_POR_MINUTO, UNIVERSIDAD } from '@/config/constants'
import { api } from '@/lib/http/client'
import type { DatosEstablecimiento, Establecimiento } from './types'

function formulario(datos: Partial<DatosEstablecimiento>, imagen?: File): FormData {
  const form = new FormData()
  // Spring espera la parte "datos" como JSON; enviarla como texto produce un 415.
  form.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }))
  if (imagen) form.append('imagen', imagen)
  return form
}

export type FiltroEstablecimientos = {
  nombre?: string
  tipo?: string
  /** Busca en el título y la descripción de los menús. */
  plato?: string
  /** Al menos un menú con precio igual o menor. */
  precioMax?: number
  /** Distancia máxima caminando desde la universidad, en minutos. */
  minutosMax?: number
}

/** El backend combina todos los filtros (nombre, tipo, plato, precio y cercanía). */
export function listarEstablecimientos(filtro: FiltroEstablecimientos = {}) {
  const parametros = new URLSearchParams()
  if (filtro.nombre) parametros.set('nombre', filtro.nombre)
  if (filtro.tipo) parametros.set('tipo', filtro.tipo)
  if (filtro.plato) parametros.set('plato', filtro.plato)
  if (filtro.precioMax) parametros.set('precioMax', String(filtro.precioMax))
  if (filtro.minutosMax) {
    parametros.set('latitud', String(UNIVERSIDAD.lat))
    parametros.set('longitud', String(UNIVERSIDAD.lng))
    parametros.set('radioKm', String((filtro.minutosMax * METROS_POR_MINUTO) / 1000))
  }
  const consulta = parametros.toString()
  return api<Establecimiento[]>(`/establecimientos${consulta ? `?${consulta}` : ''}`)
}

export const obtenerEstablecimiento = (id: string) => api<Establecimiento>(`/establecimientos/${id}`)

export const listarMisEstablecimientos = () =>
  api<Establecimiento[]>('/establecimientos/mis-establecimientos')

export const crearEstablecimiento = (datos: DatosEstablecimiento, imagen: File) =>
  api<Establecimiento>('/establecimientos', { method: 'POST', body: formulario(datos, imagen) })

export const actualizarEstablecimiento = (
  id: number,
  datos: Partial<DatosEstablecimiento>,
  imagen?: File,
) => api<Establecimiento>(`/establecimientos/${id}`, { method: 'PUT', body: formulario(datos, imagen) })

export const eliminarEstablecimiento = (id: number) =>
  api<void>(`/establecimientos/${id}`, { method: 'DELETE' })
