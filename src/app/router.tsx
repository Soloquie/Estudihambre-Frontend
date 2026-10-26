import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { createBrowserRouter, Link, Outlet, useLocation } from 'react-router-dom'
import { EstadoVacio } from '@/components/ui'
import { RequireAuth, ROLES_PROPIETARIO, SoloAnonimos } from '@/features/auth/RequireAuth'
import { Ingresar } from '@/features/auth/pages/Ingresar'
import { Registro } from '@/features/auth/pages/Registro'
import { Detalle } from '@/features/establecimientos/pages/Detalle'
import { Inicio } from '@/features/establecimientos/pages/Inicio'
import { Principal } from './layouts/Principal'

const Perfil = lazy(() => import('@/features/auth/pages/Perfil').then((m) => ({ default: m.Perfil })))
const MisEstablecimientos = lazy(() =>
  import('@/features/establecimientos/pages/MisEstablecimientos').then((m) => ({ default: m.MisEstablecimientos })),
)
const FormularioEstablecimiento = lazy(() =>
  import('@/features/establecimientos/pages/FormularioEstablecimiento').then((m) => ({
    default: m.FormularioEstablecimiento,
  })),
)
const GestionMenus = lazy(() => import('@/features/menus/pages/GestionMenus').then((m) => ({ default: m.GestionMenus })))
const AdminEstablecimientos = lazy(() =>
  import('@/features/admin/pages/AdminEstablecimientos').then((m) => ({ default: m.AdminEstablecimientos })),
)

const TITULOS: [RegExp, string][] = [
  [/^\/$/, 'Inicio'],
  [/^\/establecimientos\//, 'Establecimiento'],
  [/^\/ingresar/, 'Iniciar sesión'],
  [/^\/registro/, 'Crear cuenta'],
  [/^\/perfil/, 'Perfil'],
  [/^\/mis-establecimientos/, 'Mis establecimientos'],
  [/^\/admin/, 'Administración'],
]

function Raiz() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const titulo = TITULOS.find(([patron]) => patron.test(pathname))?.[1]
    document.title = titulo ? `${titulo} · EstudiHambre` : 'EstudiHambre'
  }, [pathname])
  return <Outlet />
}

function Diferido({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="state-box">Cargando…</p>}>{children}</Suspense>
}

const propietario = (pagina: ReactNode) => (
  <RequireAuth roles={ROLES_PROPIETARIO}>
    <Diferido>{pagina}</Diferido>
  </RequireAuth>
)

const NoEncontrada = (
  <EstadoVacio titulo="Página no encontrada" descripcion="La dirección no existe." accion={<Link to="/">Ir al inicio</Link>} />
)

export const router = createBrowserRouter([
  {
    element: <Raiz />,
    children: [
      {
        element: <Principal />,
        children: [
          { index: true, element: <Inicio /> },
          { path: 'establecimientos/:id', element: <Detalle /> },
          {
            path: 'perfil',
            element: (
              <RequireAuth>
                <Diferido>
                  <Perfil />
                </Diferido>
              </RequireAuth>
            ),
          },
          { path: 'mis-establecimientos', element: propietario(<MisEstablecimientos />) },
          { path: 'mis-establecimientos/nuevo', element: propietario(<FormularioEstablecimiento />) },
          { path: 'mis-establecimientos/:id/editar', element: propietario(<FormularioEstablecimiento />) },
          { path: 'mis-establecimientos/:id/menus', element: propietario(<GestionMenus />) },
          { path: '*', element: NoEncontrada },
        ],
      },
      { path: 'ingresar', element: <SoloAnonimos><Ingresar /></SoloAnonimos> },
      { path: 'registro', element: <SoloAnonimos><Registro /></SoloAnonimos> },
      {
        path: 'admin',
        element: (
          <RequireAuth roles={['ADMIN']}>
            <Diferido>
              <AdminEstablecimientos />
            </Diferido>
          </RequireAuth>
        ),
      },
    ],
  },
])
