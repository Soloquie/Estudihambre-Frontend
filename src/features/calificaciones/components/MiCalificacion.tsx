import { Link, useLocation } from 'react-router-dom'
import { Button, SelectorEstrellas, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { mensajeDeError } from '@/lib/http/client'
import { useCalificaciones, useEliminarCalificacion, useGuardarCalificacion } from '../hooks'

/** Permite calificar de 1 a 5. Si el usuario ya calificó, la misma acción actualiza su calificación (RF-15). */
export function MiCalificacion({ establecimientoId }: { establecimientoId: number }) {
  const { usuario } = useAuth()
  const ubicacion = useLocation()
  const toast = useToast()
  const calificaciones = useCalificaciones(establecimientoId)
  const guardar = useGuardarCalificacion()
  const eliminar = useEliminarCalificacion()

  if (!usuario) {
    const volver = encodeURIComponent(ubicacion.pathname)
    return (
      <div className="rate-box">
        <b>¿Ya comiste aquí?</b>
        <p>Inicia sesión para calificar y comentar.</p>
        <Link className="btn btn-primary" to={`/ingresar?volver=${volver}`}>
          Iniciar sesión para calificar
        </Link>
      </div>
    )
  }

  const mia = calificaciones.data?.find((calificacion) => calificacion.usuarioId === usuario.id)
  const ocupado = guardar.isPending || eliminar.isPending || calificaciones.isLoading

  const calificar = (puntuacion: number) =>
    guardar.mutate(
      { establecimientoId, calificacionId: mia?.id, puntuacion },
      {
        onSuccess: () => toast.mostrar(mia ? 'Actualizaste tu calificación' : '¡Gracias! Tu calificación se publicó'),
        onError: (error) => toast.mostrar(mensajeDeError(error, 'No pudimos guardar tu calificación')),
      },
    )

  return (
    <div className="rate-box">
      <b>{mia ? 'Tu calificación' : 'Califica este lugar'}</b>
      <p>{mia ? 'Toca otra estrella para cambiarla.' : 'Tu opinión es pública y ayuda a otros estudiantes.'}</p>
      <SelectorEstrellas valor={mia?.puntuacion ?? 0} onChange={calificar} deshabilitado={ocupado} />
      {mia && (
        <Button
          variant="text"
          disabled={ocupado}
          onClick={() =>
            eliminar.mutate(
              { calificacionId: mia.id, establecimientoId },
              {
                onSuccess: () => toast.mostrar('Quitaste tu calificación'),
                onError: (error) => toast.mostrar(mensajeDeError(error)),
              },
            )
          }
        >
          Quitar mi calificación
        </Button>
      )}
    </div>
  )
}
