import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = { active?: boolean; onClick?: () => void; children: ReactNode }

export function Chip({ active = false, onClick, children }: Props) {
  return (
    <button type="button" className={`chip ${active ? 'active' : ''}`} aria-pressed={active} onClick={onClick}>
      {active && <Check size={14} />}
      {children}
    </button>
  )
}
