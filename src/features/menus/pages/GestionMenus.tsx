import { ArrowLeft, Edit3, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, ConfirmDialog, EstadoError, EstadoVacio, useToast } from '@/components/ui'
import { useMisEstablecimientos } from '@/features/establecimientos/hooks'
import { monedaCOP } from '@/lib/format'
import { mensajeDeError } from '@/lib/http/client'
import { FormularioMenu } from '../components/FormularioMenu'
import { useEliminarMenu, useMenusDeEstablecimiento } from '../hooks'
import type { Menu } from '../types'

type Edicion = { modo: 'nuevo' } | { modo: 'editar'; menu: Menu } | null

export function GestionMenus() {
  const { id = '' } = useParams()
  const toast = useToast()
  const mios = useMisEstablecimientos()
  const establecimiento = mios.data?.find((lugar) => String(lugar.id) === id)
  const aprobado = establecimiento?.estado === 'APROBADO'
  const menus = useMenusDeEstablecimiento(id)
  const eliminar = useEliminarMenu()
  const [edicion, setEdicion] = useState<Edicion>(null)
  const [porEliminar, setPorEliminar] = useState<Menu | null>(null)

  if (mios.isLoading) return <p className="state-box">Cargando…</p>
  if (!establecimiento || !aprobado) {
    return (
      <EstadoVacio
        titulo="Aún no puedes gestionar menús aquí"
        descripcion="Los menús se habilitan cuando el establecimiento está aprobado."
        accion={<Link to="/mis-establecimientos">Volver a mis establecimientos</Link>}
      />
    )
  }

  // Si el menú en edición cambió (por ejemplo, se quitó una imagen), se usa la versión más reciente.
  const menuEnEdicion =
    edicion?.modo === 'editar' ? (menus.data?.find((menu) => menu.id === edicion.menu.id) ?? edicion.menu) : undefined

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
          <h1>Menús</h1>
          <span>{establecimiento.nombre}</span>
        </div>
        {!edicion && (
          <Button onClick={() => setEdicion({ modo: 'nuevo' })}>
            <Plus /> Nuevo menú
          </Button>
        )}
      </div>

      {edicion && (
        <FormularioMenu
          key={menuEnEdicion?.id ?? 'nuevo'}
          establecimientoId={establecimiento.id}
          menu={menuEnEdicion}
          onListo={() => setEdicion(null)}
          onCancelar={() => setEdicion(null)}
        />
      )}

      {menus.isError && <EstadoError mensaje={mensajeDeError(menus.error)} onReintentar={() => menus.refetch()} />}
      {menus.data?.length === 0 && !edicion && (
        <EstadoVacio titulo="Aún no publicas menús" descripcion="Agrega tu menú del día con su precio." />
      )}
      {menus.data?.map((menu) => (
        <article className="menu-admin-item" key={menu.id}>
          <div>
            <h3>{menu.titulo}</h3>
            <p>
              <b>{monedaCOP(menu.precio)}</b> {!menu.disponible && <span className="unavailable">· No disponible</span>}
            </p>
            {menu.descripcion && <p>{menu.descripcion}</p>}
            {menu.imagenes.length > 0 && (
              <div className="menu-gallery">
                {menu.imagenes.map((url, indice) => (
                  <img key={url} src={url} alt={`${menu.titulo}, foto ${indice + 1}`} loading="lazy" />
                ))}
              </div>
            )}
          </div>
          <div className="owner-actions">
            <Button variant="secondary" onClick={() => setEdicion({ modo: 'editar', menu })}>
              <Edit3 size={16} /> Editar
            </Button>
            <Button variant="text" onClick={() => setPorEliminar(menu)}>
              <Trash2 size={16} /> Eliminar
            </Button>
          </div>
        </article>
      ))}

      {porEliminar && (
        <ConfirmDialog
          titulo={`¿Eliminar ${porEliminar.titulo}?`}
          descripcion="Se eliminarán también sus imágenes."
          textoConfirmar="Eliminar menú"
          peligroso
          cargando={eliminar.isPending}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </main>
  )
}
