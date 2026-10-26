import { METROS_POR_MINUTO, UNIVERSIDAD } from '@/config/constants'

export type Punto = { lat: number; lng: number }

const aRadianes = (grados: number) => (grados * Math.PI) / 180

/** Distancia en línea recta entre dos puntos (fórmula de Haversine), en metros. */
export function distanciaMetros(a: Punto, b: Punto): number {
  const dLat = aRadianes(b.lat - a.lat)
  const dLng = aRadianes(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function minutosCaminando(metros: number): number {
  return Math.max(1, Math.ceil(metros / METROS_POR_MINUTO))
}

/** Distancia y minutos desde la universidad, o null si no hay coordenadas. */
export function distanciaDesdeUniversidad(
  latitud: number | null,
  longitud: number | null,
): { metros: number; minutos: number } | null {
  if (latitud == null || longitud == null) return null
  const metros = distanciaMetros(UNIVERSIDAD, { lat: latitud, lng: longitud })
  return { metros, minutos: minutosCaminando(metros) }
}
