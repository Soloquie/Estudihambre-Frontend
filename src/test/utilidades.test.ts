import { describe, expect, it } from 'vitest'
import { ahorroTiquetera, estadoGestion, precioPorComida, valorBeneficio } from '@/features/beneficios/utilidades'
import type { Beneficio } from '@/features/beneficios/types'
import { estadoAhora, textoHorario } from '@/features/establecimientos/horario'
import { enriquecer, filtrarLocal, indicePrecioCalidad, ordenar } from '@/features/establecimientos/utilidades'
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
  horaApertura: null,
  horaCierre: null,
  cerradoTemporalmente: false,
  abiertoAhora: null,
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

describe('horario', () => {
  const abierto = { horaApertura: '07:00', horaCierre: '15:00', cerradoTemporalmente: false, abiertoAhora: true }

  it('usa el estado que calcula el backend', () => {
    expect(estadoAhora(abierto)?.texto).toBe('Abierto ahora')
    expect(estadoAhora({ ...abierto, abiertoAhora: false })?.texto).toBe('Cerrado ahora')
  })

  it('el cierre temporal tiene prioridad', () => {
    expect(estadoAhora({ ...abierto, cerradoTemporalmente: true })?.texto).toBe('Cerrado temporalmente')
  })

  it('sin horario no muestra estado', () => {
    expect(estadoAhora({ horaApertura: null, horaCierre: null, cerradoTemporalmente: false, abiertoAhora: null })).toBeNull()
  })

  it('apertura igual a cierre es 24 horas', () => {
    expect(textoHorario({ ...abierto, horaCierre: '07:00' })).toBe('Abierto 24 horas')
  })

  it('filtra solo los abiertos y los que tienen beneficio', () => {
    const conDatos = enriquecer(
      [{ ...base(7, 'Abierto'), abiertoAhora: true }, base(8, 'Sin horario')],
      new Map(),
      new Map(),
      new Map([[8, [{}]]]),
    )
    expect(filtrarLocal(conDatos, { soloAbiertos: true, conBeneficio: false }).map((l) => l.id)).toEqual([7])
    expect(filtrarLocal(conDatos, { soloAbiertos: false, conBeneficio: true }).map((l) => l.id)).toEqual([8])
  })
})

describe('beneficios estudiantiles', () => {
  const tiquetera: Beneficio = {
    id: 1,
    tipo: 'TIQUETERA',
    titulo: '10 almuerzos',
    descripcion: null,
    porcentajeDescuento: null,
    cantidadComidas: 10,
    precioTiquetera: 90000,
    codigo: null,
    fechaInicio: null,
    fechaFin: null,
    activo: true,
    vigente: true,
    establecimientoId: 1,
  }

  it('calcula el precio por comida y el ahorro real', () => {
    expect(precioPorComida(tiquetera)).toBe(9000)
    expect(ahorroTiquetera(tiquetera, 11000)).toBe(20000)
    expect(ahorroTiquetera(tiquetera, 8000)).toBeNull()
  })

  it('resume un descuento', () => {
    expect(valorBeneficio({ ...tiquetera, tipo: 'DESCUENTO', porcentajeDescuento: 15 })).toBe('15% de descuento')
  })

  it('explica por qué un beneficio no está visible', () => {
    const hoy = new Date(2026, 10, 6)
    expect(estadoGestion({ ...tiquetera, activo: false, vigente: false }, hoy).texto).toBe('Pausado')
    expect(estadoGestion({ ...tiquetera, vigente: false, fechaInicio: '2026-12-01' }, hoy).texto).toBe('Programado')
    expect(estadoGestion({ ...tiquetera, vigente: false, fechaFin: '2026-10-01' }, hoy).texto).toBe('Vencido')
  })
})
