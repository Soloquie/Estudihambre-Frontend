export type Rol = 'ESTUDIANTE' | 'RESTAURANTE' | 'ADMIN'

/** Refleja LoginRespuestaDTO del backend. */
export type Usuario = { id: number; nombre: string; correo: string; mensaje: string; rol: Rol }

export type Credenciales = { correo: string; contrasena: string }

export type DatosRegistro = Credenciales & { nombre: string }
