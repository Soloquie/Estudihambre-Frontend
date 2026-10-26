import { Edit3, Plus, Store, Trash2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, EstadoBadge, EstadoError, EstadoVacio, ListaCargando, useToast } from '@/components/ui'
import { mensajeDeError } from '@/lib/http/client'
import { useEliminarEstablecimiento, useMisEstablecimientos } from '../hooks'
import type { Establecimiento } from '../types'

export function MisEstablecimientos() {
  const consulta = useMisEstablecimientos()
  const eliminar = useEliminarEstablecimiento()
  const toast = useToast()
  const [porEliminar, setPorEliminar] = useState<Establecimiento | null>(null)

  const confirmarEliminacion = () => {
    if (!porEliminar) return
    eliminar.mutate(porEliminar.id, {
      onSuccess: () => toast.mostrar(`Eliminaste ${porEliminar.nombre}`),
      onError: (error) => toast.mostrar(mensajeDeError(error)),
      onSettled: () => setPorEliminar(null),
    })
  }

  return (
    <main className="page subpage">
      <div className="admin-heading">
        <div>
          <h1>Mis establecimientos</h1>
          <span>Registra tu negocio. El equipo lo revisa antes de publicarlo.</span>
        </div>
        <Link className="btn btn-primary" to="/mis-establecimientos/nuevo">
          <Plus /> Registrar
        </Link>
      </div>

      {consulta.isLoading && <ListaCargando cantidad={2} />}
      {consulta.isError && (
        <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => consulta.refetch()} />
      )}
      {consulta.data?.length === 0 && (
        <EstadoVacio
          titulo="Aún no registras establecimientos"
          descripcion="Publica tu menú y precios para que los estudiantes te encuentren."
          accion={
            <Link className="btn btn-primary" to="/mis-establecimientos/nuevo">
              Registrar mi establecimiento
            </Link>
          }
        />
      )}

      <div className="owner-list">
        {consulta.data?.map((lugar) => (
          <article className="owner-card" key={lugar.id}>
            {lugar.imagenUrl ? (
              <img src={lugar.imagenUrl} alt={`Imagen de ${lugar.nombre}`} loading="lazy" />
            ) : (
              <div className="no-image" aria-hidden="true">
                <Store />
              </div>
            )}
            <div>
              <EstadoBadge estado={lugar.estado} />
              <h3>{lugar.nombre}</h3>
              <p>
                {lugar.tipo} · {lugar.direccion}
              </p>
              {lugar.estado === 'PENDIENTE' && <p>Está en revisión. Te avisaremos cuando sea aprobado.</p>}
              {lugar.estado === 'RECHAZADO' && <p>No fue aprobado. Revisa los datos y vuelve a intentarlo.</p>}
              <div className="owner-actions">
                <Link className="btn btn-secondary" to={`/mis-establecimientos/${lugar.id}/editar`}>
                  <Edit3 size={16} /> Editar
                </Link>
                {lugar.estado === 'APROBADO' ? (
                  <Link className="btn btn-secondary" to={`/mis-establecimientos/${lugar.id}/menus`}>
                    <Utensils size={16} /> Gestionar menús
                  </Link>
                ) : (
                  <button type="button" className="btn btn-secondary" disabled title="Disponible cuando sea aprobado">
                    <Utensils size={16} /> Menús tras aprobación
                  </button>
                )}
                <button type="button" className="btn btn-text" onClick={() => setPorEliminar(lugar)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {porEliminar && (
        <ConfirmDialog
          titulo={`¿Eliminar ${porEliminar.nombre}?`}
          descripcion="También se eliminarán sus menús e imágenes. Esta acción no se puede deshacer."
          textoConfirmar="Eliminar establecimiento"
          peligroso
          cargando={eliminar.isPending}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </main>
  )
}
