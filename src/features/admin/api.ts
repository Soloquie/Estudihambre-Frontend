import { api } from '@/lib/http/client'
import type { Establecimiento } from '@/features/establecimientos/types'

export type Decision = 'aprobar' | 'rechazar'

export const listarPendientes = () => api<Establecimiento[]>('/admin/establecimientos/pendientes')

export const listarTodosAdmin = () => api<Establecimiento[]>('/admin/establecimientos')

export const decidirEstablecimiento = (id: number, decision: Decision) =>
  api<Establecimiento>(`/admin/establecimientos/${id}/${decision}`, { method: 'PATCH' })
