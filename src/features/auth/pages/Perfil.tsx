import { Bell, ChevronRight, LogOut, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EstadoError, EstadoVacio, useToast } from '@/components/ui'
import { useMarcarLeida, useNotificaciones } from '@/features/notificaciones/hooks'
import { fechaCorta, iniciales } from '@/lib/format'
import { mensajeDeError } from '@/lib/http/client'
import { useAuth } from '../AuthProvider'

export function Perfil() {
  const { usuario, salir } = useAuth()
  const navegar = useNavigate()
  const toast = useToast()
  const notificaciones = useNotificaciones()
  const marcarLeida = useMarcarLeida()

  if (!usuario) return null
  const esAdmin = usuario.rol === 'ADMIN'

  const cerrar = async () => {
    try {
      await salir()
      navegar('/')
    } catch (error) {
      toast.mostrar(mensajeDeError(error, 'No pudimos cerrar la sesión'))
    }
  }

  return (
    <main className="page subpage profile-page">
      <div className="profile-head">
        <span>{iniciales(usuario.nombre)}</span>
        <div>
          <h1>{usuario.nombre}</h1>
          <p>{usuario.correo}</p>
        </div>
      </div>

      <section className="profile-section" aria-labelledby="titulo-notificaciones">
        <h2 id="titulo-notificaciones">
          <Bell size={20} /> Notificaciones
        </h2>
        {notificaciones.isError && (
          <EstadoError mensaje={mensajeDeError(notificaciones.error)} onReintentar={() => notificaciones.refetch()} />
        )}
        {notificaciones.data?.length === 0 && <EstadoVacio titulo="No tienes notificaciones" />}
        <div className="notification-list">
          {notificaciones.data?.map((notificacion) => (
            <button
              key={notificacion.id}
              type="button"
              className={notificacion.leida ? '' : 'unread'}
              onClick={() => !notificacion.leida && marcarLeida.mutate(notificacion.id)}
            >
              <span>
                {!notificacion.leida && <b>Nueva · </b>}
                {notificacion.mensaje}
              </span>
              <small>{fechaCorta(notificacion.fechaCreacion)}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="settings-list">
        <button type="button" onClick={() => navegar(esAdmin ? '/admin' : '/mis-establecimientos')}>
          <Store /> {esAdmin ? 'Panel de administración' : 'Mis establecimientos'} <ChevronRight />
        </button>
        <button type="button" className="logout" onClick={cerrar}>
          <LogOut /> Cerrar sesión
        </button>
      </div>
    </main>
  )
}
