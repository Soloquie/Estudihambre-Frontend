import { Check } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type Contexto = { mostrar: (mensaje: string) => void }

const ContextoToast = createContext<Contexto | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensaje, setMensaje] = useState('')
  const temporizador = useRef<number | undefined>(undefined)

  const mostrar = useCallback((texto: string) => {
    window.clearTimeout(temporizador.current)
    setMensaje(texto)
    temporizador.current = window.setTimeout(() => setMensaje(''), 3500)
  }, [])

  return (
    <ContextoToast.Provider value={{ mostrar }}>
      {children}
      <div aria-live="polite" role="status">
        {mensaje && (
          <div className="toast">
            <Check />
            {mensaje}
          </div>
        )}
      </div>
    </ContextoToast.Provider>
  )
}

export function useToast(): Contexto {
  const contexto = useContext(ContextoToast)
  if (!contexto) throw new Error('useToast debe usarse dentro de ToastProvider')
  return contexto
}
