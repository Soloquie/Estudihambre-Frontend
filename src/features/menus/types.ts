/** Refleja MenuRespuestaDTO del backend. */
export type Menu = {
  id: number
  titulo: string
  descripcion: string | null
  precio: number
  disponible: boolean
  imagenes: string[]
  establecimientoId: number
}

export type DatosMenu = {
  titulo: string
  descripcion: string | null
  precio: number
  disponible: boolean
  establecimientoId?: number
}

export const MAX_IMAGENES_MENU = 5
