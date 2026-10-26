import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarMenu,
  crearMenu,
  eliminarMenu,
  listarMenus,
  listarMenusDeEstablecimiento,
  quitarImagenMenu,
} from './api'
import type { DatosMenu, Menu } from './types'

const CLAVE_MENUS = ['menus'] as const

export const useMenus = () => useQuery({ queryKey: CLAVE_MENUS, queryFn: listarMenus })

export const useMenusDeEstablecimiento = (id: number | string) =>
  useQuery({ queryKey: ['menus', 'establecimiento', String(id)], queryFn: () => listarMenusDeEstablecimiento(id) })

/** Precio mínimo de los menús disponibles, agrupado por establecimiento. */
export function preciosMinimos(menus: Menu[] = []): Map<number, number> {
  const minimos = new Map<number, number>()
  for (const menu of menus) {
    if (!menu.disponible) continue
    const actual = minimos.get(menu.establecimientoId)
    if (actual === undefined || menu.precio < actual) minimos.set(menu.establecimientoId, menu.precio)
  }
  return minimos
}

export function useGuardarMenu() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos, imagenes }: { id?: number; datos: DatosMenu; imagenes: File[] }) =>
      id ? actualizarMenu(id, datos, imagenes) : crearMenu(datos, imagenes),
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_MENUS }),
  })
}

export function useEliminarMenu() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarMenu,
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_MENUS }),
  })
}

export function useQuitarImagenMenu() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ({ id, indice }: { id: number; indice: number }) => quitarImagenMenu(id, indice),
    // Los índices cambian al quitar una imagen, así que se vuelve a pedir la lista.
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_MENUS }),
  })
}
