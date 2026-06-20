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
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

type SegmentTone =
  | 'prompt'
  | 'command'
  | 'keyword'
  | 'function'
  | 'muted'
  | 'success'
  | 'info'

type TerminalSegment = {
  text: string
  tone?: SegmentTone
}

type TerminalLine = {
  indent?: number
  segments: TerminalSegment[]
}

interface HeroTerminalDemoProps {
  className?: string
  variant?: 'home' | 'auth'
}

const TYPE_SPEED_MS = 34

export function HeroTerminalDemo(props: HeroTerminalDemoProps) {
  const { t } = useTranslation()
  const variant = props.variant ?? 'home'
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleChars, setVisibleChars] = useState(0)

  const lines = useMemo<TerminalLine[]>(() => {
    if (variant === 'auth') {
      return [
        line([segment('$ ', 'prompt'), segment('claude --version', 'command')]),
        line([segment('Claude Code v1.0.87', 'muted')]),
        line([
          segment('$ ', 'prompt'),
          segment('claude ', 'command'),
          segment(`"${t('Write a quicksort algorithm')}"`, 'info'),
        ]),
        line([
          segment('[ok] ', 'success'),
          segment(t('Connected to Claude Code, generating now...'), 'muted'),
        ]),
        line([segment('$ ', 'prompt'), segment(t('session ready'), 'command')]),
      ]
    }

    return [
      line([segment('> ', 'muted'), segment(t('Think harder...'), 'command')]),
      line([]),
      line([segment('while', 'keyword'), segment('(curious) {', 'muted')]),
      line(
        [segment('question_everything', 'function'), segment('();', 'muted')],
        2
      ),
      line([segment('dig_deeper', 'function'), segment('();', 'muted')], 2),
      line(
        [
          segment('connect_dots', 'function'),
          segment('(unexpected);', 'muted'),
        ],
        2
      ),
      line([segment('}', 'muted')]),
      line([segment('if', 'keyword'), segment('(stuck) {', 'muted')]),
      line([segment('keep_thinking', 'function'), segment('();', 'muted')], 2),
      line([segment('}', 'muted')]),
    ]
  }, [t, variant])

  const totalChars = useMemo(() => {
    return lines.reduce((count, item, index) => {
      const lineLength = getLineLength(item)
      return count + lineLength + (index === lines.length - 1 ? 0 : 1)
    }, 0)
  }, [lines])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) {
      setVisibleChars(totalChars)
      return
    }

    let intervalId: number | undefined
    let hasStarted = false
    const startTyping = () => {
      if (hasStarted) return
      hasStarted = true
      window.clearInterval(intervalId)
      setVisibleChars(0)
      intervalId = window.setInterval(() => {
        setVisibleChars((current) => {
          if (current >= totalChars) {
            window.clearInterval(intervalId)
            return totalChars
          }
          return current + 1
        })
      }, TYPE_SPEED_MS)
    }

    const rect = element.getBoundingClientRect()
    const isAlreadyVisible =
      rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1

    if (isAlreadyVisible) {
      window.requestAnimationFrame(startTyping)
      return () => window.clearInterval(intervalId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTyping()
          observer.unobserve(element)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.18 }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      window.clearInterval(intervalId)
    }
  }, [totalChars])

  return (
    <div
      ref={containerRef}
      className={cn('mx-auto w-full max-w-md', props.className)}
    >
      <div className='terminal-panel text-primary-foreground border-border/60 shadow-soft-lg relative overflow-hidden rounded-xl border'>
        <div
          aria-hidden
          className='bg-scanlines pointer-events-none absolute inset-0'
        />
        <div className='border-border/20 bg-background/10 relative flex h-10 items-center gap-2 border-b px-4'>
          <span className='bg-destructive size-3 rounded-full' />
          <span className='bg-warning size-3 rounded-full' />
          <span className='bg-success size-3 rounded-full' />
          <span className='text-primary-foreground/45 ml-auto font-mono text-[10px] font-semibold tracking-wide'>
            {t('Terminal')}
          </span>
        </div>

        <div className='relative p-5 font-mono text-[12px] leading-7 sm:p-6'>
          {variant === 'home' && (
            <div className='border-primary/40 bg-background/5 text-primary mb-5 inline-flex rounded-md border px-3 py-1 text-xs'>
              // {t('Welcome to Claude Code')}
            </div>
          )}
          <div className='min-h-[11rem]'>
            {lines.map((item, index) => (
              <CodeLine
                key={`${variant}-${index}`}
                line={item}
                cursor={visibleChars < totalChars}
                lineIndex={index}
                visibleChars={visibleChars}
                previousChars={getPreviousChars(lines, index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function line(segments: TerminalSegment[], indent = 0): TerminalLine {
  return { indent, segments }
}

function segment(text: string, tone: SegmentTone): TerminalSegment {
  return { text, tone }
}

function getLineLength(line: TerminalLine): number {
  return (
    (line.indent ?? 0) +
    line.segments.reduce((sum, item) => sum + item.text.length, 0)
  )
}

function getPreviousChars(lines: TerminalLine[], index: number): number {
  let count = 0
  for (let i = 0; i < index; i++) {
    count += getLineLength(lines[i]) + 1
  }
  return count
}

function CodeLine(props: {
  line: TerminalLine
  cursor: boolean
  lineIndex: number
  visibleChars: number
  previousChars: number
}) {
  const lineLength = getLineLength(props.line)
  const visibleOnLine = Math.max(
    0,
    Math.min(lineLength, props.visibleChars - props.previousChars)
  )
  const shouldShowLine = props.visibleChars >= props.previousChars
  const hasCursor =
    props.cursor &&
    props.visibleChars >= props.previousChars &&
    props.visibleChars <= props.previousChars + lineLength

  if (!shouldShowLine) {
    return <div className='min-h-[1.75rem]' />
  }

  let remaining = visibleOnLine
  const indentWidth = props.line.indent ?? 0
  if (indentWidth > 0) {
    remaining = Math.max(0, remaining - indentWidth)
  }

  return (
    <div className='min-h-[1.75rem] break-words whitespace-pre-wrap'>
      {indentWidth > 0 && visibleOnLine > 0 ? (
        <span
          aria-hidden
          className='inline-block'
          style={{ width: `${indentWidth}ch` }}
        />
      ) : null}
      {props.line.segments.map((item, index) => {
        const visibleText = item.text.slice(0, Math.max(0, remaining))
        remaining -= item.text.length
        return (
          <Tone key={`${props.lineIndex}-${index}`} tone={item.tone}>
            {visibleText}
          </Tone>
        )
      })}
      {hasCursor ? <Cursor /> : null}
    </div>
  )
}

function Tone(props: { children: ReactNode; tone?: SegmentTone }) {
  let className = 'text-primary-foreground/55'
  if (props.tone === 'prompt') {
    className = 'text-success'
  } else if (props.tone === 'command') {
    className = 'text-primary-foreground font-semibold'
  } else if (props.tone === 'keyword') {
    className = 'text-primary font-semibold'
  } else if (props.tone === 'function') {
    className = 'text-info'
  } else if (props.tone === 'success') {
    className = 'text-success'
  } else if (props.tone === 'info') {
    className = 'text-primary'
  }

  return <span className={className}>{props.children}</span>
}

function Cursor() {
  return (
    <span
      aria-hidden
      className='terminal-demo-blink bg-primary-foreground/70 ml-0.5 inline-block h-4 w-2 translate-y-0.5'
    />
  )
}
