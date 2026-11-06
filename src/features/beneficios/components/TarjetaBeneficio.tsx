import { CalendarDays, GraduationCap, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import { monedaCOP } from '@/lib/format'
import { NOMBRE_TIPO, type Beneficio } from '../types'
import { ahorroTiquetera, precioPorComida, textoVigencia, valorBeneficio } from '../utilidades'

type Props = {
  beneficio: Beneficio
  /** Precio del menú más económico del lugar, para calcular el ahorro de una tiquetera. */
  precioMinimo?: number | null
  /** Encabezado opcional (por ejemplo, el nombre del establecimiento con su enlace). */
  encabezado?: ReactNode
  acciones?: ReactNode
  estado?: ReactNode
}

export function TarjetaBeneficio({ beneficio, precioMinimo, encabezado, acciones, estado }: Props) {
  const porComida = precioPorComida(beneficio)
  const ahorro = ahorroTiquetera(beneficio, precioMinimo)
  const Icono = beneficio.tipo === 'DESCUENTO' ? GraduationCap : Ticket

  return (
    <article className={`benefit-card ${beneficio.tipo === 'TIQUETERA' ? 'ticket' : ''}`}>
      <div className="benefit-icon" aria-hidden="true">
        <Icono size={22} />
      </div>
      <div className="benefit-body">
        {encabezado}
        <div className="benefit-top">
          <span className="benefit-type">{NOMBRE_TIPO[beneficio.tipo]}</span>
          {estado}
        </div>
        <h3>{beneficio.titulo}</h3>
        <strong className="benefit-value">{valorBeneficio(beneficio)}</strong>
        {porComida !== null && (
          <p className="benefit-detail">
            {monedaCOP(porComida)} por comida
            {ahorro !== null && <b> · Ahorras {monedaCOP(ahorro)} frente al menú más económico</b>}
          </p>
        )}
        {beneficio.descripcion && <p className="benefit-detail">{beneficio.descripcion}</p>}
        <div className="benefit-meta">
          <span>
            <CalendarDays size={14} /> {textoVigencia(beneficio)}
          </span>
          {beneficio.codigo && (
            <span>
              Código: <code>{beneficio.codigo}</code>
            </span>
          )}
        </div>
        {acciones && <div className="benefit-actions">{acciones}</div>}
      </div>
    </article>
  )
}
