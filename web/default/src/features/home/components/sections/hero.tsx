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
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowRight, Sparkle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  return (
    <section className='relative z-10 overflow-hidden px-6 pt-28 pb-20 md:pt-36 md:pb-28'>
      <div aria-hidden className='bg-dot-grid absolute inset-0 -z-10' />
      <div className='mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]'>
        <AnimateInView className='mx-auto flex max-w-xl flex-col items-start text-left lg:mx-0'>
          <div className='border-border/70 bg-card text-primary shadow-soft mb-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs font-semibold tracking-wide'>
            <Sparkle data-icon='inline-start' />
            <span>{t('Built for AI coding')}</span>
          </div>

          <h1 className='font-serif text-5xl leading-[0.98] font-semibold text-balance md:text-6xl'>
            {t('Build the future')}
            <br />
            <span className='text-primary'>{t('with natural language')}</span>
          </h1>

          <p className='text-muted-foreground mt-7 max-w-lg text-base leading-8 text-pretty'>
            {t(
              'Say goodbye to complex setup and connect instantly to top AI coding tools like Claude Code, Codex, and Gemini CLI. Whether you are a developer or an enterprise team, you can find the right solution here.'
            )}
          </p>

          <AnimateInView
            className='mt-9 flex flex-wrap items-center gap-3'
            delay={160}
          >
            <Button
              size='lg'
              className='h-11 rounded-lg px-5'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {props.isAuthenticated ? t('Go to Dashboard') : t('Start now')}
              <ArrowRight data-icon='inline-end' />
            </Button>
            <Button
              variant='outline'
              size='lg'
              className='h-11 rounded-lg px-5'
              render={<Link to='/pricing' />}
            >
              {t('Model pricing')}
            </Button>
            <Button
              variant='outline'
              size='lg'
              className='h-11 rounded-lg px-5'
              render={
                <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
              }
            >
              {t('Get Claude Code')}
              <ArrowDown data-icon='inline-end' />
            </Button>
          </AnimateInView>
        </AnimateInView>

        <AnimateInView
          animation='fade-left'
          delay={120}
          className='relative mx-auto w-full max-w-md'
        >
          <div
            aria-hidden
            className='terminal-demo-pulse bg-primary/10 absolute -inset-8 -z-10 rounded-full blur-3xl'
          />
          <div
            aria-hidden
            className='bg-dot-grid pointer-events-none absolute -inset-8 -z-10 opacity-50'
          />
          <HeroTerminalDemo />
        </AnimateInView>
      </div>
    </section>
  )
}
