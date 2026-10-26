import { divIcon } from 'leaflet'

const ICONO_BIRRETE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>'

const escaparHtml = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function iconoPrecio(etiqueta: string, seleccionado = false) {
  return divIcon({
    className: 'map-price-icon-shell',
    html: `<div class="map-price-icon${seleccionado ? ' selected' : ''}">${escaparHtml(etiqueta)}</div>`,
    iconSize: [80, 36],
    iconAnchor: [40, 36],
  })
}

export function iconoUniversidad() {
  return divIcon({
    className: 'university-icon-shell',
    html: `<div class="university-icon">${ICONO_BIRRETE}</div><span>U. del Quindío</span>`,
    iconSize: [116, 44],
    iconAnchor: [22, 22],
  })
}

export function iconoRadio(etiqueta: string) {
  return divIcon({
    className: 'radius-label-shell',
    html: `<span>${etiqueta}</span>`,
    iconSize: [52, 24],
    iconAnchor: [26, 12],
  })
}
