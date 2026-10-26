import { z } from 'zod'

export type RequisitoContrasena = { texto: string; cumple: (contrasena: string) => boolean }

/** Mismas reglas que AuthServiceImpl.validarContrasena en el backend. */
export const REQUISITOS_CONTRASENA: RequisitoContrasena[] = [
  { texto: 'Al menos 8 caracteres', cumple: (c) => c.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (c) => /[A-Z]/.test(c) },
  { texto: 'Una letra minúscula', cumple: (c) => /[a-z]/.test(c) },
  { texto: 'Un número', cumple: (c) => /\d/.test(c) },
  { texto: 'Un carácter especial', cumple: (c) => /[^a-zA-Z0-9\s]/.test(c) },
]

function contieneNombreDeCorreo(contrasena: string, correo: string): boolean {
  const local = correo.split('@')[0]?.toLowerCase() ?? ''
  return local.length >= 3 && contrasena.toLowerCase().includes(local)
}

export const esquemaIngreso = z.object({
  correo: z.string().trim().email('Ingresa un correo válido'),
  contrasena: z.string().min(1, 'Escribe tu contraseña'),
})

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener entre 2 y 100 caracteres')
      .max(100, 'El nombre debe tener entre 2 y 100 caracteres'),
    correo: z.string().trim().email('Ingresa un correo válido').max(150),
    contrasena: z.string(),
    aceptaDatos: z.boolean().refine((valor) => valor, 'Debes aceptar la política de datos'),
  })
  .superRefine((datos, contexto) => {
    const incumple = REQUISITOS_CONTRASENA.find((requisito) => !requisito.cumple(datos.contrasena))
    if (incumple) {
      contexto.addIssue({ code: 'custom', path: ['contrasena'], message: `Falta: ${incumple.texto.toLowerCase()}` })
    } else if (contieneNombreDeCorreo(datos.contrasena, datos.correo)) {
      contexto.addIssue({
        code: 'custom',
        path: ['contrasena'],
        message: 'La contraseña no puede contener el nombre de tu correo',
      })
    }
  })

export type ValoresIngreso = z.infer<typeof esquemaIngreso>
export type ValoresRegistro = z.infer<typeof esquemaRegistro>
