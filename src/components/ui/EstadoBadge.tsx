import type { Estado } from '@/features/establecimientos/types'

const ESTILOS: Record<Estado, { clase: string; texto: string }> = {
  PENDIENTE: { clase: 'pending', texto: 'Pendiente' },
  APROBADO: { clase: 'open', texto: 'Aprobado' },
  RECHAZADO: { clase: 'rejected', texto: 'Rechazado' },
}

export function EstadoBadge({ estado }: { estado: Estado }) {
  const { clase, texto } = ESTILOS[estado]
  return <span className={`status ${clase}`}>{texto}</span>
}
