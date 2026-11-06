import type { Establecimiento } from '../types'
import { estadoAhora, textoHorario } from '../horario'

type Props = {
  lugar: Pick<Establecimiento, 'horaApertura' | 'horaCierre' | 'cerradoTemporalmente' | 'abiertoAhora'>
  /** Solo la etiqueta, sin el horario (para tarjetas). */
  compacto?: boolean
}

export function EstadoHorario({ lugar, compacto = false }: Props) {
  const estado = estadoAhora(lugar)
  const horario = textoHorario(lugar)
  if (!estado) return null
  return (
    <span className="hours-state">
      <span className={`status ${estado.clase}`}>{estado.texto}</span>
      {!compacto && horario && !lugar.cerradoTemporalmente && <span className="hours-text">{horario}</span>}
    </span>
  )
}
