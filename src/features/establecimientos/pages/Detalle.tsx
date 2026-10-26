import { ArrowLeft, MapPin, MessageCircle, Phone, Store } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapaDetalle } from '@/components/map/MapaDetalle'
import { Button, EstadoError, EstadoVacio } from '@/components/ui'
import { UNIVERSIDAD } from '@/config/constants'
import { useMenusDeEstablecimiento } from '@/features/menus/hooks'
import type { Menu } from '@/features/menus/types'
import { enlaceWhatsApp, monedaCOP } from '@/lib/format'
import { distanciaDesdeUniversidad } from '@/lib/geo'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { useEstablecimiento } from '../hooks'

type Pestana = 'Menú' | 'Información'

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
          </div>
        </div>
        {lugar.descripcion && <p>{lugar.descripcion}</p>}

        <div className="quick-facts">
          {distancia && (
            <span>
              <MapPin />
              {distancia.minutos} min caminando
            </span>
          )}
          {masEconomico && <span>Desde {monedaCOP(masEconomico.precio)}</span>}
        </div>

        <div className="tabs" role="tablist">
          {(['Menú', 'Información'] as Pestana[]).map((opcion) => (
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

        {pestana === 'Información' && (
          <div className="tab-content" role="tabpanel">
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
                <p className="info-line">
                  <Phone /> {lugar.telefono}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="detail-actions">
        {urlRuta && (
          <Button variant="secondary" onClick={() => window.open(urlRuta, '_blank', 'noopener,noreferrer')}>
            <MapPin size={18} /> Cómo llegar
          </Button>
        )}
        {lugar.telefono ? (
          <Button onClick={() => window.open(enlaceWhatsApp(lugar.telefono ?? ''), '_blank', 'noopener,noreferrer')}>
            <MessageCircle size={18} /> WhatsApp
          </Button>
        ) : null}
        {lugar.telefono && (
          <a className="btn btn-text" href={`tel:${lugar.telefono}`}>
            <Phone size={18} /> Llamar
          </a>
        )}
      </div>
    </main>
  )
}
