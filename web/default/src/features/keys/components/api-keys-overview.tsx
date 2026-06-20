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
import { useQuery } from '@tanstack/react-query'
import { KeyRound, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'

import { getApiKeys, searchApiKeys } from '../api'
import { ERROR_MESSAGES } from '../constants'
import { type ApiKey } from '../types'
import { ApiKeysCardList } from './api-keys-card-list'
import { ApiKeysGroupsGrid } from './api-keys-groups-grid'
import { useApiKeys } from './api-keys-provider'

const PAGE_SIZE = 20
const MAX_KEYS = 30

export function ApiKeysOverview() {
  const { t } = useTranslation()
  const { setOpen, refreshTrigger } = useApiKeys()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 300)
  const shouldSearch = Boolean(search.trim())

  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['keys', 'cards', page, search, refreshTrigger],
    queryFn: async () => {
      const result = shouldSearch
        ? await searchApiKeys({ keyword: search, p: page, size: PAGE_SIZE })
        : await getApiKeys({ p: page, size: PAGE_SIZE })

      if (!result.success) {
        toast.error(
          result.message ||
            t(
              shouldSearch
                ? ERROR_MESSAGES.SEARCH_FAILED
                : ERROR_MESSAGES.LOAD_FAILED
            )
        )
        return { items: [] as ApiKey[], total: 0 }
      }
      return {
        items: (result.data?.items ?? []) as ApiKey[],
        total: result.data?.total ?? 0,
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const apiKeys = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className='flex flex-col gap-4'>
      {/* Hero management card */}
      <section className='bg-card relative overflow-hidden rounded-2xl border p-5 shadow-xs'>
        <div
          aria-hidden
          className='bg-dot-grid absolute inset-0 -z-10 opacity-40'
        />
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <span className='bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl'>
              <KeyRound className='size-5' aria-hidden='true' />
            </span>
            <div>
              <h2 className='text-base font-semibold'>
                {t('API Keys management')}
              </h2>
              <p className='text-muted-foreground text-xs'>
                {t('Created {{count}} / max {{max}}', {
                  count: total,
                  max: MAX_KEYS,
                })}
              </p>
            </div>
          </div>
          <Button onClick={() => setOpen('create')}>
            <Plus data-icon='inline-start' />
            {t('Create API Key')}
          </Button>
        </div>
      </section>

      {/* Available groups */}
      <ApiKeysGroupsGrid />

      {/* API key list */}
      <section className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <KeyRound className='text-muted-foreground size-4' />
            <div>
              <h2 className='text-base font-semibold'>{t('API Key list')}</h2>
              <p className='text-muted-foreground text-xs'>
                {t('Manage keys, group order, and budget')}
              </p>
            </div>
          </div>
          <div className='relative w-full sm:w-64'>
            <Search className='text-muted-foreground absolute start-2.5 top-1/2 size-4 -translate-y-1/2' />
            <Input
              placeholder={t('Filter by name...')}
              aria-label={t('Filter by name...')}
              value={searchInput}
              onChange={(e) => {
                setPage(1)
                setSearchInput(e.target.value)
              }}
              className='ps-8'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='grid gap-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-36 rounded-xl' />
            ))}
          </div>
        ) : apiKeys.length > 0 ? (
          <ApiKeysCardList apiKeys={apiKeys} />
        ) : (
          <Empty className='border-none py-10'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <KeyRound className='size-6' />
              </EmptyMedia>
              <EmptyTitle>{t('No API Keys Found')}</EmptyTitle>
              <EmptyDescription>
                {t(
                  'No API keys available. Create your first API key to get started.'
                )}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('Previous')}
            </Button>
            <span className='text-muted-foreground font-mono text-xs tabular-nums'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('Next')}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
