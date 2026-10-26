import { Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="EstudiHambre, ir al inicio">
      <span>
        <Utensils size={19} />
      </span>
      Estudi<strong>Hambre</strong>
    </Link>
  )
}
