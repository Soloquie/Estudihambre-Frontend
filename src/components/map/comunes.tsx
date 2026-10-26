import { latLngBounds, type LatLngExpression } from 'leaflet'
import { useEffect, useState } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const URL_TESELAS = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUCION = '© OpenStreetMap contributors'

export function CapaBase({ onFallo }: { onFallo: (fallo: boolean) => void }) {
  return (
    <TileLayer
      attribution={ATRIBUCION}
      url={URL_TESELAS}
      eventHandlers={{ tileerror: () => onFallo(true), load: () => onFallo(false) }}
    />
  )
}

export function AjustarPuntos({ puntos }: { puntos: LatLngExpression[] }) {
  const mapa = useMap()
  useEffect(() => {
    if (puntos.length > 1) mapa.fitBounds(latLngBounds(puntos), { padding: [30, 30], maxZoom: 17 })
  }, [mapa, puntos])
  return null
}

/** En celulares, el mapa no se arrastra hasta que el usuario lo toca, para no bloquear el scroll. */
export function ProteccionMovil() {
  const mapa = useMap()
  const [esMovil] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [activo, setActivo] = useState(!esMovil)

  useEffect(() => {
    if (activo) mapa.dragging.enable()
    else mapa.dragging.disable()
  }, [activo, mapa])

  if (activo) return null
  return (
    <button className="map-touch-guard" type="button" onClick={() => setActivo(true)}>
      Toca para mover el mapa
    </button>
  )
}

export function AvisoFallo({ visible }: { visible: boolean }) {
  return visible ? <div className="map-fallback">No se pudo cargar el mapa</div> : null
}
