import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ApiError } from '@/lib/http/client'

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      // No tiene sentido reintentar errores del cliente (4xx).
      retry: (intentos, error) => !(error instanceof ApiError && error.estado >= 400 && error.estado < 500) && intentos < 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
