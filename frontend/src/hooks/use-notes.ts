'use client'

import { useQuery } from '@tanstack/react-query'
import { getNotes } from '@/lib/api/notes'
import { NOTES_STALE_TIME_MS, NOTES_GC_TIME_MS } from '@/lib/constants/categories'

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
    staleTime: NOTES_STALE_TIME_MS,
    gcTime: NOTES_GC_TIME_MS,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

