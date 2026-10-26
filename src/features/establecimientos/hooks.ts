import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEstablecimiento,
  crearEstablecimiento,
  eliminarEstablecimiento,
  listarEstablecimientos,
  listarMisEstablecimientos,
  obtenerEstablecimiento,
  type FiltroEstablecimientos,
} from './api'
import type { DatosEstablecimiento } from './types'

export const CLAVES = {
  todos: ['establecimientos'] as const,
  lista: (filtro: FiltroEstablecimientos) => ['establecimientos', 'lista', filtro] as const,
  detalle: (id: string) => ['establecimientos', 'detalle', id] as const,
  mios: ['establecimientos', 'mios'] as const,
}

export const useEstablecimientos = (filtro: FiltroEstablecimientos) =>
  useQuery({ queryKey: CLAVES.lista(filtro), queryFn: () => listarEstablecimientos(filtro) })

export const useEstablecimiento = (id: string) =>
  useQuery({ queryKey: CLAVES.detalle(id), queryFn: () => obtenerEstablecimiento(id), retry: false })

export const useMisEstablecimientos = () =>
  useQuery({ queryKey: CLAVES.mios, queryFn: listarMisEstablecimientos })

function useInvalidarEstablecimientos() {
  const cliente = useQueryClient()
  return () => cliente.invalidateQueries({ queryKey: CLAVES.todos })
}

export function useCrearEstablecimiento() {
  const invalidar = useInvalidarEstablecimientos()
  return useMutation({
    mutationFn: ({ datos, imagen }: { datos: DatosEstablecimiento; imagen: File }) =>
      crearEstablecimiento(datos, imagen),
    onSuccess: invalidar,
  })
}

export function useActualizarEstablecimiento() {
  const invalidar = useInvalidarEstablecimientos()
  return useMutation({
    mutationFn: ({ id, datos, imagen }: { id: number; datos: DatosEstablecimiento; imagen?: File }) =>
      actualizarEstablecimiento(id, datos, imagen),
    onSuccess: invalidar,
  })
}

export function useEliminarEstablecimiento() {
  const invalidar = useInvalidarEstablecimientos()
  return useMutation({ mutationFn: eliminarEstablecimiento, onSuccess: invalidar })
}
