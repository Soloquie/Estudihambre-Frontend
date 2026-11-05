import { useState, type FormEvent } from 'react'
import { Button, useToast } from '@/components/ui'
import { mensajeDeError } from '@/lib/http/client'
import { useGuardarComentario } from '../hooks'
import { MAXIMO_COMENTARIO, type Comentario } from '../types'

type Props = { establecimientoId: number; comentario?: Comentario; onListo?: () => void; onCancelar?: () => void }

export function FormularioComentario({ establecimientoId, comentario, onListo, onCancelar }: Props) {
  const [contenido, setContenido] = useState(comentario?.contenido ?? '')
  const [error, setError] = useState('')
  const guardar = useGuardarComentario()
  const toast = useToast()

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    const texto = contenido.trim()
    if (!texto) {
      setError('Escribe tu comentario')
      return
    }
    guardar.mutate(
      { establecimientoId, comentarioId: comentario?.id, contenido: texto },
      {
        onSuccess: () => {
          setContenido('')
          setError('')
          toast.mostrar(comentario ? 'Editaste tu comentario' : 'Publicaste tu comentario')
          onListo?.()
        },
        onError: (falla) => setError(mensajeDeError(falla, 'No pudimos publicar el comentario')),
      },
    )
  }

  return (
    <form className="comment-form" onSubmit={enviar} noValidate>
      <label className={error ? 'error-field' : ''}>
        {comentario ? 'Editar comentario' : 'Deja un comentario'}
        <textarea
          value={contenido}
          maxLength={MAXIMO_COMENTARIO}
          placeholder="¿Qué deberían saber otros estudiantes? Precio, porción, atención…"
          onChange={(evento) => {
            setContenido(evento.target.value)
            if (error) setError('')
          }}
        />
        {error && <small>{error}</small>}
      </label>
      <div className="counter">
        {contenido.length} / {MAXIMO_COMENTARIO}
      </div>
      <div className="dialog-actions">
        {onCancelar && (
          <Button variant="text" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Publicando…' : comentario ? 'Guardar comentario' : 'Publicar comentario'}
        </Button>
      </div>
    </form>
  )
}
