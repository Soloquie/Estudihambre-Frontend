import { z } from 'zod'

const opcional = (max: number, mensaje: string) =>
  z.string().trim().max(max, mensaje).transform((valor) => (valor === '' ? null : valor))

/** Hora "HH:mm" (lo que devuelve <input type="time">) o vacío. */
const hora = z
  .string()
  .refine((valor) => valor === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(valor), 'Usa el formato HH:mm')
  .transform((valor) => (valor === '' ? null : valor))

/** Mismas validaciones que EstablecimientoCrearDTO en el backend. */
export const esquemaEstablecimiento = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  tipo: z.string().trim().min(1, 'El tipo es obligatorio').max(50, 'Máximo 50 caracteres'),
  descripcion: opcional(500, 'Máximo 500 caracteres'),
  direccion: z.string().trim().min(1, 'La dirección es obligatoria').max(200, 'Máximo 200 caracteres'),
  telefono: z
    .string()
    .trim()
    .refine((valor) => valor === '' || /^[0-9+()\s-]{7,20}$/.test(valor), 'Escribe un teléfono válido, por ejemplo 310 555 0123')
    .transform((valor) => (valor === '' ? null : valor)),
  horaApertura: hora,
  horaCierre: hora,
  cerradoTemporalmente: z.boolean(),
}).refine(
  (datos) => (datos.horaApertura === null) === (datos.horaCierre === null),
  { message: 'Indica la hora de apertura y la de cierre', path: ['horaCierre'] },
)

export type EntradaEstablecimiento = z.input<typeof esquemaEstablecimiento>
export type SalidaEstablecimiento = z.output<typeof esquemaEstablecimiento>

export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024

export const TIPOS_SUGERIDOS = ['Restaurante', 'Cafetería', 'Comidas rápidas', 'Panadería', 'Saludable']
