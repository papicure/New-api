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
import { VChart } from '@visactor/react-vchart'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  KeyRound,
  LifeBuoy,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTheme } from '@/context/theme-provider'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { processChartData } from '@/features/dashboard/lib'
import { getApiKeys } from '@/features/keys/api'
import { useStatus } from '@/hooks/use-status'
import { useUserDisplay } from '@/hooks/use-user-display'
import { getUserAvatarFallback, getUserAvatarStyle } from '@/lib/avatar'
import { formatNumber, formatQuota } from '@/lib/format'
import { ROLE } from '@/lib/roles'
import { computeTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { VCHART_OPTION } from '@/lib/vchart'
import { useAuthStore } from '@/stores/auth-store'

import {
  useDashboardContentVisibility,
} from '../../hooks/use-status-data'
import { AnnouncementsPanel } from './announcements-panel'
import { ApiInfoPanel } from './api-info-panel'
import { FAQPanel } from './faq-panel'
import { PerformanceHealthPanel } from './performance-health-panel'
import { UptimePanel } from './uptime-panel'

const avatarFallbackClassName = 'font-semibold text-white'

let themeManagerPromise: Promise<
  (typeof import('@visactor/vchart'))['ThemeManager']
> | null = null

interface KpiCard {
  key: string
  label: string
  value: string
  meta?: string
  icon: LucideIcon
  accent: boolean
}

function getQuotaUsagePercent(remainQuota: number, usedQuota: number): number {
  const total = remainQuota + usedQuota
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, (usedQuota / total) * 100))
}

function KpiCards(props: {
  remainQuota: number
  todayUsage: number
  weekUsage: number
  apiKeyCount: number
}) {
  const { t } = useTranslation()

  const cards: KpiCard[] = [
    {
      key: 'balance',
      label: t('Account balance'),
      value: formatQuota(props.remainQuota),
      icon: Wallet,
      accent: false,
    },
    {
      key: 'today',
      label: t('Today usage'),
      value: formatQuota(props.todayUsage),
      icon: TrendingUp,
      accent: true,
    },
    {
      key: 'week',
      label: t('This week usage'),
      value: formatQuota(props.weekUsage),
      icon: BarChart3,
      accent: true,
    },
    {
      key: 'keys',
      label: t('API Keys'),
      value: formatNumber(props.apiKeyCount),
      icon: KeyRound,
      accent: false,
    },
  ]

  return (
    <CardStaggerContainer className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <CardStaggerItem
            key={card.key}
            className='bg-card rounded-2xl border p-5 shadow-xs'
          >
            <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
              <span className='bg-muted/60 flex size-7 items-center justify-center rounded-lg'>
                <Icon className='size-3.5' aria-hidden='true' />
              </span>
              {card.label}
            </div>
            <div
              className={cn(
                'mt-3 font-mono text-3xl font-semibold tracking-tight tabular-nums',
                card.accent && 'text-primary'
              )}
            >
              {card.value}
            </div>
          </CardStaggerItem>
        )
      })}
    </CardStaggerContainer>
  )
}

function UserInfoCard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const { displayName, secondaryText } = useUserDisplay(user)
  const avatarName = user?.username || displayName
  const avatarFallback = getUserAvatarFallback(avatarName)
  const avatarStyle = useMemo(
    () => getUserAvatarStyle(avatarName),
    [avatarName]
  )
  const isActive = (user?.status ?? 1) === 1
  const roleLabel = user?.role && user.role >= ROLE.ADMIN ? 'Admin' : 'User'

  return (
    <CardStaggerItem className='bg-card rounded-2xl border p-5 shadow-xs'>
      <h3 className='text-base font-semibold'>{t('User information')}</h3>

      <div className='mt-4 flex items-center gap-3'>
        <Avatar className='size-12'>
          <AvatarFallback
            className={avatarFallbackClassName}
            style={avatarStyle}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold'>{displayName}</div>
          {secondaryText && (
            <div className='text-muted-foreground truncate text-xs'>
              {secondaryText}
            </div>
          )}
          <div className='mt-1.5 flex items-center gap-1.5'>
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive ? t('Normal') : t('Disabled')}
            </Badge>
            <Badge variant='technical'>{t(roleLabel)}</Badge>
          </div>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm'>
        <div>
          <div className='text-muted-foreground text-xs'>{t('Group')}</div>
          <div className='mt-0.5 font-medium'>
            {user?.group || t('Default')}
          </div>
        </div>
        <div>
          <div className='text-muted-foreground text-xs'>{t('Requests')}</div>
          <div className='mt-0.5 font-mono font-medium tabular-nums'>
            {formatNumber(Number(user?.request_count ?? 0))}
          </div>
        </div>
      </div>
    </CardStaggerItem>
  )
}

