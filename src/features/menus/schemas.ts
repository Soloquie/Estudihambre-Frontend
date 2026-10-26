import { z } from 'zod'

/** Mismas validaciones que MenuCrearDTO en el backend. */
export const esquemaMenu = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .transform((valor) => (valor === '' ? null : valor)),
  precio: z.preprocess(
    (valor) => (valor === '' || valor == null ? undefined : Number(valor)),
    z
      .number({ required_error: 'Escribe el precio', invalid_type_error: 'Escribe el precio' })
      .positive('El precio debe ser mayor que cero'),
  ),
  disponible: z.boolean(),
})

export type EntradaMenu = z.input<typeof esquemaMenu>
export type SalidaMenu = z.output<typeof esquemaMenu>
