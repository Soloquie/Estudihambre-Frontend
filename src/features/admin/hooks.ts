import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Establecimiento } from '@/features/establecimientos/types'
import { decidirEstablecimiento, listarPendientes, listarTodosAdmin, type Decision } from './api'

export type PestanaAdmin = 'pendientes' | 'todos'

const clave = (pestana: PestanaAdmin) => ['admin', 'establecimientos', pestana] as const

export const useEstablecimientosAdmin = (pestana: PestanaAdmin) =>
  useQuery({
    queryKey: clave(pestana),
    queryFn: pestana === 'pendientes' ? listarPendientes : listarTodosAdmin,
  })

/** Aprueba o rechaza con actualización optimista: la fila sale de "Pendientes" de inmediato. */
export function useDecidirEstablecimiento() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: Decision }) => decidirEstablecimiento(id, decision),
    onMutate: async ({ id }) => {
      await cliente.cancelQueries({ queryKey: clave('pendientes') })
      const anterior = cliente.getQueryData<Establecimiento[]>(clave('pendientes'))
      cliente.setQueryData<Establecimiento[]>(clave('pendientes'), (lista) => lista?.filter((lugar) => lugar.id !== id))
      return { anterior }
    },
    onError: (_error, _variables, contexto) => {
      if (contexto?.anterior) cliente.setQueryData(clave('pendientes'), contexto.anterior)
    },
    onSettled: () => {
      cliente.invalidateQueries({ queryKey: ['admin'] })
      cliente.invalidateQueries({ queryKey: ['establecimientos'] })
    },
  })
}
