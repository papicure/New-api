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
import { Globe, Zap } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { useApiInfo } from '@/features/dashboard/hooks/use-status-data'
import {
  getDefaultPingStatus,
  getLatencyColorClass,
  testUrlLatency,
} from '@/features/dashboard/lib/api-info'
import type { ApiInfoItem, PingStatusMap } from '@/features/dashboard/types'
import { getBgColorClass } from '@/lib/colors'
import { cn } from '@/lib/utils'

/**
 * Compact API endpoint card for the API Keys page.
 *
 * Reuses the admin-editable `api_info` list (same source as the dashboard
 * overview panel) but renders a denser row: status dot, route, url, latency
 * badge, and just two actions — test latency and copy — to save space.
 *
 * Renders nothing when no endpoints are configured, so the section never
 * leaves an empty gap on the page.
 */
export function ApiKeysEndpointsCard() {
  const { t } = useTranslation()
  const { items: list, loading } = useApiInfo()
  const [pingStatus, setPingStatus] = useState<PingStatusMap>({})

  const handleTest = useCallback(async (url: string) => {
    setPingStatus((prev) => ({
      ...prev,
      [url]: { latency: null, testing: true, error: false },
    }))
    const result = await testUrlLatency(url)
    setPingStatus((prev) => ({ ...prev, [url]: result }))
  }, [])

  if (loading || !list.length) return null

  return (
    <section className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg'>
          <Globe className='size-4' aria-hidden='true' />
        </span>
        <div>
          <h2 className='text-base font-semibold'>{t('API endpoint')}</h2>
          <p className='text-muted-foreground text-xs'>
            {t('Configured routes and latency checks')}
          </p>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {list.map((item: ApiInfoItem) => {
          const status = pingStatus[item.url] || getDefaultPingStatus()
          return (
            <div
              key={item.url}
              className='bg-muted/20 hover:border-primary/40 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors sm:gap-3'
            >
              <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                <span
                  className={cn(
                    'inline-block size-2 shrink-0 rounded-full',
                    getBgColorClass(item.color)
                  )}
                />
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-mono text-sm font-semibold'>
                      {item.route}
                    </span>
                    <span className='text-muted-foreground/60 hidden truncate text-xs md:inline'>
                      {item.description}
                    </span>
                  </div>
                  <span className='text-muted-foreground/40 truncate font-mono text-xs'>
                    {item.url}
                  </span>
                </div>
              </div>

              <div className='flex shrink-0 items-center gap-1.5'>
                {status.testing && (
                  <StatusBadge
                    label={t('Testing...')}
                    variant='warning'
                    className='animate-pulse'
                    copyable={false}
                  />
                )}
                {status.latency !== null && !status.testing && (
                  <StatusBadge
                    variant='success'
                    label={`${status.latency}${t('ms')}`}
                    className={cn(
                      'font-mono font-medium',
                      getLatencyColorClass(status.latency)
                    )}
                    copyable={false}
                  />
                )}
                {status.error && (
                  <StatusBadge
                    label={t('N/A')}
                    variant='neutral'
                    copyable={false}
                  />
                )}

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleTest(item.url)}
                  disabled={status.testing}
                  className='size-7 p-0'
                  title={t('Test Latency')}
                >
                  <Zap
                    className={cn('size-3.5', status.testing && 'animate-pulse')}
                  />
                </Button>

                <CopyButton
                  value={item.url}
                  variant='ghost'
                  size='sm'
                  className='size-7 p-0'
                  iconClassName='size-3.5'
                  tooltip={t('Copy URL')}
                  aria-label={t('Copy URL')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
