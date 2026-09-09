import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, KeyRound, LogOut, Mail, UserRound } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/use-account'
import { useGames } from '@/hooks/use-games'
import { supabase } from '@/lib/supabase'
import {
  AccountError,
  confirmEmailLink,
  confirmRestore,
  requestEmailLink,
  requestRestore,
  signOutLocal,
  stageMerge,
  type AccountErrorKind,
} from '@/lib/auth'

type Mode = 'idle' | 'link' | 'restore'
type Step = 'email' | 'code'

const ERROR_KEYS: Record<AccountErrorKind, string> = {
  notFound: 'account.errNotFound',
  badCode: 'account.errBadCode',
  rateLimit: 'account.errRate',
  emailExists: 'account.errGeneric',
  generic: 'account.errGeneric',
}

const inputClass =
  'w-full rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none'

export function AccountCard() {
  const { t } = useTranslation()
  const { ready, isAnonymous, email: linkedEmail } = useAccount()
  const { data: games = [] } = useGames()

  const [mode, setMode] = useState<Mode>('idle')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AccountErrorKind | null>(null)
  const [switched, setSwitched] = useState(false)
  const [done, setDone] = useState<'linked' | 'restored' | null>(null)
  const mergeToken = useRef<string | null>(null)

  if (!supabase) return null

  function reset() {
    setMode('idle')
    setStep('email')
    setCode('')
    setError(null)
    setSwitched(false)
    mergeToken.current = null
  }

  function start(next: Mode) {
    reset()
    setDone(null)
    setMode(next)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    const address = email.trim()
    if (!address || busy) return
    setBusy(true)
    setError(null)
    try {
      if (mode === 'link') {
        try {
          await requestEmailLink(address)
        } catch (err) {
          if (!(err instanceof AccountError) || err.kind !== 'emailExists') throw err
          // Address already owns a history: fall through to the restore flow.
          setMode('restore')
          setSwitched(true)
          mergeToken.current = await stageMerge()
          await requestRestore(address)
        }
      } else {
        mergeToken.current = await stageMerge()
        await requestRestore(address)
      }
      setStep('code')
    } catch (err) {
      setError(err instanceof AccountError ? err.kind : 'generic')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    const token = code.trim()
    if (token.length < 6 || busy) return
    setBusy(true)
    setError(null)
    try {
      if (mode === 'link') {
        await confirmEmailLink(email.trim(), token)
        setDone('linked')
      } else {
        await confirmRestore(email.trim(), token, mergeToken.current)
        setDone('restored')
      }
      reset()
    } catch (err) {
      setError(err instanceof AccountError ? err.kind : 'generic')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    if (!confirm(t('account.signOutConfirm'))) return
    setDone(null)
    await signOutLocal()
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-forest-500" />
          <h2 className="font-heading text-base font-semibold text-forest-700">{t('account.title')}</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {done && (
          <div className="flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-3 text-sm text-forest-600">
            <Check className="h-4 w-4 shrink-0 text-forest-500" />
            {done === 'linked'
              ? t('account.linkedDone', { email: linkedEmail ?? email.trim() })
              : t('account.restoredDone')}
          </div>
        )}

        {!ready ? null : !isAnonymous ? (
          <>
            <p className="text-xs text-forest-400">{t('account.linkedDesc')}</p>
            <p className="flex items-center gap-2 text-sm font-medium text-forest-700">
              <Mail className="h-4 w-4 text-forest-500" />
              {linkedEmail}
            </p>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              {t('account.signOut')}
            </Button>
          </>
        ) : mode === 'idle' ? (
          <>
            <p className="text-xs text-forest-400">{t('account.anonDesc')}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => start('link')}>
                <Mail className="h-3.5 w-3.5" />
                {t('account.linkAction')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => start('restore')}>
                <KeyRound className="h-3.5 w-3.5" />
                {t('account.restoreAction')}
              </Button>
            </div>
          </>
        ) : step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs text-forest-400">{t('account.emailLabel')}</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={200}
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('account.emailPlaceholder')}
                className={inputClass}
              />
            </label>
            {mode === 'restore' && games.length > 0 && (
              <p className="text-xs text-forest-400">{t('account.mergeNote')}</p>
            )}
            {error && <p className="text-xs text-red-600">{t(ERROR_KEYS[error])}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={busy || !email.trim()}>
                {t('account.sendCode')}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={busy}>
                {t('account.cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-3">
            {switched && <p className="text-xs text-forest-600">{t('account.existsSwitch')}</p>}
            <p className="text-xs text-forest-400">{t('account.codeSent', { email: email.trim() })}</p>
            <label className="block space-y-1">
              <span className="text-xs text-forest-400">{t('account.codeLabel')}</span>
              <input
                type="text"
                name="one-time-code"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`${inputClass} tracking-[0.3em] font-mono`}
              />
            </label>
            {error && <p className="text-xs text-red-600">{t(ERROR_KEYS[error])}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={busy || code.trim().length < 6}>
                {t('account.confirm')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError(null)
                }}
              >
                {t('account.changeEmail')}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
