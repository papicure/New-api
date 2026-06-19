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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'
import { HeroTerminalDemo } from '@/features/home/components/hero-terminal-demo'

type AuthMode = 'sign-in' | 'sign-up'

type AuthLayoutProps = {
  children: React.ReactNode
  mode?: AuthMode
  showTabs?: boolean
  title?: string
  subtitle?: string
}

export function AuthLayout(props: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()
  const mode = props.mode ?? 'sign-in'
  const title = props.title ?? t('Welcome back')
  const subtitle =
    props.subtitle ??
    (mode === 'sign-up' ? t('Email registration') : t('Password login'))
  const rightAccent =
    mode === 'sign-up' ? t('experience') : t('coding journey')

  return (
    <div className='bg-background grid min-h-svh lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
      <main className='flex min-h-svh items-center justify-center px-6 py-10'>
        <div className='w-full max-w-[23rem]'>
          <Link to='/' className='mb-10 flex items-center gap-2.5'>
            <div className='relative size-8'>
              {loading ? (
                <Skeleton className='absolute inset-0 rounded-lg' />
              ) : (
                <img
                  src={logo}
                  alt={t('Logo')}
                  className='size-8 rounded-lg object-cover'
                />
              )}
            </div>
            {loading ? (
              <Skeleton className='h-5 w-24' />
            ) : (
              <span className='text-primary text-lg font-semibold'>
                {systemName}
              </span>
            )}
          </Link>

          <div className='mb-6'>
            <h1 className='font-serif text-3xl leading-tight font-semibold'>
              {title}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm'>{subtitle}</p>
          </div>

          {props.showTabs && (
            <div className='bg-muted mb-7 grid h-10 grid-cols-2 rounded-lg p-1'>
              <Link
                to='/sign-in'
                className={cn(
                  'flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  mode === 'sign-in'
                    ? 'bg-background text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('Sign in')}
              </Link>
              <Link
                to='/sign-up'
                className={cn(
                  'flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  mode === 'sign-up'
                    ? 'bg-background text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('Sign up')}
              </Link>
            </div>
          )}

          {props.children}
        </div>
      </main>

      <aside className='from-card to-background relative hidden min-h-svh items-center justify-center overflow-hidden border-l border-border/60 bg-gradient-to-br px-10 lg:flex'>
        <div
          aria-hidden
          className='bg-primary/10 absolute inset-y-20 right-10 left-24 rounded-full blur-3xl'
        />
        <div className='relative w-full max-w-lg'>
          <h2 className='font-serif text-4xl leading-tight font-semibold text-balance'>
            {t('Start your AI')}
            <span className='text-primary'> {rightAccent}</span>
          </h2>
          <p className='text-muted-foreground mt-4 max-w-md text-sm leading-7'>
            {t(
              'Provides access to top AI coding assistants including Claude Code, Codex, and Gemini CLI.'
            )}
          </p>
          <HeroTerminalDemo variant='auth' className='mt-9' />
          <div className='mt-7 flex flex-wrap justify-center gap-3'>
            {['Claude Code', 'Codex', 'Gemini CLI'].map((label) => (
              <span
                key={label}
                className='bg-card text-muted-foreground rounded-full border border-border/60 px-4 py-2 text-xs shadow-soft'
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
