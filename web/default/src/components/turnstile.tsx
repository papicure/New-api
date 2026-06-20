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
import i18next from 'i18next'
import { useEffect, useRef } from 'react'

import { getGeetestRegister } from '@/features/auth/api'

type GeetestValidateResult = {
  geetest_challenge: string
  geetest_validate: string
  geetest_seccode: string
}

type GeetestCaptchaObj = {
  appendTo: (selector: string | HTMLElement) => void
  getValidate: () => GeetestValidateResult | false
  reset: () => void
  onReady: (cb: () => void) => GeetestCaptchaObj
  onSuccess: (cb: () => void) => GeetestCaptchaObj
  onError: (cb: (err: unknown) => void) => GeetestCaptchaObj
}

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
    initGeetest?: (
      options: Record<string, unknown>,
      callback: (captchaObj: GeetestCaptchaObj) => void
    ) => void
  }
}

export type CaptchaProvider = 'turnstile' | 'recaptcha' | 'geetest'

interface CaptchaProps {
  provider: CaptchaProvider
  // Turnstile/reCAPTCHA site key, unused by Geetest (which fetches gt at runtime).
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  className?: string
}

const PROVIDER_SCRIPT: Record<CaptchaProvider, { id: string; src: string }> = {
  turnstile: {
    id: 'cf-turnstile',
    src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  },
  recaptcha: {
    id: 'g-recaptcha',
    src: 'https://www.google.com/recaptcha/api.js?render=explicit',
  },
  geetest: {
    id: 'geetest-gt',
    src: 'https://static.geetest.com/static/tools/gt.js',
  },
}

// Map the i18next interface language to Geetest's v3 language codes.
const GEETEST_LANG: Record<string, string> = {
  zh: 'zho',
  en: 'eng',
  fr: 'fra',
  ru: 'rus',
  ja: 'jpn',
  vi: 'vie',
}

function geetestLang(): string {
  const lang = (i18next.language || 'en').slice(0, 2)
  return GEETEST_LANG[lang] ?? 'eng'
}

function loadScript(id: string, src: string, onload: () => void) {
  const existing = document.getElementById(id) as HTMLScriptElement | null
  if (existing) {
    existing.addEventListener('load', onload, { once: true })
    onload()
    return
  }
  const s = document.createElement('script')
  s.id = id
  s.src = src
  s.async = true
  s.defer = true
  s.onload = onload
  document.head.appendChild(s)
}

/**
 * Renders a bot-protection captcha widget for the configured provider.
 *
 * Cloudflare Turnstile and Google reCAPTCHA render a passive widget that emits
 * a token via the onVerify callback. Geetest v3 is different: it requires a
 * server-side challenge registration first, then renders a slider button (bind
 * mode) that, once solved, packs its three result fields into a single JSON
 * string passed through the same onVerify channel — so consumers stay unchanged.
 *
 * Callbacks are kept in refs so the render effect depends only on
 * [provider, siteKey]. Inline callbacks change on every render; without the ref
 * indirection the effect would re-run and render the widget twice into the same
 * element, which all three providers reject (leaving the widget blank).
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
    let geetestObj: GeetestCaptchaObj | undefined
    let cancelled = false

    if (provider === 'geetest') {
      const initGeetest = async () => {
        const data = await getGeetestRegister()
        if (cancelled || !ref.current) return
        if (!data || data.success !== 1) {
          // Registration failed / Geetest unreachable: block (no offline mode).
          onExpireRef.current?.()
          return
        }
        loadScript(PROVIDER_SCRIPT.geetest.id, PROVIDER_SCRIPT.geetest.src, () => {
          if (cancelled || !ref.current || !window.initGeetest) return
          window.initGeetest(
            {
              gt: data.gt,
              challenge: data.challenge,
              offline: false,
              new_captcha: data.new_captcha === 1,
              product: 'bind',
              lang: geetestLang(),
              https: true,
              width: '100%',
            },
            (captchaObj) => {
              if (cancelled || !ref.current) return
              geetestObj = captchaObj
              captchaObj
                .onReady(() => {
                  if (cancelled || !ref.current) return
                  captchaObj.appendTo(ref.current)
                })
                .onSuccess(() => {
                  const result = captchaObj.getValidate()
                  if (!result) {
                    onExpireRef.current?.()
                    return
                  }
                  onVerifyRef.current(JSON.stringify(result))
                })
                .onError(() => onExpireRef.current?.())
            }
          )
        })
      }
      void initGeetest()

      return () => {
        cancelled = true
        if (geetestObj?.reset) {
          try {
            geetestObj.reset()
          } catch {
            /* empty */
          }
        }
      }
    }

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
      loadScript(id, src, render)
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
