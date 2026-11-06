import { MINIMO_CALIFICACIONES, type ResumenCalificaciones } from '@/features/calificaciones/types'
import { monedaCOP } from '@/lib/format'
import { distanciaDesdeUniversidad } from '@/lib/geo'
import type { EstablecimientoConDatos } from './components/TarjetaEstablecimiento'
import type { Establecimiento } from './types'

export type Orden = 'precio' | 'cerca' | 'calificacion' | 'precio-calidad'

export const OPCIONES_ORDEN: { valor: Orden; texto: string }[] = [
  { valor: 'precio', texto: 'Menor precio' },
  { valor: 'cerca', texto: 'Más cerca' },
  { valor: 'precio-calidad', texto: 'Mejor precio-calidad' },
  { valor: 'calificacion', texto: 'Mejor calificados' },
]

export function enriquecer(
  establecimientos: Establecimiento[],
  precios: Map<number, number>,
  resumenes: Map<number, ResumenCalificaciones>,
  beneficios: Map<number, unknown[]> = new Map(),
): EstablecimientoConDatos[] {
  return establecimientos.map((establecimiento) => {
    const precioMinimo = precios.get(establecimiento.id) ?? null
    const resumen = resumenes.get(establecimiento.id)
    return {
      ...establecimiento,
      precioMinimo,
      etiquetaPrecio: precioMinimo === null ? 'Sin menú publicado' : `Desde ${monedaCOP(precioMinimo)}`,
      distancia: distanciaDesdeUniversidad(establecimiento.latitud, establecimiento.longitud),
      promedio: resumen && resumen.totalCalificaciones > 0 ? resumen.promedio : null,
      totalCalificaciones: resumen?.totalCalificaciones ?? 0,
      beneficios: beneficios.get(establecimiento.id)?.length ?? 0,
    }
  })
}

/**
 * Índice precio-calidad (Entregable 2, RF-08): calificación promedio por cada $10.000.
 * Solo se calcula con al menos 3 calificaciones; los demás quedan al final.
 */
export function indicePrecioCalidad(lugar: EstablecimientoConDatos): number | null {
  if (lugar.promedio === null || lugar.precioMinimo === null) return null
  if (lugar.totalCalificaciones < MINIMO_CALIFICACIONES) return null
  return (lugar.promedio / lugar.precioMinimo) * 10_000
}

export function ordenar(lugares: EstablecimientoConDatos[], orden: Orden): EstablecimientoConDatos[] {
  // Valor de orden ascendente: lo que no tiene dato va al final (Infinity).
  const valor = (lugar: EstablecimientoConDatos): number => {
    switch (orden) {
      case 'precio':
        return lugar.precioMinimo ?? Infinity
      case 'cerca':
        return lugar.distancia?.metros ?? Infinity
      case 'calificacion':
        return lugar.promedio === null ? Infinity : -lugar.promedio
      case 'precio-calidad': {
        const indice = indicePrecioCalidad(lugar)
        return indice === null ? Infinity : -indice
      }
    }
  }
  return [...lugares].sort((a, b) => valor(a) - valor(b))
}

/** Filtros que se aplican en el navegador porque el backend no los ofrece en /api/establecimientos. */
export type FiltroLocal = { soloAbiertos: boolean; conBeneficio: boolean }

export function filtrarLocal(lugares: EstablecimientoConDatos[], filtro: FiltroLocal): EstablecimientoConDatos[] {
  return lugares.filter(
    (lugar) =>
      (!filtro.soloAbiertos || (lugar.abiertoAhora === true && !lugar.cerradoTemporalmente)) &&
      (!filtro.conBeneficio || lugar.beneficios > 0),
  )
}
