import { Star } from 'lucide-react'

const formato = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const formatoPromedio = (valor: number) => formato.format(valor)

/** Resumen compacto: ★ 4,5 (38). Sin calificaciones muestra "Sin calificaciones". */
export function Estrellas({ promedio, total }: { promedio: number | null; total: number }) {
  if (promedio === null || total === 0) return <span className="rating muted">Sin calificaciones</span>
  return (
    <span className="rating" aria-label={`${formatoPromedio(promedio)} de 5, ${total} calificaciones`}>
      <Star size={15} fill="currentColor" aria-hidden="true" /> <b>{formatoPromedio(promedio)}</b>
      <small>({total})</small>
    </span>
  )
}

type SelectorProps = { valor: number; onChange: (valor: number) => void; deshabilitado?: boolean }

/** Cinco estrellas táctiles para calificar de 1 a 5. */
export function SelectorEstrellas({ valor, onChange, deshabilitado = false }: SelectorProps) {
  return (
    <div className="star-row" role="radiogroup" aria-label="Puntuación">
      <div>
        {[1, 2, 3, 4, 5].map((numero) => (
          <button
            key={numero}
            type="button"
            role="radio"
            aria-checked={valor === numero}
            aria-label={`${numero} ${numero === 1 ? 'estrella' : 'estrellas'}`}
            disabled={deshabilitado}
            onClick={() => onChange(numero)}
          >
            <Star fill={numero <= valor ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  )
}
