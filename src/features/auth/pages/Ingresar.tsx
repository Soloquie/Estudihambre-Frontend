import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Logo } from '@/components/ui'
import { mensajeDeError } from '@/lib/http/client'
import { useAuth } from '../AuthProvider'
import { esquemaIngreso, type ValoresIngreso } from '../schemas'

/** Solo se aceptan rutas internas para evitar redirecciones abiertas. */
function destinoSeguro(volver: string | null): string {
  return volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/'
}

export function Ingresar() {
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const { ingresar } = useAuth()
  const formulario = useForm<ValoresIngreso>({ resolver: zodResolver(esquemaIngreso), mode: 'onBlur' })
  const { errors, isSubmitting } = formulario.formState

  const enviar = formulario.handleSubmit(async (valores) => {
    try {
      const usuario = await ingresar(valores)
      const volver = parametros.get('volver')
      navegar(volver ? destinoSeguro(volver) : usuario.rol === 'ADMIN' ? '/admin' : '/')
    } catch (error) {
      formulario.setError('root', { message: mensajeDeError(error, 'No pudimos iniciar sesión') })
    }
  })

  return (
    <main className="auth-page">
      <Link className="auth-back" to="/">
        <ArrowLeft /> Volver
      </Link>
      <Logo />
      <div className="auth-card">
        <span className="auth-icon">
          <LogIn />
        </span>
        <h1>Inicia sesión</h1>
        <p>Consulta, compara y registra tu establecimiento.</p>
        <form onSubmit={enviar} noValidate>
          <label className={errors.correo ? 'error-field' : ''}>
            Correo
            <input type="email" autoComplete="email" placeholder="nombre@correo.com" {...formulario.register('correo')} />
            {errors.correo && <small>{errors.correo.message}</small>}
          </label>
          <label className={errors.contrasena ? 'error-field' : ''}>
            Contraseña
            <input type="password" autoComplete="current-password" {...formulario.register('contrasena')} />
            {errors.contrasena && <small>{errors.contrasena.message}</small>}
          </label>
          {errors.root && (
            <p className="form-error" role="alert">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" className="full" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </form>
        <Link className="link" to="/registro">
          ¿No tienes cuenta? <b>Créala aquí</b>
        </Link>
      </div>
    </main>
  )
}
