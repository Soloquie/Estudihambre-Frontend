import { ChevronRight, Clock3, MapPin, Store } from 'lucide-react'
import { Estrellas } from '@/components/ui'
import type { Establecimiento } from '../types'

export type EstablecimientoConDatos = Establecimiento & {
  precioMinimo: number | null
  etiquetaPrecio: string
  distancia: { metros: number; minutos: number } | null
  promedio: number | null
  totalCalificaciones: number
}

type Props = {
  lugar: EstablecimientoConDatos
  seleccionado?: boolean
  onAbrir: () => void
  onResaltar?: (id?: number) => void
}

export function TarjetaEstablecimiento({ lugar, seleccionado = false, onAbrir, onResaltar }: Props) {
  return (
    <article
      className={`place-card ${seleccionado ? 'map-selected' : ''}`}
      onMouseEnter={() => onResaltar?.(lugar.id)}
      onMouseLeave={() => onResaltar?.()}
    >
      <div className="place-image">
        {lugar.imagenUrl ? (
          <img src={lugar.imagenUrl} alt={`Imagen de ${lugar.nombre}`} loading="lazy" />
        ) : (
          <div className="no-image" aria-hidden="true">
            <Store />
          </div>
        )}
      </div>
      <div className="place-body">
        <div className="place-heading">
          <div>
            <h3>
              <button type="button" className="card-link" onClick={onAbrir}>
                {lugar.nombre}
              </button>
            </h3>
            <p>{lugar.tipo}</p>
            <Estrellas promedio={lugar.promedio} total={lugar.totalCalificaciones} />
          </div>
          <ChevronRight size={20} aria-hidden="true" />
        </div>
        <div className="place-facts">
          <strong>{lugar.etiquetaPrecio}</strong>
          {lugar.distancia && (
            <span>
              <Clock3 size={16} /> {lugar.distancia.minutos} min · {Math.round(lugar.distancia.metros)} m
            </span>
          )}
        </div>
        <p className="updated">
          <MapPin size={13} /> {lugar.direccion}
        </p>
      </div>
    </article>
  )
}
