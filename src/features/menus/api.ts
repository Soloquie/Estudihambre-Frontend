import { api } from '@/lib/http/client'
import type { DatosMenu, Menu } from './types'

function formulario(datos: DatosMenu, imagenes: File[]): FormData {
  const form = new FormData()
  form.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }))
  imagenes.forEach((imagen) => form.append('imagenes', imagen))
  return form
}

export const listarMenus = () => api<Menu[]>('/menus')

export const listarMenusDeEstablecimiento = (id: number | string) =>
  api<Menu[]>(`/menus/establecimiento/${id}`)

export const crearMenu = (datos: DatosMenu, imagenes: File[]) =>
  api<Menu>('/menus', { method: 'POST', body: formulario(datos, imagenes) })

export const actualizarMenu = (id: number, datos: DatosMenu, imagenes: File[]) =>
  api<Menu>(`/menus/${id}`, { method: 'PUT', body: formulario(datos, imagenes) })

export const eliminarMenu = (id: number) => api<void>(`/menus/${id}`, { method: 'DELETE' })

export const quitarImagenMenu = (id: number, indice: number) =>
  api<void>(`/menus/${id}/imagenes/${indice}`, { method: 'DELETE' })
