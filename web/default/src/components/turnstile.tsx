/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => string | undefined
      remove: (widgetId: string) => void
    }
    grecaptcha?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => number | undefined
      reset: (widgetId?: number) => void
    }
  }
}

export type CaptchaProvider = 'turnstile' | 'recaptcha'

interface CaptchaProps {
  provider: CaptchaProvider
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  className?: string
}

const PROVIDER_SCRIPT: Record<
  CaptchaProvider,
  { id: string; src: string }
> = {
  turnstile: {
    id: 'cf-turnstile',
    src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  },
  recaptcha: {
    id: 'g-recaptcha',
    src: 'https://www.google.com/recaptcha/api.js?render=explicit',
  },
}

/**
 * Renders a bot-protection captcha widget for the configured provider.
 *
 * Callbacks are kept in refs so the render effect depends only on
 * [provider, siteKey]. Inline callbacks (e.g. onExpire={() => ...}) change on
 * every render; without the ref indirection the effect would re-run and render
 * the widget twice into the same element — which both Cloudflare Turnstile and
 * Google reCAPTCHA reject, leaving the widget blank inside dialogs.
 */
export function Captcha({
  provider,
  siteKey,
  onVerify,
  onExpire,
  className,
}: CaptchaProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useEffect(() => {
    let turnstileId: string | undefined
    let recaptchaId: number | undefined
    let cancelled = false

    const render = () => {
      if (cancelled || !ref.current) return
      if (provider === 'turnstile') {
        if (!window.turnstile || turnstileId !== undefined) return
        try {
          turnstileId = window.turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerifyRef.current(token),
            'error-callback': () => onExpireRef.current?.(),
            'expired-callback': () => onExpireRef.current?.(),
          })
        } catch {
          /* empty */
        }
      } else {
        if (!window.grecaptcha?.render || recaptchaId !== undefined) return
        try {
          recaptchaId = window.grecaptcha.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerifyRef.current(token),
            'error-callback': () => onExpireRef.current?.(),
            'expired-callback': () => onExpireRef.current?.(),
          })
        } catch {
          /* empty */
        }
      }
    }

    const ready = () =>
      provider === 'turnstile' ? !!window.turnstile : !!window.grecaptcha?.render

    if (ready()) {
      render()
    } else {
      const { id, src } = PROVIDER_SCRIPT[provider]
      const existing = document.getElementById(id) as HTMLScriptElement | null
      if (existing) {
        existing.addEventListener('load', render, { once: true })
        render()
      } else {
        const s = document.createElement('script')
        s.id = id
        s.src = src
        s.async = true
        s.defer = true
        s.onload = () => render()
        document.head.appendChild(s)
      }
    }

    return () => {
      cancelled = true
      if (turnstileId !== undefined && window.turnstile?.remove) {
        try {
          window.turnstile.remove(turnstileId)
        } catch {
          /* empty */
        }
      }
      if (recaptchaId !== undefined && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(recaptchaId)
        } catch {
          /* empty */
        }
      }
    }
  }, [provider, siteKey])

  return <div ref={ref} className={className} />
}
