import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, useToast } from '@/components/ui'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { useGuardarMenu, useQuitarImagenMenu } from '../hooks'
import { esquemaMenu, type EntradaMenu, type SalidaMenu } from '../schemas'
import { MAX_IMAGENES_MENU, type Menu } from '../types'

type Props = { establecimientoId: number; menu?: Menu; onListo: () => void; onCancelar: () => void }

export function FormularioMenu({ establecimientoId, menu, onListo, onCancelar }: Props) {
  const toast = useToast()
  const guardar = useGuardarMenu()
  const quitarImagen = useQuitarImagenMenu()
  const [nuevas, setNuevas] = useState<File[]>([])
  const actuales = menu?.imagenes ?? []
  const disponibles = MAX_IMAGENES_MENU - actuales.length - nuevas.length

  const formulario = useForm<EntradaMenu, unknown, SalidaMenu>({
    resolver: zodResolver(esquemaMenu),
    mode: 'onBlur',
    defaultValues: {
      titulo: menu?.titulo ?? '',
      descripcion: menu?.descripcion ?? '',
      precio: menu?.precio ?? '',
      disponible: menu?.disponible ?? true,
    },
  })
  const { errors, isSubmitting } = formulario.formState

  const agregarImagenes = (lista: FileList | null) => {
    if (!lista) return
    const archivos = Array.from(lista)
    if (archivos.length > disponibles) toast.mostrar(`Solo puedes agregar ${disponibles} imagen(es) más`)
    setNuevas((previas) => [...previas, ...archivos.slice(0, Math.max(disponibles, 0))])
  }

  const enviar = formulario.handleSubmit(async (valores) => {
    try {
      await guardar.mutateAsync({
        id: menu?.id,
        datos: { ...valores, establecimientoId: menu ? undefined : establecimientoId },
        imagenes: nuevas,
      })
      toast.mostrar(menu ? 'Guardaste el menú' : 'Publicaste el menú')
      onListo()
    } catch (error) {
      if (error instanceof ApiError) {
        for (const campo of ['titulo', 'descripcion', 'precio'] as const) {
          const mensaje = error.erroresPorCampo[campo]
          if (mensaje) formulario.setError(campo, { message: mensaje })
        }
      }
      formulario.setError('root', { message: mensajeDeError(error, 'No pudimos guardar el menú') })
    }
  })

  return (
    <form className="form-card" onSubmit={enviar} noValidate>
      <h2>{menu ? `Editar ${menu.titulo}` : 'Nuevo menú'}</h2>
      <div className="form-grid">
        <label className={errors.titulo ? 'error-field' : ''}>
          Título *
          <input maxLength={100} placeholder="Ej.: Menú del día" {...formulario.register('titulo')} />
          {errors.titulo && <small>{errors.titulo.message}</small>}
        </label>
        <label className={errors.precio ? 'error-field' : ''}>
          Precio (COP) *
          <input type="number" inputMode="numeric" min={1} step={100} placeholder="11000" {...formulario.register('precio')} />
          {errors.precio && <small>{errors.precio.message}</small>}
        </label>
        <label className={`wide ${errors.descripcion ? 'error-field' : ''}`}>
          Descripción
          <textarea maxLength={500} rows={3} placeholder="Sopa, arroz, proteína, ensalada y jugo" {...formulario.register('descripcion')} />
          {errors.descripcion && <small>{errors.descripcion.message}</small>}
        </label>
        <label className="check-row wide">
          <input type="checkbox" {...formulario.register('disponible')} />
          <span>Disponible hoy</span>
        </label>
        <label className="wide">
          Imágenes ({actuales.length + nuevas.length} de {MAX_IMAGENES_MENU})
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disponibles <= 0}
            onChange={(evento) => {
              agregarImagenes(evento.target.files)
              evento.target.value = ''
            }}
          />
        </label>
      </div>

      <div className="thumbs">
        {actuales.map((url, indice) => (
          <figure key={url}>
            <img src={url} alt={`Imagen ${indice + 1} del menú`} />
            <button
              type="button"
              aria-label={`Quitar imagen ${indice + 1}`}
              disabled={quitarImagen.isPending}
              onClick={() => menu && quitarImagen.mutate({ id: menu.id, indice })}
            >
              <X size={14} />
            </button>
          </figure>
        ))}
        {nuevas.map((archivo, indice) => (
          <figure key={`${archivo.name}-${indice}`}>
            <img src={URL.createObjectURL(archivo)} alt={`Nueva imagen ${indice + 1}`} />
            <button
              type="button"
              aria-label={`Quitar nueva imagen ${indice + 1}`}
              onClick={() => setNuevas((previas) => previas.filter((_, posicion) => posicion !== indice))}
            >
              <X size={14} />
            </button>
          </figure>
        ))}
      </div>

      {errors.root && (
        <p className="form-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <div className="dialog-actions">
        <Button variant="text" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : menu ? 'Guardar menú' : 'Publicar menú'}
        </Button>
      </div>
    </form>
  )
}
