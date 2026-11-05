import { EyeOff, Pencil, Trash2 } from 'lucide-react'
import { iniciales, tiempoRelativo } from '@/lib/format'
import type { Comentario } from '../types'

type Props = {
  comentario: Comentario
  puntuacion?: number
  esPropio: boolean
  esAdmin: boolean
  onEditar: () => void
  onEliminar: () => void
  onOcultar: () => void
}

export function ItemComentario({ comentario, puntuacion, esPropio, esAdmin, onEditar, onEliminar, onOcultar }: Props) {
  return (
    <article className="review">
      <div>
        <span className="avatar" aria-hidden="true">
          {iniciales(comentario.nombreUsuario)}
        </span>
        <p>
          <b>{comentario.nombreUsuario}</b>
          <small>
            {tiempoRelativo(comentario.fecha)}
            {puntuacion ? ` · ${'★'.repeat(puntuacion)}` : ''}
          </small>
        </p>
        <span className="review-actions">
          {esPropio && (
            <>
              <button type="button" aria-label="Editar mi comentario" onClick={onEditar}>
                <Pencil size={17} />
              </button>
              <button type="button" aria-label="Eliminar mi comentario" onClick={onEliminar}>
                <Trash2 size={17} />
              </button>
            </>
          )}
          {esAdmin && !esPropio && (
            <button type="button" aria-label="Ocultar comentario" onClick={onOcultar}>
              <EyeOff size={17} />
            </button>
          )}
        </span>
      </div>
      <p>{comentario.contenido}</p>
    </article>
  )
}
