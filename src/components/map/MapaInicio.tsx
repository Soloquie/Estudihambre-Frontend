import { useState } from 'react'
import { Circle, MapContainer, Marker } from 'react-leaflet'
import { UNIVERSIDAD } from '@/config/constants'
import { iconoPrecio, iconoRadio, iconoUniversidad } from './iconos'
import { AvisoFallo, CapaBase, ProteccionMovil } from './comunes'

export type LugarMapa = {
  id: number
  nombre: string
  tipo: string
  lat: number
  lng: number
  etiquetaPrecio: string
  minutos: number
  imagenUrl: string | null
}

type Props = {
  lugares: LugarMapa[]
  seleccionadoId?: number
  onSeleccionar: (id?: number) => void
  onAbrir: (id: number) => void
}

const ESTILO_RADIO = { color: '#01733A', fillColor: '#029648', weight: 1 }

export function MapaInicio({ lugares, seleccionadoId, onSeleccionar, onAbrir }: Props) {
  const [fallo, setFallo] = useState(false)
  const seleccionado = lugares.find((lugar) => lugar.id === seleccionadoId)

  return (
    <div className="leaflet-map home-leaflet-map">
      <MapContainer center={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]} zoom={15} scrollWheelZoom={false}>
        <CapaBase onFallo={setFallo} />
        <ProteccionMovil />
        <Circle
          center={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]}
          radius={800}
          pathOptions={{ ...ESTILO_RADIO, fillOpacity: 0.035, opacity: 0.3 }}
        />
        <Circle
          center={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]}
          radius={400}
          pathOptions={{ ...ESTILO_RADIO, fillOpacity: 0.045, opacity: 0.38 }}
        />
        <Marker position={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]} icon={iconoUniversidad()} />
        <Marker position={[UNIVERSIDAD.lat + 0.0035, UNIVERSIDAD.lng]} icon={iconoRadio('5 min')} interactive={false} />
        <Marker position={[UNIVERSIDAD.lat + 0.0071, UNIVERSIDAD.lng]} icon={iconoRadio('10 min')} interactive={false} />
        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            position={[lugar.lat, lugar.lng]}
            icon={iconoPrecio(lugar.etiquetaPrecio, lugar.id === seleccionadoId)}
            eventHandlers={{ click: () => onSeleccionar(lugar.id), mouseover: () => onSeleccionar(lugar.id) }}
          />
        ))}
      </MapContainer>
      <AvisoFallo visible={fallo} />
      {seleccionado ? (
        <article className="map-place-card">
          {seleccionado.imagenUrl && <img src={seleccionado.imagenUrl} alt="" />}
          <div>
            <h3>{seleccionado.nombre}</h3>
            <p>
              <strong>{seleccionado.etiquetaPrecio}</strong> · {seleccionado.minutos} min · {seleccionado.tipo}
            </p>
          </div>
          <button type="button" onClick={() => onAbrir(seleccionado.id)}>
            Ver detalle
          </button>
        </article>
      ) : (
        lugares.length > 0 && <span className="map-hint">Toca un precio para ver el lugar</span>
      )}
    </div>
  )
}
