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
import { useState } from 'react'
import { toast } from 'sonner'

import type { CaptchaProvider } from '@/components/turnstile'
import { useStatus } from '@/hooks/use-status'

/**
 * Hook for managing bot-protection captcha verification.
 *
 * Supports multiple providers (Cloudflare Turnstile, Google reCAPTCHA). Only
 * one can be active at a time on the backend; this resolves the active provider
 * and its site key from the system status.
 */
export function useTurnstile() {
  const { status } = useStatus()
  const [captchaToken, setCaptchaToken] = useState('')

  const turnstileEnabled = !!(
    status?.turnstile_check && status?.turnstile_site_key
  )
  const recaptchaEnabled = !!(
    status?.recaptcha_check && status?.recaptcha_site_key
  )

  let captchaProvider: CaptchaProvider | null = null
  let captchaSiteKey = ''
  if (turnstileEnabled) {
    captchaProvider = 'turnstile'
    captchaSiteKey = status?.turnstile_site_key || ''
  } else if (recaptchaEnabled) {
    captchaProvider = 'recaptcha'
    captchaSiteKey = status?.recaptcha_site_key || ''
  }

  const isCaptchaEnabled = captchaProvider !== null

  /**
   * Validate if captcha is ready when required
   */
  const validateCaptcha = (): boolean => {
    if (isCaptchaEnabled && !captchaToken) {
      toast.info(
        i18next.t('Please wait a moment, human check is initializing...')
      )
      return false
    }
    return true
  }

  return {
    captchaProvider,
    isCaptchaEnabled,
    captchaSiteKey,
    captchaToken,
    setCaptchaToken,
    validateCaptcha,
  }
}
