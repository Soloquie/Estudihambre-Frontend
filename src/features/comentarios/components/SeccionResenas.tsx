import { Star } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog, EstadoError, formatoPromedio, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { MiCalificacion } from '@/features/calificaciones/components/MiCalificacion'
import { useCalificaciones, useResumenCalificaciones } from '@/features/calificaciones/hooks'
import { mensajeDeError } from '@/lib/http/client'
import { useCambiarVisibilidad, useComentarios, useEliminarComentario } from '../hooks'
import type { Comentario } from '../types'
import { FormularioComentario } from './FormularioComentario'
import { ItemComentario } from './ItemComentario'

type Accion = { tipo: 'eliminar' | 'ocultar'; comentario: Comentario }

export function SeccionResenas({ establecimientoId }: { establecimientoId: number }) {
  const { usuario } = useAuth()
  const toast = useToast()
  const resumen = useResumenCalificaciones(establecimientoId)
  const calificaciones = useCalificaciones(establecimientoId)
  const comentarios = useComentarios(establecimientoId)
  const eliminar = useEliminarComentario()
  const visibilidad = useCambiarVisibilidad()
  const [editando, setEditando] = useState<number | null>(null)
  const [accion, setAccion] = useState<Accion | null>(null)

  // Para mostrar junto a cada comentario las estrellas que dio su autor.
  const puntuacionPorUsuario = new Map(
    (calificaciones.data ?? []).map((calificacion) => [calificacion.usuarioId, calificacion.puntuacion]),
  )
  const total = resumen.data?.totalCalificaciones ?? 0

  const confirmar = () => {
    if (!accion) return
    const avisar = { onError: (error: unknown) => toast.mostrar(mensajeDeError(error)) }
    if (accion.tipo === 'eliminar') {
      eliminar.mutate(accion.comentario.id, { ...avisar, onSuccess: () => toast.mostrar('Eliminaste tu comentario') })
    } else {
      visibilidad.mutate(
        { id: accion.comentario.id, accion: 'ocultar' },
        { ...avisar, onSuccess: () => toast.mostrar('Ocultaste el comentario') },
      )
    }
    setAccion(null)
  }

  return (
    <div className="tab-content" role="tabpanel">
      <div className="review-summary">
        <b>{total > 0 && resumen.data ? formatoPromedio(resumen.data.promedio) : '–'}</b>
        <div>
          <span className="rating">
            {[1, 2, 3, 4, 5].map((numero) => (
              <Star
                key={numero}
                size={16}
                fill={resumen.data && numero <= Math.round(resumen.data.promedio) ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            ))}
          </span>
          <p>{total === 1 ? '1 calificación' : `${total} calificaciones`}</p>
        </div>
      </div>

      <MiCalificacion establecimientoId={establecimientoId} />

      {usuario && editando === null && <FormularioComentario establecimientoId={establecimientoId} />}

      <h2 className="reviews-title">Comentarios</h2>
      {comentarios.isLoading && <p>Cargando comentarios…</p>}
      {comentarios.isError && (
        <EstadoError mensaje={mensajeDeError(comentarios.error)} onReintentar={() => comentarios.refetch()} />
      )}
      {comentarios.data?.length === 0 && <p className="muted-text">Aún no hay comentarios. ¡Sé el primero!</p>}
      {comentarios.data?.map((comentario) =>
        editando === comentario.id ? (
          <FormularioComentario
            key={comentario.id}
            establecimientoId={establecimientoId}
            comentario={comentario}
            onListo={() => setEditando(null)}
            onCancelar={() => setEditando(null)}
          />
        ) : (
          <ItemComentario
            key={comentario.id}
            comentario={comentario}
            puntuacion={puntuacionPorUsuario.get(comentario.usuarioId)}
            esPropio={usuario?.id === comentario.usuarioId}
            esAdmin={usuario?.rol === 'ADMIN'}
            onEditar={() => setEditando(comentario.id)}
            onEliminar={() => setAccion({ tipo: 'eliminar', comentario })}
            onOcultar={() => setAccion({ tipo: 'ocultar', comentario })}
          />
        ),
      )}

      {accion && (
        <ConfirmDialog
          titulo={accion.tipo === 'eliminar' ? '¿Eliminar tu comentario?' : '¿Ocultar este comentario?'}
          descripcion={
            accion.tipo === 'eliminar'
              ? 'Esta acción no se puede deshacer.'
              : 'Dejará de verse públicamente. Puedes restaurarlo desde el panel de administración.'
          }
          textoConfirmar={accion.tipo === 'eliminar' ? 'Eliminar comentario' : 'Ocultar comentario'}
          peligroso
          onConfirmar={confirmar}
          onCancelar={() => setAccion(null)}
        />
      )}
    </div>
  )
}
