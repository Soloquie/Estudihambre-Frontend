import { ArrowLeft, Clock3, GraduationCap, MapPin, MessageCircle, Phone, Star, Store } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapaDetalle } from '@/components/map/MapaDetalle'
import { Button, EstadoError, EstadoVacio, Estrellas } from '@/components/ui'
import { UNIVERSIDAD } from '@/config/constants'
import { TarjetaBeneficio } from '@/features/beneficios/components/TarjetaBeneficio'
import { useBeneficios } from '@/features/beneficios/hooks'
import { compararBeneficios } from '@/features/beneficios/utilidades'
import { useResumenCalificaciones } from '@/features/calificaciones/hooks'
import { SeccionResenas } from '@/features/comentarios/components/SeccionResenas'
import { useMenusDeEstablecimiento } from '@/features/menus/hooks'
import type { Menu } from '@/features/menus/types'
import { enlaceWhatsApp, monedaCOP } from '@/lib/format'
import { distanciaDesdeUniversidad } from '@/lib/geo'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { EstadoHorario } from '../components/EstadoHorario'
import { textoHorario } from '../horario'
import { useEstablecimiento } from '../hooks'

type Pestana = 'Menú' | 'Beneficios' | 'Información' | 'Reseñas'

function TarjetaMenu({ menu, destacado }: { menu: Menu; destacado: boolean }) {
  return (
    <section className={destacado ? 'menu-feature' : 'menu-item'}>
      <div className="menu-title">
        <div>
          {destacado && <span>MÁS ECONÓMICO</span>}
          <h2>{menu.titulo}</h2>
        </div>
        <strong>{monedaCOP(menu.precio)}</strong>
      </div>
      {menu.descripcion && <p>{menu.descripcion}</p>}
      {!menu.disponible && <span className="unavailable">No disponible hoy</span>}
      {menu.imagenes.length > 0 && (
        <div className="menu-gallery">
          {menu.imagenes.map((url, indice) => (
            <img key={url} src={url} alt={`${menu.titulo}, foto ${indice + 1}`} loading="lazy" />
          ))}
        </div>
      )}
    </section>
  )
}

