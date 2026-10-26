import type { ComponentProps, ReactNode } from 'react'

type Variante = 'primary' | 'secondary' | 'text' | 'danger'

type Props = ComponentProps<'button'> & {
  variant?: Variante
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', type = 'button', children, ...resto }: Props) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} {...resto}>
      {children}
    </button>
  )
}
