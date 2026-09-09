import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ensureSession } from '@/lib/auth'

export interface AccountState {
  user: User | null
  /** True once the initial session lookup has settled. */
  ready: boolean
  /** Anonymous or no session at all: history lives on this device only. */
  isAnonymous: boolean
  email: string | null
}

export function useAccount(): AccountState {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(() => !supabase)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ensureSession().then((session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const linked = !!user && !user.is_anonymous && !!user.email
  return {
    user,
    ready,
    isAnonymous: !linked,
    email: linked ? (user!.email ?? null) : null,
  }
}
