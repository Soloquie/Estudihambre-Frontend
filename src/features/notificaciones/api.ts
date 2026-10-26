import { api } from '@/lib/http/client'

export type Notificacion = { id: number; mensaje: string; leida: boolean; fechaCreacion: string }

export const listarNotificaciones = () => api<Notificacion[]>('/notificaciones')

export const contarNoLeidas = () => api<{ cantidad: number }>('/notificaciones/no-leidas/contador')

export const marcarComoLeida = (id: number) =>
  api<Notificacion>(`/notificaciones/${id}/leer`, { method: 'PATCH' })
