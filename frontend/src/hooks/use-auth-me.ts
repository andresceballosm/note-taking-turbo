'use client'

import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/api/auth'

export function useAuthMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
}
