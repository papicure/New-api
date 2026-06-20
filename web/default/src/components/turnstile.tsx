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
  }
}

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  className?: string
}

export function Turnstile({
  siteKey,
  onVerify,
  onExpire,
  className,
}: TurnstileProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Keep latest callbacks in refs so the render effect can depend only on
  // siteKey. Otherwise inline callbacks (e.g. onExpire={() => ...}) change on
  // every render, re-running the effect and calling turnstile.render() again
  // on the same element — which Cloudflare rejects, leaving the widget blank
  // (this is why the widget failed to appear inside dialogs).
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return
      // Avoid double-render into the same container.
      if (widgetId !== undefined) return
      try {
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerifyRef.current(token),
          'error-callback': () => onExpireRef.current?.(),
          'expired-callback': () => onExpireRef.current?.(),
        })
      } catch {
        /* empty */
      }
    }

    if (window.turnstile) {
      render()
    } else {
      const scriptId = 'cf-turnstile'
      const existing = document.getElementById(
        scriptId
      ) as HTMLScriptElement | null
      if (existing) {
        // Script tag present but maybe not loaded yet; attach a load hook and
        // also try immediately in case it is already available.
        existing.addEventListener('load', render, { once: true })
        render()
      } else {
        const s = document.createElement('script')
        s.id = scriptId
        s.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true
        s.defer = true
        s.onload = () => render()
        document.head.appendChild(s)
      }
    }

    return () => {
      cancelled = true
      if (widgetId !== undefined && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          /* empty */
        }
      }
    }
  }, [siteKey])

  return <div ref={ref} className={className} />
}