function QuotaCard(props: { todayUsage: number; weekUsage: number }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const total = remainQuota + usedQuota
  const usedPercent = getQuotaUsagePercent(remainQuota, usedQuota)

  const rows = [
    {
      key: 'today',
      label: t('Today usage'),
      value: formatQuota(props.todayUsage),
      percent: total > 0 ? (props.todayUsage / total) * 100 : 0,
    },
    {
      key: 'week',
      label: t('This week usage'),
      value: formatQuota(props.weekUsage),
      percent: total > 0 ? (props.weekUsage / total) * 100 : 0,
    },
    {
      key: 'total',
      label: t('Quota used'),
      value: `${formatQuota(usedQuota)} / ${formatQuota(total)}`,
      percent: usedPercent,
    },
  ]

  return (
    <CardStaggerItem className='bg-card rounded-2xl border p-5 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold'>
            {t('Subscription and quota')}
          </h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            {t('Remaining quota')}: {formatQuota(remainQuota)}
          </p>
        </div>
        <Badge variant={remainQuota > 0 ? 'success' : 'destructive'}>
          {remainQuota > 0 ? t('Available') : t('Balance depleted')}
        </Badge>
      </div>

      <div className='mt-5 space-y-4'>
        {rows.map((row) => (
          <div key={row.key} className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>{row.label}</span>
              <span className='font-mono tabular-nums'>{row.value}</span>
            </div>
            <Progress value={Math.min(100, Math.max(0, row.percent))} />
          </div>
        ))}
      </div>
    </CardStaggerItem>
  )
}

function HelpBanner() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsLink = status?.docs_link as string | undefined

  return (
    <CardStaggerContainer>
      <CardStaggerItem className='bg-card rounded-2xl border p-5 shadow-xs'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <span className='bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl'>
              <LifeBuoy className='size-5' aria-hidden='true' />
            </span>
            <div className='min-w-0'>
              <h3 className='text-base font-semibold'>{t('Help & support')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'Run into onboarding, billing, or plan questions? Check the docs or revisit the console.'
                )}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {docsLink && (
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  window.open(docsLink, '_blank', 'noopener,noreferrer')
                }
              >
                {t('Documentation')}
              </Button>
            )}
            <Button size='sm' render={<Link to='/keys' />}>
              {t('Create API Key')}
              <ArrowRight data-icon='inline-end' />
            </Button>
          </div>
        </div>
      </CardStaggerItem>
    </CardStaggerContainer>
  )
}

function UsageTrendPanel() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const themeManagerRef = useRef<
    (typeof import('@visactor/vchart'))['ThemeManager'] | null
  >(null)
  const trendRange = useMemo(() => computeTimeRange(30), [])
  const trendQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'usage-trend',
      trendRange.start_timestamp,
      trendRange.end_timestamp,
    ],
    queryFn: async () =>
      getUserQuotaDates({
        start_timestamp: trendRange.start_timestamp,
        end_timestamp: trendRange.end_timestamp,
        default_time: 'day',
      }),
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    const updateTheme = async () => {
      setThemeReady(false)
      if (!themeManagerPromise) {
        themeManagerPromise = import('@visactor/vchart').then(
          (m) => m.ThemeManager
        )
      }

      const ThemeManager = await themeManagerPromise
      themeManagerRef.current = ThemeManager
      ThemeManager.setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
      setThemeReady(true)
    }

    updateTheme()
  }, [resolvedTheme])

  const chartData = useMemo(
    () => processChartData(trendQuery.data?.data ?? [], 'day', t, undefined),
    [trendQuery.data?.data, t]
  )

  const spec = useMemo(
    () => ({
      ...chartData.spec_area,
      title: { visible: false },
      legends: { visible: true, orient: 'bottom', selectMode: 'single' },
      area: { style: { fillOpacity: 0.16, curveType: 'monotone' } },
      line: { style: { lineWidth: 2, curveType: 'monotone' } },
      point: { visible: false },
      background: 'transparent',
    }),
    [chartData.spec_area]
  )

  return (
    <CardStaggerContainer>
      <CardStaggerItem className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <BarChart3 className='text-muted-foreground size-4' />
              <h3 className='text-base font-semibold'>
                {t('Spending trend')}
              </h3>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>
              {t('Daily spending over the last 30 days')}
            </p>
          </div>
          <Badge variant='technical'>{t('Last 30 days')}</Badge>
        </div>
        <div className='mt-3 h-[280px] sm:h-[340px]'>
          {themeReady && (
            <VChart
              key={`${resolvedTheme}-${trendQuery.isLoading ? 'loading' : 'ready'}-${trendQuery.data?.data?.length ?? 0}`}
              spec={{
                ...spec,
                theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              }}
              option={VCHART_OPTION}
            />
          )}
        </div>
      </CardStaggerItem>
    </CardStaggerContainer>
  )
}

