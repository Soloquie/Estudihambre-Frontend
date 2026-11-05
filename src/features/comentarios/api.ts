import { api } from '@/lib/http/client'
import type { Comentario } from './types'

export const listarComentarios = (establecimientoId: number | string) =>
  api<Comentario[]>(`/establecimientos/${establecimientoId}/comentarios`)

export const crearComentario = (establecimientoId: number, contenido: string) =>
  api<Comentario>(`/establecimientos/${establecimientoId}/comentarios`, { method: 'POST', body: { contenido } })

export const actualizarComentario = (id: number, contenido: string) =>
  api<Comentario>(`/comentarios/${id}`, { method: 'PUT', body: { contenido } })

export const eliminarComentario = (id: number) => api<void>(`/comentarios/${id}`, { method: 'DELETE' })

/** Solo ADMIN: incluye los comentarios ocultos. */
export const listarComentariosAdmin = (establecimientoId: number | string) =>
  api<Comentario[]>(`/admin/comentarios/establecimientos/${establecimientoId}`)

export const cambiarVisibilidad = (id: number, accion: 'ocultar' | 'restaurar') =>
  api<Comentario>(`/admin/comentarios/${id}/${accion}`, { method: 'PATCH' })
