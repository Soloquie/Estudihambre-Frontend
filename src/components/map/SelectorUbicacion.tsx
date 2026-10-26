import { useState } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import { UNIVERSIDAD } from '@/config/constants'
import type { Punto } from '@/lib/geo'
import { iconoPrecio, iconoUniversidad } from './iconos'
import { AvisoFallo, CapaBase } from './comunes'

type Props = { valor: Punto | null; onChange: (punto: Punto) => void }

function EscucharClics({ onChange }: { onChange: (punto: Punto) => void }) {
  useMapEvents({ click: (evento) => onChange({ lat: evento.latlng.lat, lng: evento.latlng.lng }) })
  return null
}

export function SelectorUbicacion({ valor, onChange }: Props) {
  const [fallo, setFallo] = useState(false)
  const centro = valor ?? UNIVERSIDAD

  return (
    <div className="leaflet-map admin-leaflet-map">
      <MapContainer center={[centro.lat, centro.lng]} zoom={16} scrollWheelZoom={false}>
        <CapaBase onFallo={setFallo} />
        <EscucharClics onChange={onChange} />
        <Marker position={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]} icon={iconoUniversidad()} interactive={false} />
        {valor && (
          <Marker
            position={[valor.lat, valor.lng]}
            icon={iconoPrecio('Aquí', true)}
            draggable
            eventHandlers={{
              dragend: (evento) => {
                const punto = evento.target.getLatLng()
                onChange({ lat: punto.lat, lng: punto.lng })
              },
            }}
          />
        )}
      </MapContainer>
      <AvisoFallo visible={fallo} />
    </div>
  )
}
