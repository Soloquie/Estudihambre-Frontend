import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { Rol } from './types'

type Props = {
  children: ReactNode
  /** Roles permitidos. Si se omite, basta con haber iniciado sesión. */
  roles?: Rol[]
}

export function RequireAuth({ children, roles }: Props) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <p className="state-box">Cargando…</p>

  if (!usuario) {
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search)
    return <Navigate to={`/ingresar?volver=${volver}`} replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={usuario.rol === 'ADMIN' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}

/** Las páginas de acceso solo tienen sentido sin sesión. */
export function SoloAnonimos({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (usuario) return <Navigate to="/" replace />
  return <>{children}</>
}

export const ROLES_PROPIETARIO: Rol[] = ['ESTUDIANTE', 'RESTAURANTE']
