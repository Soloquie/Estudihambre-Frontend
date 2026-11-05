import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button, EstadoError, EstadoVacio, useToast } from '@/components/ui'
import { useCambiarVisibilidad, useComentariosAdmin } from '@/features/comentarios/hooks'
import { fechaCorta } from '@/lib/format'
import { mensajeDeError } from '@/lib/http/client'
import { useEstablecimientosAdmin } from '../hooks'

/** Moderación (RF-20): el administrador ve todos los comentarios, incluidos los ocultos, y decide cuáles se muestran. */
export function ModeracionComentarios() {
  const todos = useEstablecimientosAdmin('todos')
  const aprobados = (todos.data ?? []).filter((lugar) => lugar.estado === 'APROBADO')
  const [seleccionado, setSeleccionado] = useState<number>()
  const establecimientoId = seleccionado ?? aprobados[0]?.id
  const comentarios = useComentariosAdmin(establecimientoId)
  const visibilidad = useCambiarVisibilidad()
  const toast = useToast()

  if (todos.isLoading) return <p className="state-box">Cargando…</p>
  if (aprobados.length === 0) return <EstadoVacio titulo="No hay establecimientos aprobados con comentarios" />

  return (
    <section className="table-card moderation">
      <label className="moderation-select">
        Establecimiento
        <select value={establecimientoId} onChange={(evento) => setSeleccionado(Number(evento.target.value))}>
          {aprobados.map((lugar) => (
            <option key={lugar.id} value={lugar.id}>
              {lugar.nombre}
            </option>
          ))}
        </select>
      </label>

      {comentarios.isError && (
        <EstadoError mensaje={mensajeDeError(comentarios.error)} onReintentar={() => comentarios.refetch()} />
      )}
      {comentarios.data?.length === 0 && <EstadoVacio titulo="Este establecimiento aún no tiene comentarios" />}
      {Boolean(comentarios.data?.length) && (
        <table>
          <thead>
            <tr>
              <th>Autor</th>
              <th>Comentario</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {comentarios.data?.map((comentario) => {
              const visible = comentario.estado === 'VISIBLE'
              return (
                <tr key={comentario.id}>
                  <td>
                    <b>{comentario.nombreUsuario}</b>
                  </td>
                  <td className="comment-cell">{comentario.contenido}</td>
                  <td>{fechaCorta(comentario.fecha)}</td>
                  <td>
                    <span className={`status ${visible ? 'open' : 'rejected'}`}>{visible ? 'Visible' : 'Oculto'}</span>
                  </td>
                  <td>
                    <Button
                      variant={visible ? 'danger' : 'secondary'}
                      disabled={visibilidad.isPending}
                      onClick={() =>
                        visibilidad.mutate(
                          { id: comentario.id, accion: visible ? 'ocultar' : 'restaurar' },
                          {
                            onSuccess: () => toast.mostrar(visible ? 'Ocultaste el comentario' : 'Restauraste el comentario'),
                            onError: (error) => toast.mostrar(mensajeDeError(error)),
                          },
                        )
                      }
                    >
                      {visible ? <EyeOff size={16} /> : <Eye size={16} />} {visible ? 'Ocultar' : 'Restaurar'}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
