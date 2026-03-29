import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3,
  Gauge,
  ShieldCheck,
  Target,
  X,
  Lock,
} from 'lucide-react'
import styles from './consent.css?inline'

type PrefKey = 'analytics' | 'performance' | 'marketing'

type ConsentState = {
  essential: true
  analytics: boolean
  performance: boolean
  marketing: boolean
}

const STORAGE_KEY = 'dr_cookie_consent'
const CONSENT_VERSION = 3

const DEFAULT_PREFS: ConsentState = {
  essential: true,
  analytics: false,
  performance: false,
  marketing: false,
}

const categoryMeta: Array<{
  key: 'essential' | PrefKey
  title: string
  description: string
  icon: React.ReactNode
  tone: string
}> = [
  {
    key: 'essential',
    title: 'Essential',
    description:
      'Required for login, security, and core site functionality. These cannot be disabled.',
    icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />,
    tone: 'from-emerald-50 to-emerald-100/70 text-emerald-700 ring-emerald-200/80',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description:
      'Helps us understand how visitors use the site so we can improve journeys and content.',
    icon: <BarChart3 className="h-5 w-5" strokeWidth={1.9} />,
    tone: 'from-sky-50 to-blue-100/70 text-sky-700 ring-sky-200/80',
  },
  {
    key: 'performance',
    title: 'Performance',
    description:
      'Monitors site speed and reliability so we can keep the experience fast and stable.',
    icon: <Gauge className="h-5 w-5" strokeWidth={1.9} />,
    tone: 'from-amber-50 to-yellow-100/70 text-amber-700 ring-amber-200/80',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description:
      'Measures campaign effectiveness and helps show more relevant outreach content.',
    icon: <Target className="h-5 w-5" strokeWidth={1.9} />,
    tone: 'from-violet-50 to-fuchsia-100/70 text-violet-700 ring-violet-200/80',
  },
]

function readStoredConsent(): ConsentState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (parsed.v !== CONSENT_VERSION) return null
    return {
      essential: true,
      analytics: !!parsed.analytics,
      performance: !!parsed.performance,
      marketing: !!parsed.marketing,
    }
  } catch {
    return null
  }
}

function writeStoredConsent(prefs: ConsentState) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ts: Date.now(),
      v: CONSENT_VERSION,
      ...prefs,
    }),
  )
}

function ConsentToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70',
        checked
          ? 'border-emerald-500/40 bg-emerald-400/90 shadow-[0_8px_24px_rgba(22,163,74,0.22)]'
          : 'border-slate-300/80 bg-slate-300/90',
        disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-[1.02]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

