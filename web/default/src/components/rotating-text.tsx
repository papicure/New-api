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
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface RotatingTextProps {
  /** Phrases cycled through, in order, looping forever. */
  words: string[]
  className?: string
  /** Per-character typing speed (ms). */
  typeSpeedMs?: number
  /** Per-character deleting speed (ms). */
  deleteSpeedMs?: number
  /** How long a fully-typed word is held before deleting (ms). */
  holdMs?: number
  /** Show a blinking caret after the text. */
  caret?: boolean
}

/**
 * A self-contained typewriter that types out a word, holds it, deletes it, and
 * advances to the next — looping forever. Used for the hero eyebrow badge and
 * the auth page accent word to mirror the reference site's animated copy.
 *
 * Honors `prefers-reduced-motion` by rendering the first word statically.
 */
export function RotatingText({
  words,
  className,
  typeSpeedMs = 90,
  deleteSpeedMs = 45,
  holdMs = 1600,
  caret = true,
}: RotatingTextProps) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>(
    'typing'
  )
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reducedMotion.current) setText(words[0] ?? '')
  }, [words])

  useEffect(() => {
    if (reducedMotion.current || words.length === 0) return

    const current = words[wordIndex % words.length]
    let timeoutId: number

    if (phase === 'typing') {
      if (text === current) {
        timeoutId = window.setTimeout(() => setPhase('holding'), holdMs)
      } else {
        timeoutId = window.setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeSpeedMs
        )
      }
    } else if (phase === 'holding') {
      timeoutId = window.setTimeout(() => setPhase('deleting'), holdMs)
    } else {
      if (text === '') {
        setWordIndex((i) => (i + 1) % words.length)
        setPhase('typing')
        return
      }
      timeoutId = window.setTimeout(
        () => setText(current.slice(0, text.length - 1)),
        deleteSpeedMs
      )
    }

    return () => window.clearTimeout(timeoutId)
  }, [text, phase, wordIndex, words, typeSpeedMs, deleteSpeedMs, holdMs])

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span>{text || '\u00A0'}</span>
      {caret && !reducedMotion.current && (
        <span
          aria-hidden
          className='terminal-demo-blink ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.05em] bg-current'
        />
      )}
    </span>
  )
}
