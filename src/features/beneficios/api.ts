import { api } from '@/lib/http/client'
import type { Beneficio, DatosBeneficio } from './types'

/** Público: solo los beneficios vigentes de un establecimiento aprobado. */
export const listarBeneficios = (establecimientoId: number | string) =>
  api<Beneficio[]>(`/establecimientos/${establecimientoId}/beneficios-estudiantiles`)

/** Propietario o ADMIN: todos los beneficios, incluidos inactivos y vencidos. */
export const listarBeneficiosGestion = (establecimientoId: number | string) =>
  api<Beneficio[]>(`/beneficios-estudiantiles/establecimiento/${establecimientoId}`)

export const crearBeneficio = (establecimientoId: number, datos: DatosBeneficio) =>
  api<Beneficio>(`/establecimientos/${establecimientoId}/beneficios-estudiantiles`, { method: 'POST', body: datos })

export const actualizarBeneficio = (id: number, datos: Partial<DatosBeneficio>) =>
  api<Beneficio>(`/beneficios-estudiantiles/${id}`, { method: 'PUT', body: datos })

export const eliminarBeneficio = (id: number) => api<void>(`/beneficios-estudiantiles/${id}`, { method: 'DELETE' })
