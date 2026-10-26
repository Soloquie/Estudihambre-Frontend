const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export const monedaCOP = (valor: number) => formatoCOP.format(valor)

export const fechaCorta = (fecha: string) => formatoFecha.format(new Date(fecha))

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

/** Normaliza un teléfono colombiano para enlaces de WhatsApp (wa.me/57XXXXXXXXXX). */
export function enlaceWhatsApp(telefono: string): string {
  const digitos = telefono.replace(/\D/g, '')
  const numero = digitos.startsWith('57') && digitos.length > 10 ? digitos : `57${digitos}`
  return `https://wa.me/${numero}`
}
