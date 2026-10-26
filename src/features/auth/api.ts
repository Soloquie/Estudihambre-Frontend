import { api, obtenerCsrf } from '@/lib/http/client'
import type { Credenciales, DatosRegistro, Usuario } from './types'

export const obtenerUsuarioActual = () => api<Usuario>('/auth/me')

export async function iniciarSesion(credenciales: Credenciales): Promise<Usuario> {
  await obtenerCsrf()
  const usuario = await api<Usuario>('/auth/login', { method: 'POST', body: credenciales })
  // Spring genera un token CSRF nuevo al autenticar.
  await obtenerCsrf()
  return usuario
}

/** El registro no requiere CSRF y no deja la sesión iniciada. */
export const registrarUsuario = (datos: DatosRegistro) =>
  api<Usuario>('/auth/registro', { method: 'POST', body: datos, omitirCsrf: true })

export async function cerrarSesion(): Promise<void> {
  await api<{ mensaje: string }>('/auth/logout', { method: 'POST' })
  await obtenerCsrf()
}
