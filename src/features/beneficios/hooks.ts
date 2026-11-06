import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarBeneficio, crearBeneficio, eliminarBeneficio, listarBeneficios, listarBeneficiosGestion } from './api'
import type { Beneficio, DatosBeneficio } from './types'

const clavePublica = (id: number | string) => ['beneficios', 'publicos', String(id)] as const
const claveGestion = (id: number | string) => ['beneficios', 'gestion', String(id)] as const

export const useBeneficios = (establecimientoId: number | string) =>
  useQuery({ queryKey: clavePublica(establecimientoId), queryFn: () => listarBeneficios(establecimientoId) })

export const useBeneficiosGestion = (establecimientoId: number | string) =>
  useQuery({ queryKey: claveGestion(establecimientoId), queryFn: () => listarBeneficiosGestion(establecimientoId) })

/**
 * Beneficios vigentes de varios establecimientos. El backend no tiene un listado global,
 * así que se consulta cada establecimiento (en paralelo y con caché de un minuto).
 */
export function useBeneficiosDe(ids: number[]) {
  const consultas = useQueries({
    queries: ids.map((id) => ({ queryKey: clavePublica(id), queryFn: () => listarBeneficios(id), staleTime: 60_000 })),
  })
  const porEstablecimiento = new Map<number, Beneficio[]>()
  consultas.forEach((consulta, indice) => {
    const id = ids[indice]
    if (consulta.data && id !== undefined) porEstablecimiento.set(id, consulta.data)
  })
  return {
    porEstablecimiento,
    cargando: consultas.some((consulta) => consulta.isLoading),
    conError: consultas.filter((consulta) => consulta.isError).length,
  }
}

type Guardar = { establecimientoId: number; beneficioId?: number; datos: DatosBeneficio }

export function useGuardarBeneficio() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ establecimientoId, beneficioId, datos }: Guardar) =>
      beneficioId ? actualizarBeneficio(beneficioId, datos) : crearBeneficio(establecimientoId, datos),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['beneficios'] }),
  })
}

/** Pausar o reactivar sin abrir el formulario. */
export function useCambiarActivoBeneficio() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => actualizarBeneficio(id, { activo }),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['beneficios'] }),
  })
}

export function useEliminarBeneficio() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarBeneficio(id),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['beneficios'] }),
  })
}
