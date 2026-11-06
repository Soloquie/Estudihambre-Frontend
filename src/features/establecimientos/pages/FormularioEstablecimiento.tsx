import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Flag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SelectorUbicacion } from '@/components/map/SelectorUbicacion'
import { Button, EstadoVacio, useToast } from '@/components/ui'
import { distanciaDesdeUniversidad, type Punto } from '@/lib/geo'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { useActualizarEstablecimiento, useCrearEstablecimiento, useMisEstablecimientos } from '../hooks'
import {
  esquemaEstablecimiento,
  TAMANO_MAXIMO_IMAGEN,
  TIPOS_SUGERIDOS,
  type EntradaEstablecimiento,
  type SalidaEstablecimiento,
} from '../schemas'

const CAMPOS = ['nombre', 'tipo', 'descripcion', 'direccion', 'telefono', 'horaApertura', 'horaCierre'] as const

export function FormularioEstablecimiento() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const toast = useToast()
  const mios = useMisEstablecimientos()
  const existente = esEdicion ? mios.data?.find((lugar) => String(lugar.id) === id) : undefined

  const crear = useCrearEstablecimiento()
  const actualizar = useActualizarEstablecimiento()
  const [ubicacion, setUbicacion] = useState<Punto | null>(null)
  const [imagen, setImagen] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [errorImagen, setErrorImagen] = useState('')

  const formulario = useForm<EntradaEstablecimiento, unknown, SalidaEstablecimiento>({
    resolver: zodResolver(esquemaEstablecimiento),
    mode: 'onBlur',
    defaultValues: {
      nombre: '',
      tipo: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      horaApertura: '',
      horaCierre: '',
      cerradoTemporalmente: false,
    },
  })
  const { errors, isSubmitting } = formulario.formState

  // Al editar, se cargan los datos actuales una sola vez.
  useEffect(() => {
    if (!existente) return
    formulario.reset({
      nombre: existente.nombre,
      tipo: existente.tipo,
      descripcion: existente.descripcion ?? '',
      direccion: existente.direccion,
      telefono: existente.telefono ?? '',
      horaApertura: existente.horaApertura ?? '',
      horaCierre: existente.horaCierre ?? '',
      cerradoTemporalmente: existente.cerradoTemporalmente ?? false,
    })
    if (existente.latitud != null && existente.longitud != null) {
      setUbicacion({ lat: existente.latitud, lng: existente.longitud })
    }
    setVistaPrevia(existente.imagenUrl)
  }, [existente, formulario])

  useEffect(() => {
    if (!imagen) return
    const url = URL.createObjectURL(imagen)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [imagen])

  if (esEdicion && mios.isSuccess && !existente) {
    return <EstadoVacio titulo="No encontramos este establecimiento" accion={<Link to="/mis-establecimientos">Volver</Link>} />
  }

  const elegirImagen = (archivo: File | undefined) => {
    setErrorImagen('')
    if (!archivo) return
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setErrorImagen('La imagen supera los 5 MB permitidos')
      return
    }
    setImagen(archivo)
  }

  const enviar = formulario.handleSubmit(async (valores) => {
    if (!ubicacion) {
      formulario.setError('root', { message: 'Marca la ubicación del establecimiento en el mapa' })
      return
    }
    if (!esEdicion && !imagen) {
      setErrorImagen('La imagen es obligatoria')
      return
    }
    const datos = { ...valores, latitud: ubicacion.lat, longitud: ubicacion.lng }
    try {
      if (existente) {
        await actualizar.mutateAsync({ id: existente.id, datos, imagen: imagen ?? undefined })
        toast.mostrar('Guardaste los cambios')
      } else if (imagen) {
        await crear.mutateAsync({ datos, imagen })
        toast.mostrar('Tu establecimiento quedó pendiente de aprobación')
      }
      navegar('/mis-establecimientos')
    } catch (error) {
      if (error instanceof ApiError) {
        for (const campo of CAMPOS) {
          const mensaje = error.erroresPorCampo[campo]
          if (mensaje) formulario.setError(campo, { message: mensaje })
        }
      }
      formulario.setError('root', { message: mensajeDeError(error, 'No pudimos guardar el establecimiento') })
    }
  })

  const distancia = ubicacion ? distanciaDesdeUniversidad(ubicacion.lat, ubicacion.lng) : null
  const claseCampo = (campo: (typeof CAMPOS)[number], extra = '') =>
    `${extra} ${errors[campo] ? 'error-field' : ''}`.trim()

  return (
    <main className="page subpage">
      <Link className="back-link" to="/mis-establecimientos">
        <ArrowLeft /> Mis establecimientos
      </Link>
      <div className="admin-heading">
        <div>
          <h1>{esEdicion ? 'Editar establecimiento' : 'Registrar establecimiento'}</h1>
          <span>{esEdicion ? existente?.nombre : 'Lo revisaremos antes de publicarlo.'}</span>
        </div>
      </div>

      <form className="edit-layout" onSubmit={enviar} noValidate>
        <div>
          <section className="form-card">
            <h2>Información general</h2>
            <div className="form-grid">
              <label className={claseCampo('nombre')}>
                Nombre *
                <input maxLength={100} {...formulario.register('nombre')} />
                {errors.nombre && <small>{errors.nombre.message}</small>}
              </label>
              <label className={claseCampo('tipo')}>
                Tipo *
                <input list="tipos-sugeridos" maxLength={50} {...formulario.register('tipo')} />
                <datalist id="tipos-sugeridos">
                  {TIPOS_SUGERIDOS.map((tipo) => (
                    <option key={tipo} value={tipo} />
                  ))}
                </datalist>
                {errors.tipo && <small>{errors.tipo.message}</small>}
              </label>
              <label className={claseCampo('direccion', 'wide')}>
                Dirección *
                <input maxLength={200} placeholder="Ej.: Carrera 15 # 12-30, Armenia" {...formulario.register('direccion')} />
                {errors.direccion && <small>{errors.direccion.message}</small>}
              </label>
              <label className={claseCampo('telefono')}>
                Teléfono o WhatsApp
                <input type="tel" placeholder="310 555 0123" {...formulario.register('telefono')} />
                {errors.telefono && <small>{errors.telefono.message}</small>}
              </label>
              <label className={errorImagen ? 'error-field' : ''}>
                Imagen {esEdicion ? '(opcional)' : '*'}
                <input type="file" accept="image/*" onChange={(evento) => elegirImagen(evento.target.files?.[0])} />
                {errorImagen && <small>{errorImagen}</small>}
              </label>
              <label className={claseCampo('descripcion', 'wide')}>
                Descripción
                <textarea maxLength={500} rows={3} {...formulario.register('descripcion')} />
                {errors.descripcion && <small>{errors.descripcion.message}</small>}
              </label>
            </div>
            {vistaPrevia && <img className="preview-image" src={vistaPrevia} alt="Vista previa de la imagen" />}
          </section>

          <section className="form-card">
            <h2>Horario de atención</h2>
            <p className="form-hint">Los estudiantes verán si estás abierto en este momento (hora de Colombia).</p>
            <div className="form-grid">
              <label className={claseCampo('horaApertura')}>
                Abre a las
                <input type="time" {...formulario.register('horaApertura')} />
                {errors.horaApertura && <small>{errors.horaApertura.message}</small>}
              </label>
              <label className={claseCampo('horaCierre')}>
                Cierra a las
                <input type="time" {...formulario.register('horaCierre')} />
                {errors.horaCierre && <small>{errors.horaCierre.message}</small>}
              </label>
            </div>
            <p className="form-hint">Si cierras después de medianoche, pon la hora del día siguiente (por ejemplo, de 18:00 a 02:00).</p>
            <label className="switch-row">
              <span>
                <b>Cerrado temporalmente</b>
                <small>Por vacaciones, arreglos o cualquier otro motivo.</small>
              </span>
              <input type="checkbox" {...formulario.register('cerradoTemporalmente')} />
              <i aria-hidden="true" />
            </label>
          </section>

          <section className="form-card">
            <div className="admin-map-heading">
              <b>Ubicación en el mapa *</b>
              <span>Haz clic en el mapa y arrastra el marcador para ajustar el punto.</span>
            </div>
            <SelectorUbicacion valor={ubicacion} onChange={setUbicacion} />
            <div className="coordinate-fields">
              <label>
                Latitud
                <input value={ubicacion ? ubicacion.lat.toFixed(6) : ''} readOnly />
              </label>
              <label>
                Longitud
                <input value={ubicacion ? ubicacion.lng.toFixed(6) : ''} readOnly />
              </label>
            </div>
          </section>
        </div>

        <aside className="edit-summary">
          <h3>Antes de guardar</h3>
          <p>
            <Check /> {distancia ? `A ${distancia.minutos} min caminando de la universidad` : 'Marca la ubicación en el mapa'}
          </p>
          <p>
            <Check /> Revisa que el teléfono sea correcto.
          </p>
          {errors.root && (
            <p className="error-text" role="alert">
              <Flag /> {errors.root.message}
            </p>
          )}
          <Button type="submit" className="full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar establecimiento'}
          </Button>
        </aside>
      </form>
    </main>
  )
}
