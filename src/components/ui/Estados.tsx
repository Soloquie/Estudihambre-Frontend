import type { ReactNode } from 'react'
import { Button } from './Button'

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-label="Cargando">
      <div />
      <section>
        <i />
        <i />
        <i />
        <i />
      </section>
    </div>
  )
}

export function ListaCargando({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="places-grid" aria-busy="true">
      {Array.from({ length: cantidad }, (_, indice) => (
        <SkeletonCard key={indice} />
      ))}
    </div>
  )
}

type EstadoVacioProps = { titulo: string; descripcion?: string; accion?: ReactNode }

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="state-box">
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
      {accion}
    </div>
  )
}

type EstadoErrorProps = { mensaje: string; onReintentar?: () => void }

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="state-box" role="alert">
      <h2>No pudimos cargar la información</h2>
      <p>{mensaje}</p>
      {onReintentar && (
        <Button variant="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
