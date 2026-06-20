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
import { toast } from 'sonner'

// ============================================================================
// Toast Deduplication
// ============================================================================
//
// The global axios response interceptor shows a toast for any business
// failure (success === false), while many components ALSO call toast.* in
// their own else/catch branches for the same response. The result is the
// same message popping up multiple times at once.
//
// Rather than editing 100+ call sites, we patch sonner's singleton toast
// methods in place. Because `import { toast } from 'sonner'` returns the same
// object reference everywhere, mutating its methods here affects every caller.
//
// Strategy: derive a stable `id` from the toast type + message. sonner merges
// toasts that share an id (updating the existing one instead of stacking), so
// identical messages fired within the same visible window collapse into one.
// Distinct messages are unaffected. After a toast is dismissed, the same
// message can appear again later as expected.

type ToastVariant = 'error' | 'success' | 'info' | 'warning' | 'message'

// Minimal shape of the options object sonner accepts as the 2nd argument.
type ToastOptions = { id?: string | number } & Record<string, unknown>

// FNV-1a hash → short, stable key for a string.
function hashMessage(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

function buildDedupeId(variant: ToastVariant, message: unknown): string | null {
  // Only dedupe plain string/number messages. React-node toasts (e.g. custom
  // JSX, promise toasts) get unique behaviour and are left untouched.
  if (typeof message !== 'string' && typeof message !== 'number') return null
  return `dedupe:${variant}:${hashMessage(String(message))}`
}

type ToastFn = (message: unknown, options?: ToastOptions) => unknown

function wrap(original: ToastFn, variant: ToastVariant): ToastFn {
  return (message: unknown, options?: ToastOptions) => {
    // Respect explicit ids supplied by the caller.
    if (options && options.id != null) {
      return original(message, options)
    }

    const id = buildDedupeId(variant, message)
    if (id == null) {
      return original(message, options)
    }

    return original(message, { ...options, id })
  }
}

let installed = false

/**
 * Patch sonner's toast methods so identical concurrent messages collapse into
 * a single toast. Idempotent — safe to call more than once.
 */
export function installToastDedupe(): void {
  if (installed) return
  installed = true

  const t = toast as unknown as Record<ToastVariant, ToastFn>
  t.error = wrap(t.error, 'error')
  t.success = wrap(t.success, 'success')
  t.info = wrap(t.info, 'info')
  t.warning = wrap(t.warning, 'warning')
  t.message = wrap(t.message, 'message')
}
