import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCalificacion,
  crearCalificacion,
  eliminarCalificacion,
  listarCalificaciones,
  obtenerResumen,
} from './api'
import type { ResumenCalificaciones } from './types'

const claveLista = (id: number | string) => ['calificaciones', String(id), 'lista'] as const
const claveResumen = (id: number | string) => ['calificaciones', String(id), 'resumen'] as const

export const useCalificaciones = (establecimientoId: number | string) =>
  useQuery({ queryKey: claveLista(establecimientoId), queryFn: () => listarCalificaciones(establecimientoId) })

export const useResumenCalificaciones = (establecimientoId: number | string) =>
  useQuery({ queryKey: claveResumen(establecimientoId), queryFn: () => obtenerResumen(establecimientoId) })

/** Resúmenes de varios establecimientos, para mostrar estrellas y ordenar en el inicio. */
export function useResumenes(ids: number[]): Map<number, ResumenCalificaciones> {
  const consultas = useQueries({
    queries: ids.map((id) => ({ queryKey: claveResumen(id), queryFn: () => obtenerResumen(id), staleTime: 60_000 })),
  })
  const resumenes = new Map<number, ResumenCalificaciones>()
  consultas.forEach((consulta, indice) => {
    const id = ids[indice]
    if (consulta.data && id !== undefined) resumenes.set(id, consulta.data)
  })
  return resumenes
}

type Variables = { establecimientoId: number; calificacionId?: number; puntuacion: number }

/** Crea la calificación o, si el usuario ya tiene una, la actualiza. */
export function useGuardarCalificacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ establecimientoId, calificacionId, puntuacion }: Variables) =>
      calificacionId
        ? actualizarCalificacion(calificacionId, puntuacion)
        : crearCalificacion(establecimientoId, puntuacion),
    onSuccess: (_resultado, { establecimientoId }) =>
      cliente.invalidateQueries({ queryKey: ['calificaciones', String(establecimientoId)] }),
  })
}

export function useEliminarCalificacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ calificacionId }: { calificacionId: number; establecimientoId: number }) =>
      eliminarCalificacion(calificacionId),
    onSuccess: (_resultado, { establecimientoId }) =>
      cliente.invalidateQueries({ queryKey: ['calificaciones', String(establecimientoId)] }),
  })
}
