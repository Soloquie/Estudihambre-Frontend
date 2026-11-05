import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarComentario,
  cambiarVisibilidad,
  crearComentario,
  eliminarComentario,
  listarComentarios,
  listarComentariosAdmin,
} from './api'

const CLAVE = 'comentarios'

export const useComentarios = (establecimientoId: number | string) =>
  useQuery({ queryKey: [CLAVE, String(establecimientoId)], queryFn: () => listarComentarios(establecimientoId) })

export const useComentariosAdmin = (establecimientoId?: number) =>
  useQuery({
    queryKey: [CLAVE, String(establecimientoId), 'admin'],
    queryFn: () => listarComentariosAdmin(establecimientoId as number),
    enabled: establecimientoId !== undefined,
  })

function useInvalidar() {
  const cliente = useQueryClient()
  return () => cliente.invalidateQueries({ queryKey: [CLAVE] })
}

export function useGuardarComentario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ establecimientoId, comentarioId, contenido }: { establecimientoId: number; comentarioId?: number; contenido: string }) =>
      comentarioId ? actualizarComentario(comentarioId, contenido) : crearComentario(establecimientoId, contenido),
    onSuccess: invalidar,
  })
}

export function useEliminarComentario() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: eliminarComentario, onSuccess: invalidar })
}

export function useCambiarVisibilidad() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, accion }: { id: number; accion: 'ocultar' | 'restaurar' }) => cambiarVisibilidad(id, accion),
    onSuccess: invalidar,
  })
}
