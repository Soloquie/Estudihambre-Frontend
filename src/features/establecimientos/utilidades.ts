import { distanciaDesdeUniversidad } from '@/lib/geo'
import { monedaCOP } from '@/lib/format'
import type { EstablecimientoConDatos } from './components/TarjetaEstablecimiento'
import type { Establecimiento } from './types'

export type Orden = 'precio' | 'cerca'

export function enriquecer(
  establecimientos: Establecimiento[],
  precios: Map<number, number>,
): EstablecimientoConDatos[] {
  return establecimientos.map((establecimiento) => {
    const precioMinimo = precios.get(establecimiento.id) ?? null
    return {
      ...establecimiento,
      precioMinimo,
      etiquetaPrecio: precioMinimo === null ? 'Sin menú publicado' : `Desde ${monedaCOP(precioMinimo)}`,
      distancia: distanciaDesdeUniversidad(establecimiento.latitud, establecimiento.longitud),
    }
  })
}

export function ordenar(lugares: EstablecimientoConDatos[], orden: Orden): EstablecimientoConDatos[] {
  const valor = (lugar: EstablecimientoConDatos) =>
    orden === 'precio' ? (lugar.precioMinimo ?? Infinity) : (lugar.distancia?.metros ?? Infinity)
  return [...lugares].sort((a, b) => valor(a) - valor(b))
}