export function Detalle() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const [pestana, setPestana] = useState<Pestana>('Menú')
  const consulta = useEstablecimiento(id)
  const menus = useMenusDeEstablecimiento(id)
  const resumen = useResumenCalificaciones(id)
  const beneficios = useBeneficios(id)

  if (consulta.isLoading) return <p className="state-box">Cargando establecimiento…</p>

  if (consulta.isError || !consulta.data) {
    const noExiste = consulta.error instanceof ApiError && consulta.error.estado === 404
    return noExiste ? (
      <EstadoVacio
        titulo="No encontramos este establecimiento"
        descripcion="Puede que ya no esté disponible."
        accion={<Link to="/">Ir al inicio</Link>}
      />
    ) : (
      <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => consulta.refetch()} />
    )
  }

  const lugar = consulta.data
  const distancia = distanciaDesdeUniversidad(lugar.latitud, lugar.longitud)
  const ordenados = [...(menus.data ?? [])].sort(
    (a, b) => Number(b.disponible) - Number(a.disponible) || a.precio - b.precio,
  )
  const masEconomico = ordenados.find((menu) => menu.disponible)
  const listaBeneficios = [...(beneficios.data ?? [])].sort(compararBeneficios)
  const pestanas: Pestana[] = listaBeneficios.length > 0 ? ['Menú', 'Beneficios', 'Información', 'Reseñas'] : ['Menú', 'Información', 'Reseñas']
  const horario = textoHorario(lugar)
  const urlRuta =
    distancia &&
    `https://www.google.com/maps/dir/?api=1&origin=${UNIVERSIDAD.lat},${UNIVERSIDAD.lng}&destination=${lugar.latitud},${lugar.longitud}&travelmode=walking`

  return (
    <main className="detail-page">
      <div className="detail-cover">
        {lugar.imagenUrl ? (
          <img src={lugar.imagenUrl} alt={`Imagen de ${lugar.nombre}`} />
        ) : (
          <div className="no-image" aria-hidden="true">
            <Store size={48} />
          </div>
        )}
        <button type="button" className="floating-back" onClick={() => navegar(-1)} aria-label="Volver">
          <ArrowLeft />
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-title">
          <div>
            <span className="overline">{lugar.tipo.toUpperCase()}</span>
            <h1>{lugar.nombre}</h1>
            <button type="button" className="rating-link" onClick={() => setPestana('Reseñas')}>
              <Estrellas
                promedio={resumen.data?.totalCalificaciones ? resumen.data.promedio : null}
                total={resumen.data?.totalCalificaciones ?? 0}
              />
            </button>
          </div>
        </div>
        {lugar.descripcion && <p>{lugar.descripcion}</p>}

        <div className="quick-facts">
          <EstadoHorario lugar={lugar} />
          {distancia && (
            <span>
              <MapPin />
              {distancia.minutos} min caminando
            </span>
          )}
          {masEconomico && <span>Desde {monedaCOP(masEconomico.precio)}</span>}
          {listaBeneficios.length > 0 && (
            <button type="button" className="benefit-pill" onClick={() => setPestana('Beneficios')}>
              <GraduationCap size={16} />
              {listaBeneficios.length === 1 ? '1 beneficio estudiantil' : `${listaBeneficios.length} beneficios estudiantiles`}
            </button>
          )}
        </div>

        <div className="tabs" role="tablist">
          {pestanas.map((opcion) => (
            <button
              key={opcion}
              type="button"
              role="tab"
              aria-selected={pestana === opcion}
              className={pestana === opcion ? 'active' : ''}
              onClick={() => setPestana(opcion)}
            >
              {opcion}
            </button>
          ))}
        </div>

        {pestana === 'Menú' && (
          <div className="tab-content" role="tabpanel">
            {menus.isLoading && <p>Cargando menús…</p>}
            {menus.isError && (
              <EstadoError mensaje={mensajeDeError(menus.error)} onReintentar={() => menus.refetch()} />
            )}
            {menus.data?.length === 0 && (
              <EstadoVacio titulo="Este lugar aún no publica su menú" descripcion="Consulta la información de contacto." />
            )}
            {ordenados.map((menu) => (
              <TarjetaMenu key={menu.id} menu={menu} destacado={menu.id === masEconomico?.id} />
            ))}
          </div>
        )}

        {pestana === 'Beneficios' && (
          <div className="tab-content" role="tabpanel">
            <p className="form-hint">Presenta tu carné estudiantil vigente para acceder a estos beneficios.</p>
            <div className="benefit-list">
              {listaBeneficios.map((beneficio) => (
                <TarjetaBeneficio key={beneficio.id} beneficio={beneficio} precioMinimo={masEconomico?.precio} />
              ))}
            </div>
          </div>
        )}

        {pestana === 'Reseñas' && <SeccionResenas establecimientoId={lugar.id} />}

        {pestana === 'Información' && (
          <div className="tab-content" role="tabpanel">
            <h2>Horario</h2>
            {lugar.cerradoTemporalmente ? (
              <p className="info-line">
                <Clock3 /> Cerrado temporalmente{horario ? ` (horario habitual: ${horario})` : ''}
              </p>
            ) : horario ? (
              <p className="info-line">
                <Clock3 /> Todos los días, {horario}
              </p>
            ) : (
              <p className="info-line muted">
                <Clock3 /> Este lugar aún no publica su horario
              </p>
            )}
            <h2>Cómo llegar</h2>
            <p className="info-line">
              <MapPin /> {lugar.direccion}
            </p>
            {distancia && lugar.latitud != null && lugar.longitud != null && (
              <>
                <MapaDetalle
                  lat={lugar.latitud}
                  lng={lugar.longitud}
                  etiqueta={masEconomico ? monedaCOP(masEconomico.precio) : lugar.nombre}
                  minutos={distancia.minutos}
                  metros={distancia.metros}
                />
                <p className="map-distance-note">Distancia aproximada desde la entrada principal de la universidad</p>
              </>
            )}
            {lugar.telefono && (
              <>
                <h2>Contacto</h2>
                <a className="info-line" href={`tel:${lugar.telefono}`}>
                  <Phone /> {lugar.telefono}
                </a>
              </>
            )}
          </div>
        )}
      </div>

      <div className="detail-actions">
        <Button
          onClick={() => {
            setPestana('Reseñas')
            window.scrollTo({ top: 300, behavior: 'smooth' })
          }}
        >
          <Star size={18} /> Calificar
        </Button>
        {urlRuta && (
          <Button variant="secondary" onClick={() => window.open(urlRuta, '_blank', 'noopener,noreferrer')}>
            <MapPin size={18} /> Cómo llegar
          </Button>
        )}
        {lugar.telefono ? (
          <Button variant="secondary" onClick={() => window.open(enlaceWhatsApp(lugar.telefono ?? ''), '_blank', 'noopener,noreferrer')}>
            <MessageCircle size={18} /> WhatsApp
          </Button>
        ) : null}
      </div>
    </main>
  )
}
