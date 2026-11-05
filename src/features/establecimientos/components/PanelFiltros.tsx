import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Chip } from '@/components/ui'
import { monedaCOP } from '@/lib/format'
import type { FiltroEstablecimientos } from '../api'

const PRESUPUESTO_MIN = 5_000
const PRESUPUESTO_MAX = 30_000
const DISTANCIAS = [5, 10, 15]

type Props = {
  filtro: FiltroEstablecimientos
  tipos: string[]
  onAplicar: (filtro: FiltroEstablecimientos) => void
  onCerrar: () => void
}

export function PanelFiltros({ filtro, tipos, onAplicar, onCerrar }: Props) {
  const [borrador, setBorrador] = useState<FiltroEstablecimientos>(filtro)
  const cambiar = (cambios: Partial<FiltroEstablecimientos>) => setBorrador((previo) => ({ ...previo, ...cambios }))

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => evento.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  return (
    <div className="overlay" onClick={onCerrar}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-filtros"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-title">
          <h2 id="titulo-filtros">Filtrar resultados</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar filtros">
            <X />
          </button>
        </div>

        <label className="filter-group">
          <b>Plato o comida</b>
          <input
            value={borrador.plato ?? ''}
            placeholder="Ej.: bandeja, empanada, jugo"
            onChange={(evento) => cambiar({ plato: evento.target.value || undefined })}
          />
        </label>

        <div className="filter-group">
          <div className="filter-label">
            <b>Presupuesto máximo</b>
            <strong>{borrador.precioMax ? monedaCOP(borrador.precioMax) : 'Sin límite'}</strong>
          </div>
          <input
            className="range"
            type="range"
            aria-label="Presupuesto máximo"
            min={PRESUPUESTO_MIN}
            max={PRESUPUESTO_MAX}
            step={500}
            value={borrador.precioMax ?? PRESUPUESTO_MAX}
            onChange={(evento) => {
              const valor = Number(evento.target.value)
              cambiar({ precioMax: valor >= PRESUPUESTO_MAX ? undefined : valor })
            }}
          />
          <div className="range-labels">
            <span>{monedaCOP(PRESUPUESTO_MIN)}</span>
            <span>Sin límite</span>
          </div>
        </div>

        {tipos.length > 0 && (
          <div className="filter-group">
            <b>Tipo de lugar</b>
            <div className="chips-wrap">
              {tipos.map((tipo) => (
                <Chip
                  key={tipo}
                  active={borrador.tipo === tipo}
                  onClick={() => cambiar({ tipo: borrador.tipo === tipo ? undefined : tipo })}
                >
                  {tipo}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="filter-group">
          <b>Distancia máxima caminando</b>
          <div className="segmented">
            <button
              type="button"
              className={borrador.minutosMax ? '' : 'active'}
              onClick={() => cambiar({ minutosMax: undefined })}
            >
              Cualquiera
            </button>
            {DISTANCIAS.map((minutos) => (
              <button
                key={minutos}
                type="button"
                className={borrador.minutosMax === minutos ? 'active' : ''}
                onClick={() => cambiar({ minutosMax: minutos })}
              >
                {minutos} min
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <Button variant="secondary" onClick={() => onAplicar({ nombre: filtro.nombre })}>
            Limpiar
          </Button>
          <Button onClick={() => onAplicar(borrador)}>Aplicar filtros</Button>
        </div>
      </section>
    </div>
  )
}
