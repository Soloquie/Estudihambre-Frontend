import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, useToast } from '@/components/ui'
import { monedaCOP } from '@/lib/format'
import { ApiError, mensajeDeError } from '@/lib/http/client'
import { useGuardarBeneficio } from '../hooks'
import { esquemaBeneficio, type EntradaBeneficio, type SalidaBeneficio } from '../schemas'
import type { Beneficio } from '../types'

type Props = { establecimientoId: number; beneficio?: Beneficio; onListo: () => void; onCancelar: () => void }

const CAMPOS = [
  'titulo',
  'descripcion',
  'porcentajeDescuento',
  'cantidadComidas',
  'precioTiquetera',
  'codigo',
  'fechaInicio',
  'fechaFin',
] as const

export function FormularioBeneficio({ establecimientoId, beneficio, onListo, onCancelar }: Props) {
  const toast = useToast()
  const guardar = useGuardarBeneficio()
  const formulario = useForm<EntradaBeneficio, unknown, SalidaBeneficio>({
    resolver: zodResolver(esquemaBeneficio),
    mode: 'onBlur',
    defaultValues: {
      tipo: beneficio?.tipo ?? 'DESCUENTO',
      titulo: beneficio?.titulo ?? '',
      descripcion: beneficio?.descripcion ?? '',
      porcentajeDescuento: beneficio?.porcentajeDescuento?.toString() ?? '',
      cantidadComidas: beneficio?.cantidadComidas?.toString() ?? '',
      precioTiquetera: beneficio?.precioTiquetera?.toString() ?? '',
      codigo: beneficio?.codigo ?? '',
      fechaInicio: beneficio?.fechaInicio ?? '',
      fechaFin: beneficio?.fechaFin ?? '',
      activo: beneficio?.activo ?? true,
    },
  })
  const { errors, isSubmitting } = formulario.formState
  const tipo = formulario.watch('tipo')
  const cantidad = Number(formulario.watch('cantidadComidas'))
  const precio = Number(formulario.watch('precioTiquetera'))
  const porComida = cantidad >= 2 && precio > 0 ? precio / cantidad : null

  const enviar = formulario.handleSubmit(async (datos) => {
    try {
      await guardar.mutateAsync({ establecimientoId, beneficioId: beneficio?.id, datos })
      toast.mostrar(beneficio ? 'Guardaste el beneficio' : 'Publicaste el beneficio')
      onListo()
    } catch (error) {
      if (error instanceof ApiError) {
        for (const campo of CAMPOS) {
          const mensaje = error.erroresPorCampo[campo]
          if (mensaje) formulario.setError(campo, { message: mensaje })
        }
      }
      formulario.setError('root', { message: mensajeDeError(error, 'No pudimos guardar el beneficio') })
    }
  })

  const clase = (campo: (typeof CAMPOS)[number], extra = '') => `${extra} ${errors[campo] ? 'error-field' : ''}`.trim()

  return (
    <form className="form-card" onSubmit={enviar} noValidate>
      <h2>{beneficio ? `Editar ${beneficio.titulo}` : 'Nuevo beneficio estudiantil'}</h2>

      <div className="segmented" role="radiogroup" aria-label="Tipo de beneficio">
        {(['DESCUENTO', 'TIQUETERA'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            role="radio"
            aria-checked={tipo === opcion}
            className={tipo === opcion ? 'active' : ''}
            onClick={() => formulario.setValue('tipo', opcion, { shouldDirty: true })}
          >
            {opcion === 'DESCUENTO' ? 'Descuento' : 'Tiquetera'}
          </button>
        ))}
      </div>
      <p className="form-hint">
        {tipo === 'DESCUENTO'
          ? 'Un porcentaje de descuento al mostrar el carné estudiantil.'
          : 'Un paquete de varias comidas pagadas por adelantado a un precio especial.'}
      </p>

      <div className="form-grid">
        <label className={clase('titulo', 'wide')}>
          Título *
          <input
            maxLength={120}
            placeholder={tipo === 'DESCUENTO' ? 'Ej.: 10% con carné de la Uniquindío' : 'Ej.: Tiquetera de 10 almuerzos'}
            {...formulario.register('titulo')}
          />
          {errors.titulo && <small>{errors.titulo.message}</small>}
        </label>

        {tipo === 'DESCUENTO' ? (
          <label className={clase('porcentajeDescuento')}>
            Porcentaje de descuento *
            <input type="number" inputMode="numeric" min={1} max={100} placeholder="10" {...formulario.register('porcentajeDescuento')} />
            {errors.porcentajeDescuento && <small>{errors.porcentajeDescuento.message}</small>}
          </label>
        ) : (
          <>
            <label className={clase('cantidadComidas')}>
              Número de comidas *
              <input type="number" inputMode="numeric" min={2} placeholder="10" {...formulario.register('cantidadComidas')} />
              {errors.cantidadComidas && <small>{errors.cantidadComidas.message}</small>}
            </label>
            <label className={clase('precioTiquetera')}>
              Precio total (COP) *
              <input type="number" inputMode="numeric" min={1} step={100} placeholder="95000" {...formulario.register('precioTiquetera')} />
              {errors.precioTiquetera ? (
                <small>{errors.precioTiquetera.message}</small>
              ) : (
                porComida !== null && <span className="field-note">Cada comida sale a {monedaCOP(porComida)}</span>
              )}
            </label>
          </>
        )}

        <label className={clase('codigo')}>
          Código (opcional)
          <input maxLength={80} placeholder="Ej.: UNIQ10" {...formulario.register('codigo')} />
          {errors.codigo && <small>{errors.codigo.message}</small>}
        </label>
        <label className={clase('fechaInicio')}>
          Válido desde
          <input type="date" {...formulario.register('fechaInicio')} />
          {errors.fechaInicio && <small>{errors.fechaInicio.message}</small>}
        </label>
        <label className={clase('fechaFin')}>
          Válido hasta
          <input type="date" {...formulario.register('fechaFin')} />
          {errors.fechaFin && <small>{errors.fechaFin.message}</small>}
        </label>
        <label className={clase('descripcion', 'wide')}>
          Condiciones
          <textarea
            maxLength={500}
            rows={3}
            placeholder="Ej.: Presenta tu carné vigente. No acumulable con otras promociones."
            {...formulario.register('descripcion')}
          />
          {errors.descripcion && <small>{errors.descripcion.message}</small>}
        </label>
        <label className="check-row wide">
          <input type="checkbox" {...formulario.register('activo')} />
          <span>Mostrar a los estudiantes</span>
        </label>
      </div>
      {beneficio && (beneficio.fechaInicio || beneficio.fechaFin) && (
        <p className="form-hint">Puedes cambiar las fechas, pero no dejarlas vacías una vez guardadas.</p>
      )}

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
          {isSubmitting ? 'Guardando…' : beneficio ? 'Guardar beneficio' : 'Publicar beneficio'}
        </Button>
      </div>
    </form>
  )
}
