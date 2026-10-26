import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { contarNoLeidas, listarNotificaciones, marcarComoLeida } from './api'

const CLAVE = ['notificaciones'] as const

function usePestanaVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  useEffect(() => {
    const actualizar = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', actualizar)
    return () => document.removeEventListener('visibilitychange', actualizar)
  }, [])
  return visible
}

export function useContadorNoLeidas(habilitado: boolean) {
  const visible = usePestanaVisible()
  return useQuery({
    queryKey: [...CLAVE, 'contador'],
    queryFn: contarNoLeidas,
    enabled: habilitado,
    refetchInterval: habilitado && visible ? 60_000 : false,
  })
}

export const useNotificaciones = () => useQuery({ queryKey: CLAVE, queryFn: listarNotificaciones })

export function useMarcarLeida() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: marcarComoLeida,
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE }),
  })
}
