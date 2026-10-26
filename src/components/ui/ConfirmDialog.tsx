import { useEffect, useRef } from 'react'
import { Button } from './Button'

type Props = {
  titulo: string
  descripcion: string
  textoConfirmar: string
  peligroso?: boolean
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  titulo,
  descripcion,
  textoConfirmar,
  peligroso = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const botonCancelar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    botonCancelar.current?.focus()
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => {
      window.removeEventListener('keydown', alPresionar)
      anterior?.focus()
    }
  }, [onCancelar])

  return (
    <div className="overlay center" onClick={onCancelar}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="dialogo-titulo">{titulo}</h2>
        <p>{descripcion}</p>
        <div className="dialog-actions">
          <Button ref={botonCancelar} variant="text" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant={peligroso ? 'danger' : 'primary'} onClick={onConfirmar} disabled={cargando}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  )
}
