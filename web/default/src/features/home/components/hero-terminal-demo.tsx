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
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface HeroTerminalDemoProps {
  className?: string
  variant?: 'home' | 'auth'
}

export function HeroTerminalDemo(props: HeroTerminalDemoProps) {
  const { t } = useTranslation()
  const variant = props.variant ?? 'home'
  const lines =
    variant === 'auth'
      ? [
          <CodeLine key='version'>
            <Prompt>$</Prompt> <Command>claude --version</Command>
          </CodeLine>,
          <CodeLine key='version-output'>
            <Muted>Claude Code v1.0.87</Muted>
          </CodeLine>,
          <CodeLine key='ask'>
            <Prompt>$</Prompt>{' '}
            <Command>
              claude &quot;{t('Write a quicksort algorithm')}&quot;
            </Command>
          </CodeLine>,
          <CodeLine key='connected'>
            <Success>✓</Success>{' '}
            <Muted>
              {t('Connected to Claude Code, generating now...')}
            </Muted>
          </CodeLine>,
          <CodeLine key='cursor'>
            <Prompt>$</Prompt> <Cursor />
          </CodeLine>,
        ]
      : [
          <CodeLine key='think'>
            <Muted>&gt;</Muted> <Command>Think harder...</Command> <Cursor />
          </CodeLine>,
          <CodeLine key='space'>
            <Muted> </Muted>
          </CodeLine>,
          <CodeLine key='while'>
            <Keyword>while</Keyword>
            <Muted>(curious) {'{'}</Muted>
          </CodeLine>,
          <CodeLine key='question' indent={2}>
            <FunctionName>question_everything</FunctionName>
            <Muted>();</Muted>
          </CodeLine>,
          <CodeLine key='dig' indent={2}>
            <FunctionName>dig_deeper</FunctionName>
            <Muted>();</Muted>
          </CodeLine>,
          <CodeLine key='connect' indent={2}>
            <FunctionName>connect_dots</FunctionName>
            <Muted>(unexpected);</Muted>
          </CodeLine>,
          <CodeLine key='while-close'>
            <Muted>{'}'}</Muted>
          </CodeLine>,
          <CodeLine key='if'>
            <Keyword>if</Keyword>
            <Muted>(stuck) {'{'}</Muted>
          </CodeLine>,
          <CodeLine key='keep' indent={2}>
            <FunctionName>keep_thinking</FunctionName>
            <Muted>();</Muted>
          </CodeLine>,
          <CodeLine key='if-close'>
            <Muted>{'}'}</Muted>
          </CodeLine>,
        ]

  return (
    <div className={cn('mx-auto w-full max-w-md', props.className)}>
      <div className='bg-neutral-foreground text-primary-foreground border-border/60 shadow-soft-lg overflow-hidden rounded-xl border'>
        <div className='border-border/20 bg-background/10 flex h-10 items-center gap-2 border-b px-4'>
          <span className='bg-destructive size-3 rounded-full' />
          <span className='bg-warning size-3 rounded-full' />
          <span className='bg-success size-3 rounded-full' />
          <span className='text-primary-foreground/40 ml-auto font-mono text-[10px] font-semibold tracking-wide'>
            Terminal
          </span>
        </div>

        <div className='p-5 font-mono text-[12px] leading-7 sm:p-6'>
          {variant === 'home' && (
            <div className='border-primary/40 bg-background/5 text-primary mb-5 inline-flex rounded-md border px-3 py-1 text-xs'>
              * {t('Welcome to Claude Code')}
            </div>
          )}
          <div className='min-h-[11rem]'>{lines}</div>
        </div>
      </div>
    </div>
  )
}

function CodeLine(props: { children: ReactNode; indent?: number }) {
  return (
    <div className='break-words whitespace-pre-wrap'>
      {props.indent ? (
        <span
          aria-hidden
          className='inline-block'
          style={{ width: `${props.indent}ch` }}
        />
      ) : null}
      {props.children}
    </div>
  )
}

function Prompt(props: { children: ReactNode }) {
  return <span className='text-success'>{props.children}</span>
}

function Command(props: { children: ReactNode }) {
  return (
    <span className='text-primary-foreground font-semibold'>
      {props.children}
    </span>
  )
}

function Keyword(props: { children: ReactNode }) {
  return <span className='text-primary font-semibold'>{props.children}</span>
}

function FunctionName(props: { children: ReactNode }) {
  return <span className='text-info'>{props.children}</span>
}

function Success(props: { children: ReactNode }) {
  return <span className='text-success'>{props.children}</span>
}

function Muted(props: { children: ReactNode }) {
  return <span className='text-primary-foreground/55'>{props.children}</span>
}

function Cursor() {
  return (
    <span
      aria-hidden
      className='bg-primary-foreground/70 inline-block h-4 w-2 translate-y-0.5 animate-pulse'
    />
  )
}
