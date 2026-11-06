import { GraduationCap, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chip, EstadoError, EstadoVacio, ListaCargando } from '@/components/ui'
import { EstadoHorario } from '@/features/establecimientos/components/EstadoHorario'
import { useEstablecimientos } from '@/features/establecimientos/hooks'
import { preciosMinimos, useMenus } from '@/features/menus/hooks'
import { distanciaDesdeUniversidad } from '@/lib/geo'
import { mensajeDeError } from '@/lib/http/client'
import { TarjetaBeneficio } from '../components/TarjetaBeneficio'
import { useBeneficiosDe } from '../hooks'
import type { TipoBeneficio } from '../types'
import { compararBeneficios } from '../utilidades'

type FiltroTipo = TipoBeneficio | 'TODOS'

const OPCIONES: { valor: FiltroTipo; texto: string }[] = [
  { valor: 'TODOS', texto: 'Todos' },
  { valor: 'DESCUENTO', texto: 'Descuentos' },
  { valor: 'TIQUETERA', texto: 'Tiqueteras' },
]

/** Sección estudiantil (RF-11): todos los descuentos y tiqueteras vigentes cerca de la universidad. */
export function Estudiantil() {
  const [tipo, setTipo] = useState<FiltroTipo>('TODOS')
  const establecimientos = useEstablecimientos({})
  const menus = useMenus()
  const ids = useMemo(() => (establecimientos.data ?? []).map((lugar) => lugar.id), [establecimientos.data])
  const { porEstablecimiento, cargando, conError } = useBeneficiosDe(ids)
  const precios = useMemo(() => preciosMinimos(menus.data), [menus.data])

  const lugaresPorId = useMemo(
    () => new Map((establecimientos.data ?? []).map((lugar) => [lugar.id, lugar])),
    [establecimientos.data],
  )
  const todos = [...porEstablecimiento.values()].flat().sort(compararBeneficios)
  const visibles = tipo === 'TODOS' ? todos : todos.filter((beneficio) => beneficio.tipo === tipo)
  const cuenta = (valor: FiltroTipo) =>
    valor === 'TODOS' ? todos.length : todos.filter((beneficio) => beneficio.tipo === valor).length

  return (
    <main className="page">
      <section className="hero student-hero">
        <div className="eyebrow">
          <GraduationCap size={15} /> Solo para estudiantes
        </div>
        <h1>Descuentos y tiqueteras</h1>
        <p>Muestra tu carné y paga menos en los lugares de siempre.</p>
      </section>

      <div className="chips-row">
        {OPCIONES.map((opcion) => (
          <Chip key={opcion.valor} active={tipo === opcion.valor} onClick={() => setTipo(opcion.valor)}>
            {opcion.texto}
            {!cargando && ` (${cuenta(opcion.valor)})`}
          </Chip>
        ))}
      </div>

      {establecimientos.isError ? (
        <EstadoError mensaje={mensajeDeError(establecimientos.error)} onReintentar={() => establecimientos.refetch()} />
      ) : establecimientos.isLoading || cargando ? (
        <ListaCargando />
      ) : visibles.length === 0 ? (
        <EstadoVacio
          titulo={todos.length === 0 ? 'Aún no hay beneficios publicados' : 'No hay beneficios de este tipo'}
          descripcion={
            todos.length === 0
              ? 'Cuando los restaurantes publiquen descuentos o tiqueteras, los verás aquí.'
              : 'Prueba con otro tipo de beneficio.'
          }
          accion={<Link to="/">Ver todos los lugares</Link>}
        />
      ) : (
        <div className="benefit-list grid">
          {visibles.map((beneficio) => {
            const lugar = lugaresPorId.get(beneficio.establecimientoId)
            const distancia = lugar ? distanciaDesdeUniversidad(lugar.latitud, lugar.longitud) : null
            return (
              <TarjetaBeneficio
                key={beneficio.id}
                beneficio={beneficio}
                precioMinimo={precios.get(beneficio.establecimientoId)}
                encabezado={
                  lugar && (
                    <div className="benefit-place">
                      <Link to={`/establecimientos/${lugar.id}`}>{lugar.nombre}</Link>
                      <span>
                        {distancia && (
                          <>
                            <MapPin size={13} /> {distancia.minutos} min
                          </>
                        )}
                        <EstadoHorario lugar={lugar} compacto />
                      </span>
                    </div>
                  )
                }
              />
            )
          })}
        </div>
      )}
      {conError > 0 && !cargando && (
        <p className="notice">No pudimos cargar los beneficios de {conError} lugar(es). Recarga la página para intentarlo de nuevo.</p>
      )}
    </main>
  )
}
