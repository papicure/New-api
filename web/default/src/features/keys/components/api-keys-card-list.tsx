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
import { type Row } from '@tanstack/react-table'
import { CalendarClock, CreditCard, Layers, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from '@/components/status-badge'
import { formatQuota, formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { API_KEY_STATUS, API_KEY_STATUSES } from '../constants'
import { type ApiKey } from '../types'
import { ApiKeyCell } from './api-keys-cells'
import { DataTableRowActions } from './data-table-row-actions'

function InfoItem(props: {
  icon: typeof Layers
  label: string
  children: React.ReactNode
}) {
  const Icon = props.icon
  return (
    <div className='flex min-w-0 items-start gap-2'>
      <Icon
        className='text-muted-foreground mt-0.5 size-3.5 shrink-0'
        aria-hidden='true'
      />
      <div className='min-w-0'>
        <div className='text-muted-foreground text-[11px] font-medium'>
          {props.label}
        </div>
        <div className='truncate text-xs font-medium'>{props.children}</div>
      </div>
    </div>
  )
}

function ApiKeyDetailCard({
  apiKey,
  selectable,
  selected,
  onSelectChange,
}: {
  apiKey: ApiKey
  selectable: boolean
  selected: boolean
  onSelectChange: (checked: boolean) => void
}) {
  const { t } = useTranslation()
  const statusConfig = API_KEY_STATUSES[apiKey.status]
  const isEnabled = apiKey.status === API_KEY_STATUS.ENABLED
  const total = apiKey.used_quota + apiKey.remain_quota
  // DataTableRowActions only reads `row.original`; provide a minimal adapter so
  // the card reuses the exact same actions menu as the table view.
  const rowAdapter = { original: apiKey } as Row<ApiKey>

  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-4 shadow-xs transition-colors',
        !isEnabled && 'opacity-70',
        selected && 'border-primary/50 ring-primary/20 ring-1'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2.5'>
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={(value) => onSelectChange(value === true)}
              aria-label={t('Select API key')}
              className='shrink-0'
            />
          )}
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              isEnabled ? 'bg-success' : 'bg-muted-foreground/40'
            )}
            aria-hidden='true'
          />
          <span className='truncate text-sm font-semibold'>{apiKey.name}</span>
          {statusConfig && (
            <StatusBadge
              label={t(statusConfig.label)}
              variant={statusConfig.variant}
              copyable={false}
            />
          )}
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <div className='hidden max-w-[14rem] sm:block'>
            <ApiKeyCell apiKey={apiKey} />
          </div>
          <DataTableRowActions row={rowAdapter} />
        </div>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4'>
        <InfoItem icon={Layers} label={t('Primary group')}>
          {apiKey.group || t('Default')}
        </InfoItem>
        <InfoItem icon={CreditCard} label={t('Budget')}>
          {apiKey.unlimited_quota ? (
            t('Unlimited')
          ) : (
            <span className='font-mono tabular-nums'>
              {formatQuota(apiKey.remain_quota)}
              <span className='text-muted-foreground'>
                {' / '}
                {formatQuota(total)}
              </span>
            </span>
          )}
        </InfoItem>
        <InfoItem icon={TrendingUp} label={t('Used')}>
          <span className='font-mono tabular-nums'>
            {formatQuota(apiKey.used_quota)}
          </span>
        </InfoItem>
        <InfoItem icon={CalendarClock} label={t('Expires')}>
          {apiKey.expired_time === -1
            ? t('Never')
            : formatTimestampToDate(apiKey.expired_time)}
        </InfoItem>
      </div>

      <div className='mt-3 flex flex-wrap items-center gap-1.5'>
        <Badge variant='technical'>{apiKey.group || t('Default')}</Badge>
        {apiKey.model_limits_enabled && apiKey.model_limits ? (
          <Badge variant='technical'>
            {t('{{count}} model(s)', {
              count: apiKey.model_limits.split(',').filter(Boolean).length,
            })}
          </Badge>
        ) : (
          <Badge variant='technical'>{t('All models')}</Badge>
        )}
        {apiKey.cross_group_retry && (
          <Badge variant='technical'>{t('Cross-group retry')}</Badge>
        )}
        {/* Mobile-only inline key (desktop shows it in the header row) */}
        <div className='w-full sm:hidden'>
          <ApiKeyCell apiKey={apiKey} />
        </div>
      </div>
    </div>
  )
}

export function ApiKeysCardList({
  apiKeys,
  selectable = false,
  selectedIds,
  onToggleSelect,
}: {
  apiKeys: ApiKey[]
  selectable?: boolean
  selectedIds?: Set<number>
  onToggleSelect?: (id: number, checked: boolean) => void
}) {
  return (
    <div className='grid gap-3'>
      {apiKeys.map((apiKey) => (
        <ApiKeyDetailCard
          key={apiKey.id}
          apiKey={apiKey}
          selectable={selectable}
          selected={selectedIds?.has(apiKey.id) ?? false}
          onSelectChange={(checked) => onToggleSelect?.(apiKey.id, checked)}
        />
      ))}
    </div>
  )
}
