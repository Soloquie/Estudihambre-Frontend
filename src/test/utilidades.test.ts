import { describe, expect, it } from 'vitest'
import { enriquecer, indicePrecioCalidad, ordenar } from '@/features/establecimientos/utilidades'
import type { Establecimiento } from '@/features/establecimientos/types'

const base = (id: number, nombre: string): Establecimiento => ({
  id,
  nombre,
  tipo: 'Restaurante',
  descripcion: null,
  direccion: 'Calle 1',
  telefono: null,
  imagenUrl: null,
  latitud: null,
  longitud: null,
  estado: 'APROBADO',
})

const lugares = enriquecer(
  [base(1, 'Caro'), base(2, 'Barato'), base(3, 'Sin menú')],
  new Map([
    [1, 15000],
    [2, 10000],
  ]),
  new Map([
    [1, { establecimientoId: 1, promedio: 4.8, totalCalificaciones: 5 }],
    [2, { establecimientoId: 2, promedio: 4.0, totalCalificaciones: 2 }],
  ]),
)

describe('ordenar establecimientos', () => {
  it('ordena por menor precio y deja al final los que no tienen menú', () => {
    expect(ordenar(lugares, 'precio').map((lugar) => lugar.id)).toEqual([2, 1, 3])
  })

  it('ordena por mejor calificación', () => {
    expect(ordenar(lugares, 'calificacion').map((lugar) => lugar.id)).toEqual([1, 2, 3])
  })

  it('solo calcula precio-calidad con al menos 3 calificaciones', () => {
    expect(indicePrecioCalidad(lugares[0]!)).toBeCloseTo(3.2)
    expect(indicePrecioCalidad(lugares[1]!)).toBeNull()
    expect(ordenar(lugares, 'precio-calidad')[0]?.id).toBe(1)
  })
})
