import { Bell, CircleUserRound, Home, LogIn, Search, Store } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthProvider'
import { useContadorNoLeidas } from '@/features/notificaciones/hooks'

function CampanaNotificaciones() {
  const { usuario } = useAuth()
  const contador = useContadorNoLeidas(Boolean(usuario))
  const cantidad = contador.data?.cantidad ?? 0
  return (
    <Link
      className="icon-link"
      to="/perfil"
      aria-label={cantidad ? `Notificaciones, ${cantidad} sin leer` : 'Notificaciones'}
    >
      <Bell size={21} />
      {cantidad > 0 && <span className="dot">{cantidad > 9 ? '9+' : cantidad}</span>}
    </Link>
  )
}

function BuscadorEncabezado() {
  const navegar = useNavigate()
  const [texto, setTexto] = useState('')
  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    const termino = texto.trim()
    navegar(termino ? `/?nombre=${encodeURIComponent(termino)}` : '/')
  }
  return (
    <form className="header-search" role="search" onSubmit={buscar}>
      <button type="submit" aria-label="Buscar">
        <Search size={19} />
      </button>
      <input
        aria-label="Buscar establecimiento"
        placeholder="Busca un restaurante o cafetería"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />
    </form>
  )
}

export function Principal() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  const esAdmin = usuario?.rol === 'ADMIN'
  const rutaGestion = esAdmin ? '/admin' : '/mis-establecimientos'
  const textoGestion = esAdmin ? 'Administración' : 'Mis lugares'
  const enDetalle = pathname.startsWith('/establecimientos/')
  const claseEnlace = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

  return (
    <>
      <header className="desktop-header">
        <Logo />
        <BuscadorEncabezado />
        <nav aria-label="Principal">
          <NavLink to="/" end className={claseEnlace}>
            Inicio
          </NavLink>
          {usuario && (
            <NavLink to={rutaGestion} className={claseEnlace}>
              {textoGestion}
            </NavLink>
          )}
          {usuario ? (
            <NavLink to="/perfil" className={claseEnlace}>
              Perfil
            </NavLink>
          ) : (
            <NavLink to="/ingresar" className={claseEnlace}>
              Ingresar
            </NavLink>
          )}
        </nav>
        {usuario && (
          <div className="header-actions">
            <CampanaNotificaciones />
          </div>
        )}
      </header>

      <header className="mobile-header">
        <Logo />
        {usuario ? (
          <CampanaNotificaciones />
        ) : (
          <Link className="icon-link" to="/ingresar" aria-label="Ingresar">
            <LogIn size={21} />
          </Link>
        )}
      </header>

      <Outlet />

      {!enDetalle && (
        <nav className={`bottom-nav ${usuario ? 'three' : ''}`} aria-label="Navegación inferior" style={usuario ? undefined : { gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <NavLink to="/" end className={claseEnlace}>
            <Home size={22} />
            <span>Inicio</span>
          </NavLink>
          {usuario && (
            <NavLink to={rutaGestion} className={claseEnlace}>
              <Store size={22} />
              <span>{textoGestion}</span>
            </NavLink>
          )}
          <NavLink to={usuario ? '/perfil' : '/ingresar'} className={claseEnlace}>
            <CircleUserRound size={22} />
            <span>{usuario ? 'Perfil' : 'Ingresar'}</span>
          </NavLink>
        </nav>
      )}
    </>
  )
}
