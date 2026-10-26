import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Logo } from '@/components/ui'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { useAuth } from '../AuthProvider'
import { esquemaRegistro, REQUISITOS_CONTRASENA, type ValoresRegistro } from '../schemas'

export function Registro() {
  const navegar = useNavigate()
  const { registrar } = useAuth()
  const formulario = useForm<ValoresRegistro>({
    resolver: zodResolver(esquemaRegistro),
    mode: 'onBlur',
    defaultValues: { nombre: '', correo: '', contrasena: '', aceptaDatos: false },
  })
  const { errors, isSubmitting } = formulario.formState
  const contrasena = formulario.watch('contrasena')
  const aceptaDatos = formulario.watch('aceptaDatos')

  const enviar = formulario.handleSubmit(async ({ nombre, correo, contrasena: clave }) => {
    try {
      await registrar({ nombre, correo, contrasena: clave })
      navegar('/')
    } catch (error) {
      if (error instanceof ApiError && error.estado === 409) {
        formulario.setError('correo', { message: 'El correo ya está registrado' })
      } else {
        formulario.setError('root', { message: mensajeDeError(error, 'No pudimos crear tu cuenta') })
      }
    }
  })

  return (
    <main className="auth-page">
      <Link className="auth-back" to="/ingresar">
        <ArrowLeft /> Volver
      </Link>
      <Logo />
      <div className="auth-card">
        <h1>Crea tu cuenta</h1>
        <p>Guarda tus aportes y registra tu establecimiento.</p>
        <form onSubmit={enviar} noValidate>
          <label className={errors.nombre ? 'error-field' : ''}>
            Nombre completo
            <input autoComplete="name" placeholder="Tu nombre" {...formulario.register('nombre')} />
            {errors.nombre && <small>{errors.nombre.message}</small>}
          </label>
          <label className={errors.correo ? 'error-field' : ''}>
            Correo
            <input type="email" autoComplete="email" placeholder="nombre@correo.com" {...formulario.register('correo')} />
            {errors.correo && <small>{errors.correo.message}</small>}
          </label>
          <label className={errors.contrasena ? 'error-field' : ''}>
            Contraseña
            <input type="password" autoComplete="new-password" {...formulario.register('contrasena')} />
            {errors.contrasena && <small>{errors.contrasena.message}</small>}
          </label>
          <ul className="field-hint" aria-label="Requisitos de la contraseña">
            {REQUISITOS_CONTRASENA.map((requisito) => {
              const cumple = requisito.cumple(contrasena)
              return (
                <li key={requisito.texto} style={{ color: cumple ? '#226c32' : undefined }}>
                  {cumple ? <Check size={13} /> : <X size={13} />} {requisito.texto}
                </li>
              )
            })}
          </ul>
          <label className="check-row">
            <input type="checkbox" {...formulario.register('aceptaDatos')} />
            <span>Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)</span>
          </label>
          {errors.root && (
            <p className="form-error" role="alert">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" className="full" disabled={!aceptaDatos || isSubmitting}>
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>
      </div>
    </main>
  )
}
