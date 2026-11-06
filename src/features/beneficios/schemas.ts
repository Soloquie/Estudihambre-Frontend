import { z } from 'zod'
import type { DatosBeneficio } from './types'

const texto = (max: number, mensaje: string) => z.string().trim().max(max, mensaje)
const entero = (valor: string) => (valor.trim() === '' ? null : Number(valor))

/** Mismas validaciones que BeneficioEstudiantilCrearDTO y las reglas del servicio. */
export const esquemaBeneficio = z
  .object({
    tipo: z.enum(['DESCUENTO', 'TIQUETERA']),
    titulo: texto(120, 'Máximo 120 caracteres').min(1, 'El título es obligatorio'),
    descripcion: texto(500, 'Máximo 500 caracteres'),
    porcentajeDescuento: z.string(),
    cantidadComidas: z.string(),
    precioTiquetera: z.string(),
    codigo: texto(80, 'Máximo 80 caracteres'),
    fechaInicio: z.string(),
    fechaFin: z.string(),
    activo: z.boolean(),
  })
  .superRefine((datos, contexto) => {
    const error = (path: string, message: string) => contexto.addIssue({ code: 'custom', path: [path], message })
    if (datos.tipo === 'DESCUENTO') {
      const porcentaje = entero(datos.porcentajeDescuento)
      if (porcentaje === null || !Number.isInteger(porcentaje) || porcentaje < 1 || porcentaje > 100) {
        error('porcentajeDescuento', 'Escribe un porcentaje entero entre 1 y 100')
      }
    } else {
      const cantidad = entero(datos.cantidadComidas)
      if (cantidad === null || !Number.isInteger(cantidad) || cantidad < 2) {
        error('cantidadComidas', 'La tiquetera debe incluir al menos 2 comidas')
      }
      const precio = entero(datos.precioTiquetera)
      if (precio === null || !Number.isFinite(precio) || precio <= 0) {
        error('precioTiquetera', 'Escribe el precio de la tiquetera')
      }
    }
    if (datos.fechaInicio && datos.fechaFin && datos.fechaFin < datos.fechaInicio) {
      error('fechaFin', 'La fecha de fin no puede ser anterior a la de inicio')
    }
  })
  .transform(
    (datos): DatosBeneficio => ({
      tipo: datos.tipo,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      porcentajeDescuento: datos.tipo === 'DESCUENTO' ? entero(datos.porcentajeDescuento) : null,
      cantidadComidas: datos.tipo === 'TIQUETERA' ? entero(datos.cantidadComidas) : null,
      precioTiquetera: datos.tipo === 'TIQUETERA' ? entero(datos.precioTiquetera) : null,
      codigo: datos.codigo,
      fechaInicio: datos.fechaInicio || null,
      fechaFin: datos.fechaFin || null,
      activo: datos.activo,
    }),
  )

export type EntradaBeneficio = z.input<typeof esquemaBeneficio>
export type SalidaBeneficio = z.output<typeof esquemaBeneficio>
