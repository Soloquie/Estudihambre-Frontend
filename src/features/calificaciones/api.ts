import { api } from '@/lib/http/client'
import type { Calificacion, ResumenCalificaciones } from './types'

export const listarCalificaciones = (establecimientoId: number | string) =>
  api<Calificacion[]>(`/establecimientos/${establecimientoId}/calificaciones`)

export const obtenerResumen = (establecimientoId: number | string) =>
  api<ResumenCalificaciones>(`/establecimientos/${establecimientoId}/calificaciones/resumen`)

export const crearCalificacion = (establecimientoId: number, puntuacion: number) =>
  api<Calificacion>(`/establecimientos/${establecimientoId}/calificaciones`, {
    method: 'POST',
    body: { puntuacion },
  })

export const actualizarCalificacion = (id: number, puntuacion: number) =>
  api<Calificacion>(`/calificaciones/${id}`, { method: 'PUT', body: { puntuacion } })

export const eliminarCalificacion = (id: number) => api<void>(`/calificaciones/${id}`, { method: 'DELETE' })
