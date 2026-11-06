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
  /** "HH:mm" o null si el propietario no definió horario. */
  horaApertura: string | null
  horaCierre: string | null
  cerradoTemporalmente: boolean | null
  /** Lo calcula el backend con la hora de Bogotá; null si no hay horario. */
  abiertoAhora: boolean | null
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
  horaApertura: string | null
  horaCierre: string | null
  cerradoTemporalmente: boolean
}
