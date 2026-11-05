import { ArrowLeft, Bell, Check, Clock3, LogOut, MessageSquare, Store, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, EstadoBadge, EstadoError, EstadoVacio, Logo, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import type { Establecimiento } from '@/features/establecimientos/types'
import { mensajeDeError } from '@/lib/http/client'
import type { Decision } from '../api'
import { ModeracionComentarios } from '../components/ModeracionComentarios'
import { useDecidirEstablecimiento, useEstablecimientosAdmin, type PestanaAdmin } from '../hooks'

type Pendiente = { lugar: Establecimiento; decision: Decision }

export function AdminEstablecimientos() {
  const [pestana, setPestana] = useState<PestanaAdmin | 'comentarios'>('pendientes')
  const [confirmacion, setConfirmacion] = useState<Pendiente | null>(null)
  const consulta = useEstablecimientosAdmin(pestana === 'comentarios' ? 'todos' : pestana)
  const pendientes = useEstablecimientosAdmin('pendientes')
  const todos = useEstablecimientosAdmin('todos')
  const decidir = useDecidirEstablecimiento()
  const { salir } = useAuth()
  const navegar = useNavigate()
  const toast = useToast()

  const aprobados = todos.data?.filter((lugar) => lugar.estado === 'APROBADO').length ?? 0
  const rechazados = todos.data?.filter((lugar) => lugar.estado === 'RECHAZADO').length ?? 0

  const confirmar = () => {
    if (!confirmacion) return
    const { lugar, decision } = confirmacion
    decidir.mutate(
      { id: lugar.id, decision },
      {
        onSuccess: () => toast.mostrar(`${lugar.nombre} fue ${decision === 'aprobar' ? 'aprobado' : 'rechazado'}`),
        onError: (error) => toast.mostrar(mensajeDeError(error)),
      },
    )
    setConfirmacion(null)
  }

  const cerrarSesion = async () => {
    await salir()
    navegar('/')
  }

  return (
    <div className="admin-shell">
      <aside>
        <Logo />
        <div className="admin-label">ADMINISTRACIÓN</div>
        <nav aria-label="Administración">
          <button type="button" className={pestana === 'pendientes' ? 'active' : ''} onClick={() => setPestana('pendientes')}>
            <Clock3 /> Pendientes {Boolean(pendientes.data?.length) && <span>{pendientes.data?.length}</span>}
          </button>
          <button type="button" className={pestana === 'todos' ? 'active' : ''} onClick={() => setPestana('todos')}>
            <Store /> Todos
          </button>
          <button type="button" className={pestana === 'comentarios' ? 'active' : ''} onClick={() => setPestana('comentarios')}>
            <MessageSquare /> Comentarios
          </button>
          <Link className="admin-nav-link" to="/perfil">
            <Bell /> Notificaciones
          </Link>
        </nav>
        <Link className="admin-exit" to="/">
          <ArrowLeft /> Volver al sitio
        </Link>
        <button type="button" className="admin-exit" onClick={cerrarSesion}>
          <LogOut /> Cerrar sesión
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <p>Panel de administración</p>
            <h1>{pestana === 'comentarios' ? 'Comentarios' : 'Establecimientos'}</h1>
            <span>
              {pestana === 'comentarios'
                ? 'Oculta o restaura los comentarios publicados en cada establecimiento.'
                : 'Revisa y aprueba los establecimientos que registran los propietarios.'}
            </span>
          </div>
        </div>

        <div className="admin-stats">
          <article>
            <span>Pendientes</span>
            <b>{pendientes.data?.length ?? '–'}</b>
            <Clock3 />
          </article>
          <article>
            <span>Aprobados</span>
            <b>{todos.data ? aprobados : '–'}</b>
            <Check />
          </article>
          <article>
            <span>Rechazados</span>
            <b>{todos.data ? rechazados : '–'}</b>
            <X />
          </article>
        </div>

        {pestana === 'comentarios' ? (
          <ModeracionComentarios />
        ) : (
        <section className="table-card">
          {consulta.isLoading && <p className="state-box">Cargando…</p>}
          {consulta.isError && (
            <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => consulta.refetch()} />
          )}
          {consulta.data?.length === 0 && (
            <EstadoVacio
              titulo={pestana === 'pendientes' ? 'No hay establecimientos por revisar' : 'Aún no hay establecimientos'}
            />
          )}
          {Boolean(consulta.data?.length) && (
            <table>
              <thead>
                <tr>
                  <th>Establecimiento</th>
                  <th>Tipo</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consulta.data?.map((lugar) => (
                  <tr key={lugar.id}>
                    <td>
                      <b>{lugar.nombre}</b>
                    </td>
                    <td>{lugar.tipo}</td>
                    <td>{lugar.direccion}</td>
                    <td>{lugar.telefono ?? '—'}</td>
                    <td>
                      <EstadoBadge estado={lugar.estado} />
                    </td>
                    <td>
                      {lugar.estado === 'PENDIENTE' ? (
                        <div className="owner-actions">
                          <Button onClick={() => setConfirmacion({ lugar, decision: 'aprobar' })}>
                            <Check size={16} /> Aprobar
                          </Button>
                          <Button variant="danger" onClick={() => setConfirmacion({ lugar, decision: 'rechazar' })}>
                            <X size={16} /> Rechazar
                          </Button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        )}
      </main>

      {confirmacion && (
        <ConfirmDialog
          titulo={`¿${confirmacion.decision === 'aprobar' ? 'Aprobar' : 'Rechazar'} ${confirmacion.lugar.nombre}?`}
          descripcion={
            confirmacion.decision === 'aprobar'
              ? 'Se publicará para todos los estudiantes y su propietario podrá agregar menús.'
              : 'No se publicará. El propietario recibirá una notificación.'
          }
          textoConfirmar={confirmacion.decision === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          peligroso={confirmacion.decision === 'rechazar'}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmacion(null)}
        />
      )}
    </div>
  )
}
