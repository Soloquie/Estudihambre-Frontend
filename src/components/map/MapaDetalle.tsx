import type { LatLngExpression } from 'leaflet'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline } from 'react-leaflet'
import { UNIVERSIDAD } from '@/config/constants'
import { iconoPrecio, iconoUniversidad } from './iconos'
import { AjustarPuntos, AvisoFallo, CapaBase, ProteccionMovil } from './comunes'

type Props = { lat: number; lng: number; etiqueta: string; minutos: number; metros: number }

export function MapaDetalle({ lat, lng, etiqueta, minutos, metros }: Props) {
  const [fallo, setFallo] = useState(false)
  const puntos = useMemo<LatLngExpression[]>(
    () => [
      [UNIVERSIDAD.lat, UNIVERSIDAD.lng],
      [lat, lng],
    ],
    [lat, lng],
  )

  return (
    <div className="leaflet-map detail-leaflet-map">
      <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false}>
        <CapaBase onFallo={setFallo} />
        <AjustarPuntos puntos={puntos} />
        <ProteccionMovil />
        <Marker position={[UNIVERSIDAD.lat, UNIVERSIDAD.lng]} icon={iconoUniversidad()} interactive={false} />
        <Marker position={[lat, lng]} icon={iconoPrecio(etiqueta, true)} />
        <Polyline
          positions={puntos}
          pathOptions={{ color: '#029648', weight: 4, dashArray: '7 9', opacity: 0.85 }}
        />
      </MapContainer>
      <div className="walking-label">
        {minutos} min caminando · {Math.round(metros)} m
      </div>
      <AvisoFallo visible={fallo} />
    </div>
  )
}
