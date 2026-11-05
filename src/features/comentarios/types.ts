export type EstadoComentario = 'VISIBLE' | 'OCULTO'

/** Refleja ComentarioRespuestaDTO del backend. */
export type Comentario = {
  id: number
  contenido: string
  fecha: string
  estado: EstadoComentario
  usuarioId: number
  nombreUsuario: string
  establecimientoId: number
}

export const MAXIMO_COMENTARIO = 1000