function CategoryCard({
  title,
  description,
  icon,
  tone,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  icon: React.ReactNode
  tone: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-white/76 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)] backdrop-blur-xl transition duration-200 hover:border-white hover:bg-white/84 sm:rounded-[28px] sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ${tone} shadow-[0_10px_28px_rgba(148,163,184,0.12)] sm:h-11 sm:w-11`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-lg">
                  {title}
                </h3>
                {disabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                    Always on
                  </span>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <ConsentToggle
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                label={`${title} cookies`}
              />
            </div>
          </div>

          <p className="mt-2 max-w-[56ch] text-[14px] leading-6 text-slate-500 sm:text-[15px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

function CookiePreferences() {
  const [prefs, setPrefs] = useState<ConsentState>(DEFAULT_PREFS)
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const saved = readStoredConsent()
    if (saved) {
      setPrefs(saved)
      return
    }

    setMounted(true)
    requestAnimationFrame(() => setShowBanner(true))
  }, [])

  useEffect(() => {
    if (!mounted || !showModal) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false)
        setShowBanner(true)
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])',
      )

      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted, showModal])

  const dismiss = () => {
    setShowModal(false)
    setShowBanner(false)
    window.setTimeout(() => setMounted(false), 220)
  }

  const closeModal = () => {
    setShowModal(false)
    setShowBanner(true)
  }

  const openModal = () => {
    setShowBanner(false)
    setShowModal(true)
  }

  const savePrefs = (next: ConsentState) => {
    writeStoredConsent(next)
    setPrefs(next)
    dismiss()
  }

  const acceptAll = () =>
    savePrefs({
      essential: true,
      analytics: true,
      performance: true,
      marketing: true,
    })

  const rejectAll = () =>
    savePrefs({
      essential: true,
      analytics: false,
      performance: false,
      marketing: false,
    })

  const categories = useMemo(() => categoryMeta, [])

  if (!mounted) return null

  return (
    <>
      <style>{styles}</style>
      <div className="fixed inset-0 z-[99999]">
        {showModal ? (
          <>
            <div
              className={[
                'absolute inset-0 bg-slate-950/35 backdrop-blur-md transition-opacity duration-200',
                showModal ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              onClick={closeModal}
              aria-hidden="true"
            />

            <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dr-consent-title"
                aria-describedby="dr-consent-description"
                className={[
                  'relative w-full max-w-[720px] overflow-hidden rounded-[30px] border border-white/75',
                  'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] text-slate-900',
                  'shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl',
                  'transition-all duration-200',
                  showModal
                    ? 'translate-y-0 opacity-100 sm:scale-100'
                    : 'translate-y-4 opacity-0 sm:scale-[0.985]',
                ].join(' ')}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.07),transparent_72%)]" />

                <div className="relative flex max-h-[min(92dvh,760px)] min-h-0 flex-col gap-3 overflow-hidden p-3 sm:gap-5 sm:p-6">
                  <header className="rounded-[24px] border border-white/85 bg-white/78 p-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:rounded-[26px] sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80 shadow-[0_8px_22px_rgba(16,185,129,0.12)] sm:h-12 sm:w-12">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.95} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2
                          id="dr-consent-title"
                          className="text-[clamp(1.35rem,3vw,2.15rem)] font-semibold tracking-[-0.04em] text-slate-950"
                        >
                          Cookie Preferences
                        </h2>
                        <p
                          id="dr-consent-description"
                          className="mt-2 max-w-[42ch] text-[14px] leading-6 text-slate-500 sm:text-[15px] sm:leading-7"
                        >
                          Choose which cookies you allow. You can update this at any time.
                        </p>
                        <a
                          href="privacy.html#cookies"
                          className="mt-2.5 inline-flex text-[14px] font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800"
                        >
                          Review our Privacy Policy
                        </a>
                      </div>

                      <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={closeModal}
                        aria-label="Close cookie preferences"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/85 text-slate-400 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:bg-white hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 sm:h-10 sm:w-10"
                      >
                        <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <section aria-label="Cookie categories" className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2.5 sm:space-y-4">
                {categories.map((category) => {
                  const checked =
                    category.key === 'essential' ? true : prefs[category.key]

                  return (
                    <CategoryCard
                      key={category.key}
                      title={category.title}
                      description={category.description}
                      icon={category.icon}
                      tone={category.tone}
                      checked={checked}
                      disabled={category.key === 'essential'}
                      onChange={(next) =>
                        category.key !== 'essential' &&
                        setPrefs((current) => ({ ...current, [category.key]: next }))
                      }
                    />
                  )
                })}
              </section>

              <footer className="rounded-[24px] border border-white/80 bg-white/72 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:rounded-[26px] sm:p-4">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="min-h-11 flex-1 rounded-2xl border border-slate-300/80 bg-white/84 px-4 py-3 text-[15px] font-semibold text-slate-600 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 sm:min-h-12 sm:px-5"
                  >
                    Reject all
                  </button>
                  <button
                    type="button"
                    onClick={() => savePrefs(prefs)}
                    className="min-h-11 flex-1 rounded-2xl border border-slate-200/90 bg-slate-100/88 px-4 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 sm:min-h-12 sm:px-5"
                  >
                    Save preferences
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="min-h-11 flex-1 rounded-2xl bg-[#166534] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_14px_24px_rgba(22,101,52,0.22)] transition hover:bg-[#145a2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 sm:min-h-12 sm:px-5"
                  >
                    Accept all
                  </button>
                </div>
              </footer>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {showBanner ? (
          <div className="pointer-events-none flex min-h-full items-end justify-center p-4 sm:p-6">
            <section
              aria-label="Cookie consent"
              className={[
                'pointer-events-auto w-full max-w-[720px] rounded-[30px] border border-white/65',
                'bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.82))]',
                'p-5 text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-6',
                'transition-all duration-200',
                showBanner ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              ].join(' ')}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                    We value your privacy
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-[15px]">
                    We use cookies to improve your experience, analyse traffic, and personalise content.
                  </p>
                  <button
                    type="button"
                    onClick={openModal}
                    className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
                  >
                    Manage preferences
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-12 w-full rounded-2xl bg-[#166534] px-5 py-3 text-base font-semibold text-white shadow-[0_18px_32px_rgba(22,101,52,0.28)] transition hover:bg-[#145a2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
                >
                  Accept all cookies
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="min-h-12 w-full rounded-2xl border border-slate-300/80 bg-white/72 px-5 py-3 text-base font-semibold text-slate-600 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
                >
                  Reject non-essential
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="min-h-12 w-full rounded-2xl border border-slate-200/90 bg-slate-100/90 px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
                >
                  I&apos;ll decide later
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </>
  )
}

function mount() {
  if (document.getElementById('dr-consent-host')) return
  if (readStoredConsent()) return

  const host = document.createElement('div')
  host.id = 'dr-consent-host'
  document.body.appendChild(host)

  const shadowRoot = host.attachShadow({ mode: 'open' })
  const mountNode = document.createElement('div')
  shadowRoot.appendChild(mountNode)

  createRoot(mountNode).render(<CookiePreferences />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true })
} else {
  mount()
}
