import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase, getDeviceId } from './supabase'

let inflight: Promise<Session | null> | null = null
let claimedFor: string | null = null

async function establishSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  let session = data.session
  if (!session) {
    const { data: anon, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.warn('Anonymous sign-in failed:', error.message)
      return null
    }
    session = anon.session
  }
  if (session && claimedFor !== session.user.id) {
    claimedFor = session.user.id
    const { error } = await supabase.rpc('claim_device_data', { p_device_id: getDeviceId() })
    if (error) {
      claimedFor = null
      console.warn('Claiming device data failed:', error.message)
    }
  }
  return session
}

/** Current session, signing in anonymously on first launch. Safe to call often. */
export function ensureSession(): Promise<Session | null> {
  if (!inflight) {
    inflight = establishSession().finally(() => {
      inflight = null
    })
  }
  return inflight
}

export async function getUserId(): Promise<string | null> {
  const session = await ensureSession()
  return session?.user.id ?? null
}

export type AccountErrorKind = 'notFound' | 'badCode' | 'rateLimit' | 'emailExists' | 'generic'

export class AccountError extends Error {
  kind: AccountErrorKind
  constructor(kind: AccountErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

function classify(error: AuthError): AccountError {
  const code = error.code ?? ''
  const msg = error.message
  if (code === 'email_exists' || code === 'user_already_exists') return new AccountError('emailExists', msg)
  if (code === 'otp_disabled' || code === 'signup_disabled' || /signups? not allowed/i.test(msg)) {
    return new AccountError('notFound', msg)
  }
  if (code === 'otp_expired' || code === 'invalid_credentials' || /invalid|expired/i.test(msg)) {
    return new AccountError('badCode', msg)
  }
  if (code.includes('rate_limit') || error.status === 429) return new AccountError('rateLimit', msg)
  return new AccountError('generic', msg)
}

function requireClient() {
  if (!supabase) throw new AccountError('generic', 'Supabase not configured')
  return supabase
}

/** Link an e-mail to the current anonymous user. Sends a 6-digit code. */
export async function requestEmailLink(email: string): Promise<void> {
  const client = requireClient()
  await ensureSession()
  const { error } = await client.auth.updateUser({ email })
  if (error) throw classify(error)
}

export async function confirmEmailLink(email: string, token: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.auth.verifyOtp({ email, token, type: 'email_change' })
  if (error) throw classify(error)
}

/** Sign into an existing e-mail account. Sends a 6-digit code; never creates users. */
export async function requestRestore(email: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) throw classify(error)
}

/**
 * Anonymous data on this device is handed over to the restored account through
 * a merge token: staged here while still anonymous, redeemed after sign-in.
 */
export async function stageMerge(): Promise<string | null> {
  const client = requireClient()
  const session = await ensureSession()
  if (!session || !session.user.is_anonymous) return null
  const { data, error } = await client.rpc('stage_account_merge')
  if (error) {
    console.warn('Staging account merge failed:', error.message)
    return null
  }
  return (data as string | null) ?? null
}

export async function confirmRestore(
  email: string,
  token: string,
  mergeToken: string | null,
): Promise<void> {
  const client = requireClient()
  const { error } = await client.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw classify(error)
  if (mergeToken) {
    const { error: mergeError } = await client.rpc('complete_account_merge', { p_token: mergeToken })
    if (mergeError) console.warn('Merging device data failed:', mergeError.message)
  }
}

/** Forget the account on this device only. The next launch starts anonymous. */
export async function signOutLocal(): Promise<void> {
  const client = requireClient()
  claimedFor = null
  await client.auth.signOut({ scope: 'local' })
}

/** Delete the account and everything it owns, plus unclaimed rows of this device. */
export async function deleteAccount(): Promise<void> {
  const client = requireClient()
  await ensureSession()
  const { error } = await client.rpc('delete_own_account', { p_device_id: getDeviceId() })
  if (error) throw error
  claimedFor = null
  await client.auth.signOut({ scope: 'local' })
}
