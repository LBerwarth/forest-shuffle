import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ensureSession } from '@/lib/auth'

/** Warms up the anonymous session and refetches data whenever the account changes. */
export function AuthListener() {
  const qc = useQueryClient()

  useEffect(() => {
    if (!supabase) return
    ensureSession()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        qc.invalidateQueries()
      }
    })
    return () => data.subscription.unsubscribe()
  }, [qc])

  return null
}
