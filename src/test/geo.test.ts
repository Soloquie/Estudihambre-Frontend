import { describe, expect, it } from 'vitest'
import { distanciaMetros, minutosCaminando } from '@/lib/geo'
describe('geografía', () => { it('calcula distancia nula para el mismo punto', () => expect(distanciaMetros({ lat: 4.5, lng: -75.6 }, { lat: 4.5, lng: -75.6 })).toBe(0)); it('redondea los minutos hacia arriba', () => expect(minutosCaminando(81)).toBe(2)) })
