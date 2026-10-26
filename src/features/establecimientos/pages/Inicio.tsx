import { ListFilter, MapPin, Menu as IconoLista, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Chip, EstadoError, EstadoVacio, ListaCargando, Button } from '@/components/ui'
import { MapaInicio, type LugarMapa } from '@/components/map/MapaInicio'
import { preciosMinimos, useMenus } from '@/features/menus/hooks'
import { mensajeDeError } from '@/lib/http/client'
import { monedaCOP } from '@/lib/format'
import { TarjetaEstablecimiento } from '../components/TarjetaEstablecimiento'
import { useEstablecimientos } from '../hooks'
import { enriquecer, ordenar, type Orden } from '../utilidades'

const OPCIONES_ORDEN: { valor: Orden; texto: string }[] = [
  { valor: 'precio', texto: 'Menor precio' },
  { valor: 'cerca', texto: 'Más cerca' },
]

export function Inicio() {
  const navegar = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const nombre = parametros.get('nombre') ?? undefined
  const tipo = parametros.get('tipo') ?? undefined
  const [texto, setTexto] = useState(nombre ?? '')
  const [orden, setOrden] = useState<Orden>('precio')
  const [vista, setVista] = useState<'lista' | 'mapa'>('lista')
  const [resaltado, setResaltado] = useState<number>()

  useEffect(() => setTexto(nombre ?? ''), [nombre])

  const establecimientos = useEstablecimientos({ nombre, tipo })
  const todos = useEstablecimientos({})
  const menus = useMenus()

  const lugares = useMemo(
    () => ordenar(enriquecer(establecimientos.data ?? [], preciosMinimos(menus.data)), orden),
    [establecimientos.data, menus.data, orden],
  )
  // Los tipos salen de la lista completa para que los chips no desaparezcan al filtrar.
  const tipos = useMemo(() => [...new Set((todos.data ?? []).map((lugar) => lugar.tipo))].sort(), [todos.data])

  const lugaresMapa: LugarMapa[] = lugares
    .filter((lugar) => lugar.latitud != null && lugar.longitud != null)
    .map((lugar) => ({
      id: lugar.id,
      nombre: lugar.nombre,
      tipo: lugar.tipo,
      lat: lugar.latitud as number,
      lng: lugar.longitud as number,
      etiquetaPrecio: lugar.precioMinimo === null ? 'Ver' : monedaCOP(lugar.precioMinimo),
      minutos: lugar.distancia?.minutos ?? 0,
      imagenUrl: lugar.imagenUrl,
    }))

  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    const termino = texto.trim()
    setParametros(termino ? { nombre: termino } : {})
  }
  const limpiar = () => {
    setTexto('')
    setParametros({})
  }
  const abrir = (id: number) => navegar(`/establecimientos/${id}`)
  const hayFiltro = Boolean(nombre || tipo)
  const cargando = establecimientos.isLoading || menus.isLoading

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="eyebrow">
          <MapPin size={15} /> Cerca de la U. del Quindío
        </div>
        <h1>¿Qué vas a comer hoy?</h1>
        <p>Compara precios reales y llega caminando.</p>
        <form className="searchbox" role="search" onSubmit={buscar}>
          <Search size={21} aria-hidden="true" />
          <input
            aria-label="Buscar establecimientos por nombre"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder="Busca un restaurante o cafetería"
          />
          {texto && (
            <button type="button" className="clear-search" aria-label="Limpiar búsqueda" onClick={limpiar}>
              <X size={18} />
            </button>
          )}
          <button type="submit" aria-label="Buscar">
            <ListFilter size={20} />
          </button>
        </form>
      </section>

      <div className="home-controls">
        <div className="chips-row">
          {OPCIONES_ORDEN.map((opcion) => (
            <Chip key={opcion.valor} active={orden === opcion.valor} onClick={() => setOrden(opcion.valor)}>
              {opcion.texto}
            </Chip>
          ))}
          {tipos.map((opcionTipo) => (
            <Chip
              key={opcionTipo}
              active={tipo === opcionTipo}
              onClick={() => {
                setTexto('')
                setParametros(tipo === opcionTipo ? {} : { tipo: opcionTipo })
              }}
            >
              {opcionTipo}
            </Chip>
          ))}
        </div>
        <div className="view-switch" aria-label="Cambiar vista">
          <button type="button" className={vista === 'lista' ? 'active' : ''} onClick={() => setVista('lista')}>
            <IconoLista size={17} /> Lista
          </button>
          <button type="button" className={vista === 'mapa' ? 'active' : ''} onClick={() => setVista('mapa')}>
            <MapPin size={17} /> Mapa
          </button>
        </div>
      </div>

      <div className={`section-title ${vista === 'mapa' ? 'map-hidden' : ''}`}>
        <div>
          <span>{hayFiltro ? 'Resultados' : 'Opciones para ti'}</span>
          {!cargando && <small>{lugares.length} lugares</small>}
        </div>
        {hayFiltro && (
          <button type="button" onClick={limpiar}>
            <X size={18} /> Quitar filtro
          </button>
        )}
      </div>

      {establecimientos.isError ? (
        <EstadoError
          mensaje={mensajeDeError(establecimientos.error)}
          onReintentar={() => establecimientos.refetch()}
        />
      ) : cargando ? (
        <ListaCargando />
      ) : lugares.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltro ? 'No encontramos resultados' : 'Aún no hay establecimientos aprobados'}
          descripcion={hayFiltro ? 'Prueba con otro nombre o tipo.' : 'Vuelve pronto: estamos sumando lugares.'}
          accion={
            hayFiltro && (
              <Button variant="secondary" onClick={limpiar}>
                Ver todos los lugares
              </Button>
            )
          }
        />
      ) : vista === 'lista' ? (
        <div className="places-grid">
          {lugares.map((lugar) => (
            <TarjetaEstablecimiento key={lugar.id} lugar={lugar} onAbrir={() => abrir(lugar.id)} />
          ))}
        </div>
      ) : (
        <div className="home-map-layout">
          <div className="map-side-list">
            <div className="map-results-title">
              <b>Lugares en el mapa</b>
              <span>{lugaresMapa.length} con ubicación</span>
            </div>
            {lugares.map((lugar) => (
              <TarjetaEstablecimiento
                key={lugar.id}
                lugar={lugar}
                seleccionado={resaltado === lugar.id}
                onResaltar={setResaltado}
                onAbrir={() => abrir(lugar.id)}
              />
            ))}
          </div>
          <MapaInicio lugares={lugaresMapa} seleccionadoId={resaltado} onSeleccionar={setResaltado} onAbrir={abrir} />
        </div>
      )}
    </main>
  )
}
