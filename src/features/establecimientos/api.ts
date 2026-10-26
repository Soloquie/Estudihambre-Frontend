import { api } from '@/lib/http/client'
import type { DatosEstablecimiento, Establecimiento } from './types'

function formulario(datos: Partial<DatosEstablecimiento>, imagen?: File): FormData {
  const form = new FormData()
  // Spring espera la parte "datos" como JSON; enviarla como texto produce un 415.
  form.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }))
  if (imagen) form.append('imagen', imagen)
  return form
}

export type FiltroEstablecimientos = { nombre?: string; tipo?: string }

/** El backend acepta nombre o tipo, no ambos: si llega nombre, ignora tipo. */
export function listarEstablecimientos({ nombre, tipo }: FiltroEstablecimientos = {}) {
  const parametros = new URLSearchParams()
  if (nombre) parametros.set('nombre', nombre)
  else if (tipo) parametros.set('tipo', tipo)
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
