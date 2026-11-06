import { ArrowLeft, Edit3, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, ConfirmDialog, EstadoError, EstadoVacio, useToast } from '@/components/ui'
import { useMisEstablecimientos } from '@/features/establecimientos/hooks'
import { mensajeDeError } from '@/lib/http/client'
import { FormularioBeneficio } from '../components/FormularioBeneficio'
import { TarjetaBeneficio } from '../components/TarjetaBeneficio'
import { useBeneficiosGestion, useCambiarActivoBeneficio, useEliminarBeneficio } from '../hooks'
import type { Beneficio } from '../types'
import { estadoGestion } from '../utilidades'

type Edicion = { modo: 'nuevo' } | { modo: 'editar'; beneficio: Beneficio } | null

export function GestionBeneficios() {
  const { id = '' } = useParams()
  const toast = useToast()
  const mios = useMisEstablecimientos()
  const establecimiento = mios.data?.find((lugar) => String(lugar.id) === id)
  const beneficios = useBeneficiosGestion(id)
  const cambiarActivo = useCambiarActivoBeneficio()
  const eliminar = useEliminarBeneficio()
  const [edicion, setEdicion] = useState<Edicion>(null)
  const [porEliminar, setPorEliminar] = useState<Beneficio | null>(null)

  if (mios.isLoading) return <p className="state-box">Cargando…</p>
  if (!establecimiento) {
    return (
      <EstadoVacio
        titulo="No encontramos este establecimiento"
        accion={<Link to="/mis-establecimientos">Volver a mis establecimientos</Link>}
      />
    )
  }

  const alternar = (beneficio: Beneficio) =>
    cambiarActivo.mutate(
      { id: beneficio.id, activo: !beneficio.activo },
      {
        onSuccess: () => toast.mostrar(beneficio.activo ? 'Pausaste el beneficio' : 'Reactivaste el beneficio'),
        onError: (error) => toast.mostrar(mensajeDeError(error)),
      },
    )

  const confirmarEliminacion = () => {
    if (!porEliminar) return
    eliminar.mutate(porEliminar.id, {
      onSuccess: () => toast.mostrar(`Eliminaste ${porEliminar.titulo}`),
      onError: (error) => toast.mostrar(mensajeDeError(error)),
      onSettled: () => setPorEliminar(null),
    })
  }

  return (
    <main className="page subpage">
      <Link className="back-link" to="/mis-establecimientos">
        <ArrowLeft /> Mis establecimientos
      </Link>
      <div className="admin-heading">
        <div>
          <h1>Beneficios estudiantiles</h1>
          <span>{establecimiento.nombre}</span>
        </div>
        {!edicion && (
          <Button onClick={() => setEdicion({ modo: 'nuevo' })}>
            <Plus /> Nuevo beneficio
          </Button>
        )}
      </div>

      {establecimiento.estado !== 'APROBADO' && (
        <p className="notice">
          Puedes preparar tus beneficios desde ya. Los estudiantes los verán cuando aprobemos el establecimiento.
        </p>
      )}

      {edicion && (
        <FormularioBeneficio
          key={edicion.modo === 'editar' ? edicion.beneficio.id : 'nuevo'}
          establecimientoId={establecimiento.id}
          beneficio={edicion.modo === 'editar' ? edicion.beneficio : undefined}
          onListo={() => setEdicion(null)}
          onCancelar={() => setEdicion(null)}
        />
      )}

      {beneficios.isLoading && <p>Cargando beneficios…</p>}
      {beneficios.isError && (
        <EstadoError mensaje={mensajeDeError(beneficios.error)} onReintentar={() => beneficios.refetch()} />
      )}
      {beneficios.data?.length === 0 && !edicion && (
        <EstadoVacio
          titulo="Aún no ofreces beneficios"
          descripcion="Crea un descuento con carné o una tiquetera para atraer a más estudiantes."
        />
      )}

      <div className="benefit-list">
        {beneficios.data?.map((beneficio) => {
          const estado = estadoGestion(beneficio)
          return (
            <TarjetaBeneficio
              key={beneficio.id}
              beneficio={beneficio}
              estado={<span className={`status ${estado.clase}`}>{estado.texto}</span>}
              acciones={
                <>
                  <Button variant="secondary" onClick={() => setEdicion({ modo: 'editar', beneficio })}>
                    <Edit3 size={16} /> Editar
                  </Button>
                  <Button variant="secondary" disabled={cambiarActivo.isPending} onClick={() => alternar(beneficio)}>
                    {beneficio.activo ? <Pause size={16} /> : <Play size={16} />}
                    {beneficio.activo ? 'Pausar' : 'Reactivar'}
                  </Button>
                  <Button variant="text" onClick={() => setPorEliminar(beneficio)}>
                    <Trash2 size={16} /> Eliminar
                  </Button>
                </>
              }
            />
          )
        })}
      </div>

      {porEliminar && (
        <ConfirmDialog
          titulo={`¿Eliminar ${porEliminar.titulo}?`}
          descripcion="Los estudiantes dejarán de verlo. Si solo quieres ocultarlo un tiempo, usa Pausar."
          textoConfirmar="Eliminar beneficio"
          peligroso
          cargando={eliminar.isPending}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </main>
  )
}