export function OverviewDashboard() {
  const user = useAuthStore((state) => state.auth.user)
  const {
    apiInfo: showApiInfoPanel,
    announcements: showAnnouncementsPanel,
    faq: showFAQPanel,
    uptimeKuma: showUptimePanel,
  } = useDashboardContentVisibility()

  const remainQuota = Number(user?.quota ?? 0)
  const isAdmin = Boolean(user?.role && user.role >= ROLE.ADMIN)

  const todayRange = useMemo(() => computeTimeRange(1), [])
  const weekRange = useMemo(() => computeTimeRange(7), [])

  const apiKeysQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'api-keys-count'],
    queryFn: async () => {
      const result = await getApiKeys({ p: 1, size: 1 })
      return result.success ? (result.data?.total ?? 0) : 0
    },
    staleTime: 60 * 1000,
  })

  const todayQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'today-usage',
      todayRange.start_timestamp,
      todayRange.end_timestamp,
    ],
    queryFn: async () =>
      getUserQuotaDates({
        start_timestamp: todayRange.start_timestamp,
        end_timestamp: todayRange.end_timestamp,
        default_time: 'hour',
      }),
    staleTime: 60 * 1000,
  })

  const weekQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'week-usage',
      weekRange.start_timestamp,
      weekRange.end_timestamp,
    ],
    queryFn: async () =>
      getUserQuotaDates({
        start_timestamp: weekRange.start_timestamp,
        end_timestamp: weekRange.end_timestamp,
        default_time: 'day',
      }),
    staleTime: 60 * 1000,
  })

  const todayUsage = useMemo(
    () =>
      (todayQuery.data?.data ?? []).reduce(
        (total, item) => total + (Number(item.quota) || 0),
        0
      ),
    [todayQuery.data?.data]
  )
  const weekUsage = useMemo(
    () =>
      (weekQuery.data?.data ?? []).reduce(
        (total, item) => total + (Number(item.quota) || 0),
        0
      ),
    [weekQuery.data?.data]
  )

  const showLeftContentPanels =
    isAdmin || showApiInfoPanel || showAnnouncementsPanel || showFAQPanel
  const showContentPanels = showLeftContentPanels || showUptimePanel

  return (
    <div className='flex flex-col gap-4'>
      <KpiCards
        remainQuota={remainQuota}
        todayUsage={todayUsage}
        weekUsage={weekUsage}
        apiKeyCount={apiKeysQuery.data ?? 0}
      />

      <CardStaggerContainer className='grid gap-4 lg:grid-cols-2'>
        <UserInfoCard />
        <QuotaCard todayUsage={todayUsage} weekUsage={weekUsage} />
      </CardStaggerContainer>

      <HelpBanner />

      <UsageTrendPanel />

      {showContentPanels && (
        <CardStaggerContainer
          className={cn(
            'grid grid-cols-1 gap-4',
            showLeftContentPanels &&
              showUptimePanel &&
              'xl:grid-cols-[minmax(0,1fr)_22rem]'
          )}
        >
          {showLeftContentPanels && (
            <div
              className={cn(
                'grid min-w-0 grid-cols-1 gap-4',
                (showApiInfoPanel || showAnnouncementsPanel || showFAQPanel) &&
                  'lg:grid-cols-2'
              )}
            >
              {isAdmin && (
                <CardStaggerItem className='lg:col-span-2'>
                  <PerformanceHealthPanel />
                </CardStaggerItem>
              )}
              {showApiInfoPanel && (
                <CardStaggerItem>
                  <ApiInfoPanel />
                </CardStaggerItem>
              )}
              {showAnnouncementsPanel && (
                <CardStaggerItem>
                  <AnnouncementsPanel />
                </CardStaggerItem>
              )}
              {showFAQPanel && (
                <CardStaggerItem>
                  <FAQPanel />
                </CardStaggerItem>
              )}
            </div>
          )}
          {showUptimePanel && (
            <CardStaggerItem>
              <UptimePanel />
            </CardStaggerItem>
          )}
        </CardStaggerContainer>
      )}
    </div>
  )
}
