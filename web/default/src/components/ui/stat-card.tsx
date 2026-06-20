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
import { type ReactNode, type ElementType } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardTone = 'default' | 'success' | 'warning' | 'destructive' | 'info'

type StatCardProps = {
  title: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: ElementType
  trend?: ReactNode
  tone?: StatCardTone
  className?: string
}

const toneClassNames: Record<StatCardTone, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-foreground dark:text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

export function StatCard(props: StatCardProps) {
  const tone = props.tone ?? 'default'
  const Icon = props.icon

  return (
    <Card className={cn('min-h-34', props.className)}>
      <CardContent className='flex h-full flex-col gap-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <p className='text-muted-foreground text-sm font-medium'>
              {props.title}
            </p>
            <p className='text-foreground font-serif text-3xl leading-none font-semibold tabular-nums'>
              {props.value}
            </p>
          </div>
          {Icon && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full',
                toneClassNames[tone]
              )}
            >
              <Icon className='size-5' aria-hidden='true' />
            </div>
          )}
        </div>

        {(props.description != null || props.trend != null) && (
          <div className='mt-auto flex items-center justify-between gap-3'>
            {props.description != null && (
              <p className='text-muted-foreground min-w-0 text-sm'>
                {props.description}
              </p>
            )}
            {props.trend != null && (
              <Badge variant={tone === 'default' ? 'secondary' : tone}>
                {props.trend}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
