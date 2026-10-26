import { env } from '@/config/env'

type TokenCsrf = { headerName: string; token: string }

type CuerpoError = { mensaje?: string }

export class ApiError extends Error {
  constructor(
    public readonly estado: number,
    public readonly mensaje: string,
    public readonly erroresPorCampo: Record<string, string> = {},
  ) {
    super(mensaje)
    this.name = 'ApiError'
  }
}

const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS']

let tokenCsrf: TokenCsrf | null = null

/** Convierte "campo: mensaje; campo: mensaje" (formato del backend) en un objeto por campo. */
function separarErroresPorCampo(mensaje: string): Record<string, string> {
  const errores: Record<string, string> = {}
  for (const parte of mensaje.split('; ')) {
    const separador = parte.indexOf(': ')
    if (separador > 0) errores[parte.slice(0, separador)] = parte.slice(separador + 2)
  }
  return errores
}

async function crearError(respuesta: Response): Promise<ApiError> {
  let cuerpo: CuerpoError = {}
  try {
    cuerpo = (await respuesta.json()) as CuerpoError
  } catch {
    // La respuesta no trae JSON; se usa el mensaje genérico.
  }

  const mensaje =
    respuesta.status === 413
      ? 'La imagen supera el tamaño permitido'
      : (cuerpo.mensaje ?? 'No pudimos completar la solicitud')

  const errores = respuesta.status === 400 ? separarErroresPorCampo(mensaje) : {}
  return new ApiError(respuesta.status, mensaje, errores)
}

export async function obtenerCsrf(): Promise<TokenCsrf> {
  const respuesta = await fetch(`${env.API_BASE_URL}/auth/csrf`, { credentials: 'include' })
  if (!respuesta.ok) throw await crearError(respuesta)
  tokenCsrf = (await respuesta.json()) as TokenCsrf
  return tokenCsrf
}

type Opciones = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object
  omitirCsrf?: boolean
}

function prepararCuerpo(body: Opciones['body'], headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined
  if (body instanceof FormData || body instanceof Blob || typeof body === 'string') return body
  headers.set('Content-Type', 'application/json')
  return JSON.stringify(body)
}

export async function api<T>(ruta: string, opciones: Opciones = {}, esReintento = false): Promise<T> {
  const { body, omitirCsrf = false, ...resto } = opciones
  const metodo = (opciones.method ?? 'GET').toUpperCase()
  const headers = new Headers(opciones.headers)
  const cuerpo = prepararCuerpo(body, headers)
  const necesitaCsrf = !METODOS_SEGUROS.includes(metodo) && !omitirCsrf

  if (necesitaCsrf) {
    const token = tokenCsrf ?? (await obtenerCsrf())
    headers.set(token.headerName, token.token)
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${env.API_BASE_URL}${ruta}`, {
      ...resto,
      method: metodo,
      headers,
      body: cuerpo,
      credentials: 'include',
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo')
  }

  // Un 403 en una mutación puede deberse a un token CSRF vencido: se renueva y se reintenta una vez.
  if (respuesta.status === 403 && necesitaCsrf && !esReintento) {
    tokenCsrf = null
    await obtenerCsrf()
    return api<T>(ruta, opciones, true)
  }

  if (!respuesta.ok) throw await crearError(respuesta)
  if (respuesta.status === 204) return undefined as T

  const texto = await respuesta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export function mensajeDeError(error: unknown, alternativo = 'Ocurrió un error inesperado'): string {
  return error instanceof ApiError ? error.mensaje : alternativo
}
