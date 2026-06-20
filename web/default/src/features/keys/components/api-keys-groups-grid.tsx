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
import { Boxes, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserGroups } from '@/lib/api'

type UserGroup = { desc: string; ratio: number | string }

/**
 * Available groups grid for the API Keys page.
 *
 * Mirrors the reference console's "available groups" section: each group is a
 * card showing its name, billing rate badge, description, and an unlocked
 * check affordance. Data comes from the same `getUserGroups` endpoint the
 * dashboard overview uses.
 */
export function ApiKeysGroupsGrid() {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['keys', 'available-groups'],
    queryFn: async () => {
      const result = await getUserGroups()
      return result.success
        ? ((result.data ?? {}) as Record<string, UserGroup>)
        : {}
    },
    staleTime: 5 * 60 * 1000,
  })

  const entries = Object.entries(data ?? {})

  return (
    <section className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg'>
          <Boxes className='size-4' aria-hidden='true' />
        </span>
        <div>
          <h2 className='text-base font-semibold'>{t('Available groups')}</h2>
          <p className='text-muted-foreground text-xs'>
            {t('Groups define model access, billing source, and base rate')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className='h-28 rounded-xl' />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <CardStaggerContainer className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {entries.map(([name, group]) => (
            <CardStaggerItem
              key={name}
              className='bg-muted/20 hover:border-primary/40 relative flex flex-col gap-2 rounded-xl border p-4 transition-colors'
            >
              <span className='bg-success/10 text-success absolute end-3 top-3 flex size-6 items-center justify-center rounded-full'>
                <Check className='size-3.5' aria-hidden='true' />
              </span>
              <div className='flex items-center gap-2 pe-8'>
                <span className='truncate text-sm font-semibold'>{name}</span>
                <Badge variant='technical'>{group.ratio}x</Badge>
              </div>
              <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                {group.desc || t('No description')}
              </p>
            </CardStaggerItem>
          ))}
        </CardStaggerContainer>
      ) : (
        <div className='text-muted-foreground rounded-xl border border-dashed px-3 py-8 text-center text-sm'>
          {t('No groups available')}
        </div>
      )}
    </section>
  )
}
