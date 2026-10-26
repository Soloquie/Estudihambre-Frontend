import { describe, expect, it } from 'vitest'; import { monedaCOP } from '@/lib/format'
describe('formato', () => { it('formatea pesos colombianos', () => expect(monedaCOP(12000)).toContain('12')) })
