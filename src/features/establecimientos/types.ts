export type Estado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

/** Refleja EstablecimientoRespuestaDTO del backend. */
export type Establecimiento = {
  id: number
  nombre: string
  tipo: string
  descripcion: string | null
  direccion: string
  telefono: string | null
  imagenUrl: string | null
  latitud: number | null
  longitud: number | null
  estado: Estado
}

/** Refleja EstablecimientoCrearDTO / EstablecimientoActualizarDTO. */
export type DatosEstablecimiento = {
  nombre: string
  tipo: string
  descripcion: string | null
  direccion: string
  telefono: string | null
  latitud: number | null
  longitud: number | null
}
