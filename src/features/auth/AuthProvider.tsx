import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'
import { ApiError } from '@/lib/http/client'
import { cerrarSesion, iniciarSesion, obtenerUsuarioActual, registrarUsuario } from './api'
import type { Credenciales, DatosRegistro, Usuario } from './types'

type ContextoAuth = {
  usuario: Usuario | null
  cargando: boolean
  ingresar: (credenciales: Credenciales) => Promise<Usuario>
  registrar: (datos: DatosRegistro) => Promise<Usuario>
  salir: () => Promise<void>
}

const CLAVE_USUARIO = ['auth', 'me'] as const

const Contexto = createContext<ContextoAuth | null>(null)

async function usuarioOAnonimo(): Promise<Usuario | null> {
  try {
    return await obtenerUsuarioActual()
  } catch (error) {
    // 401 significa que no hay sesión: no es un error para mostrar.
    if (error instanceof ApiError && error.estado === 401) return null
    throw error
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const cliente = useQueryClient()
  const consulta = useQuery({ queryKey: CLAVE_USUARIO, queryFn: usuarioOAnonimo, retry: false })

  const guardar = (usuario: Usuario | null) => cliente.setQueryData(CLAVE_USUARIO, usuario)

  const valor: ContextoAuth = {
    usuario: consulta.data ?? null,
    cargando: consulta.isLoading,
    ingresar: async (credenciales) => {
      const usuario = await iniciarSesion(credenciales)
      guardar(usuario)
      return usuario
    },
    registrar: async (datos) => {
      await registrarUsuario(datos)
      const usuario = await iniciarSesion({ correo: datos.correo, contrasena: datos.contrasena })
      guardar(usuario)
      return usuario
    },
    salir: async () => {
      await cerrarSesion()
      guardar(null)
      cliente.removeQueries({ queryKey: ['notificaciones'] })
      cliente.removeQueries({ queryKey: ['establecimientos', 'mios'] })
    },
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}
