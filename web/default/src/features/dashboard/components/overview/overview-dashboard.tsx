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
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  KeyRound,
  ListChecks,
  RadioTower,
  ShieldCheck,
  TerminalSquare,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CodeBlock } from '@/components/code-block'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useTheme } from '@/context/theme-provider'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { processChartData } from '@/features/dashboard/lib'
import { fetchTokenKey, getApiKeys } from '@/features/keys/api'
import type { ApiKey } from '@/features/keys/types'
import { getAllLogs, getUserLogs } from '@/features/usage-logs/api'
import { LOG_TYPE_ENUM } from '@/features/usage-logs/constants'
import type { UsageLog } from '@/features/usage-logs/data/schema'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { getUserGroups, getUserModels } from '@/lib/api'
import {
  formatLogQuota,
  formatNumber,
  formatQuota,
  formatTimestampToDate,
  formatUseTime,
} from '@/lib/format'
import { MOTION_TRANSITION } from '@/lib/motion'
import { ROLE } from '@/lib/roles'
import { computeTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { VCHART_OPTION } from '@/lib/vchart'
import { useAuthStore } from '@/stores/auth-store'

import {
  useApiInfo,
  useDashboardContentVisibility,
} from '../../hooks/use-status-data'
import { AnnouncementsPanel } from './announcements-panel'
import { ApiInfoPanel } from './api-info-panel'
import { FAQPanel } from './faq-panel'
import { PerformanceHealthPanel } from './performance-health-panel'
import { SummaryCards } from './summary-cards'
import { UptimePanel } from './uptime-panel'

const SETUP_GUIDE_VISIBILITY_STORAGE_KEY =
  'dashboard_overview_setup_guide_expanded'

const SETUP_GUIDE_CODE_PATTERN = [
  'const request = await client.responses.create({',
  "  model: 'gpt-4.1-mini',",
  "  input: 'Start routing traffic',",
  '})',
  '',
  'if (request.output_text) {',
  '  console.log(request.output_text)',
  '}',
].join('\n')

type DashboardActionPath =
  | '/keys'
  | '/wallet'
  | '/playground'
  | '/channels'
  | '/usage-logs'
  | '/pricing'

interface StartStep {
  title: string
  description: string
  to: DashboardActionPath
  icon: LucideIcon
  completed: boolean
}

interface QuickAction {
  title: string
  description: string
  to: DashboardActionPath
  icon: LucideIcon
  adminOnly?: boolean
}

interface RequestExample {
  endpoint: string
  model: string
  keyName: string
  keyId?: number
  displayKey: string
  ready: boolean
}

interface HeroSignal {
  label: string
  value: string
  icon: LucideIcon
}

type SetupTool = 'claude' | 'codex'
type SetupPlatform = 'windows' | 'unix'

type UserGroupMap = Record<string, { desc: string; ratio: number | string }>

let themeManagerPromise: Promise<
  (typeof import('@visactor/vchart'))['ThemeManager']
> | null = null

function getSavedSetupGuideExpanded(): boolean | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(SETUP_GUIDE_VISIBILITY_STORAGE_KEY)
  if (saved === 'expanded') return true
  if (saved === 'collapsed') return false
  return null
}

function saveSetupGuideExpanded(expanded: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    SETUP_GUIDE_VISIBILITY_STORAGE_KEY,
    expanded ? 'expanded' : 'collapsed'
  )
}

function getCurrentOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function normalizeEndpoint(sourceUrl?: string): string {
  const fallback = `${getCurrentOrigin()}/v1/chat/completions`
  const trimmed = sourceUrl?.trim()
  if (!trimmed) return fallback

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  if (withoutTrailingSlash.endsWith('/v1/chat/completions')) {
    return withoutTrailingSlash
  }
  if (withoutTrailingSlash.endsWith('/v1')) {
    return `${withoutTrailingSlash}/chat/completions`
  }
  return `${withoutTrailingSlash}/v1/chat/completions`
}

function getPreferredKey(keys: ApiKey[]): ApiKey | null {
  return keys.find((item) => item.status === 1) ?? keys[0] ?? null
}

function formatDisplayKey(key?: string): string {
  if (!key) return 'sk-...'
  if (key.length <= 14) return key
  return `${key.slice(0, 7)}...${key.slice(-4)}`
}

function buildCurlCommand(args: {
  endpoint: string
  apiKey: string
  model: string
}): string {
  return [
    `curl ${args.endpoint} \\`,
    '  -H "Content-Type: application/json" \\',
    `  -H "Authorization: Bearer ${args.apiKey}" \\`,
    `  -d '{"model":"${args.model}","messages":[{"role":"user","content":"Say hello in one sentence."}]}'`,
  ].join('\n')
}

function normalizeBaseUrl(sourceUrl?: string): string {
  const fallback = `${getCurrentOrigin()}/v1`
  const trimmed = sourceUrl?.trim()
  if (!trimmed) return fallback

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  if (withoutTrailingSlash.endsWith('/v1/chat/completions')) {
    return withoutTrailingSlash.replace(/\/chat\/completions$/, '')
  }
  if (withoutTrailingSlash.endsWith('/v1/messages')) {
    return withoutTrailingSlash.replace(/\/messages$/, '')
  }
  if (withoutTrailingSlash.endsWith('/v1')) return withoutTrailingSlash
  return `${withoutTrailingSlash}/v1`
}

function buildSetupCommand(args: {
  tool: SetupTool
  platform: SetupPlatform
  baseUrl: string
  apiKey: string
}): string {
  const quotedKey = args.apiKey || 'sk-...'
  if (args.tool === 'claude') {
    if (args.platform === 'windows') {
      return [
        `$env:ANTHROPIC_AUTH_TOKEN="${quotedKey}"`,
        `$env:ANTHROPIC_BASE_URL="${args.baseUrl}"`,
        'claude "Check this gateway connection"',
      ].join('\n')
    }

    return [
      `export ANTHROPIC_AUTH_TOKEN="${quotedKey}"`,
      `export ANTHROPIC_BASE_URL="${args.baseUrl}"`,
      'claude "Check this gateway connection"',
    ].join('\n')
  }

  if (args.platform === 'windows') {
    return [
      `$env:OPENAI_API_KEY="${quotedKey}"`,
      `$env:OPENAI_BASE_URL="${args.baseUrl}"`,
      'codex "Check this gateway connection"',
    ].join('\n')
  }

  return [
    `export OPENAI_API_KEY="${quotedKey}"`,
    `export OPENAI_BASE_URL="${args.baseUrl}"`,
    'codex "Check this gateway connection"',
  ].join('\n')
}

function getQuotaUsagePercent(remainQuota: number, usedQuota: number): number {
  const total = remainQuota + usedQuota
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, (usedQuota / total) * 100))
}

function getLogStatusVariant(log: UsageLog): 'success' | 'destructive' | 'info' {
  if (log.type === LOG_TYPE_ENUM.ERROR) return 'destructive'
  if (log.type === LOG_TYPE_ENUM.CONSUME) return 'success'
  return 'info'
}

function SetupGuideBackdrop(props: { compact?: boolean }) {
  return (
    <>
      <div
        className={cn(
          'from-card via-muted/35 to-background pointer-events-none absolute inset-0 bg-linear-to-br dark:opacity-65',
          props.compact
            ? '[mask-image:linear-gradient(90deg,black_0%,black_48%,transparent_74%)] opacity-55'
            : 'opacity-85'
        )}
        aria-hidden='true'
      />
      <div
        className='bg-dot-grid pointer-events-none absolute inset-0 opacity-30'
        aria-hidden='true'
      />
      <div
        className={cn(
          'text-foreground/5 dark:text-foreground/8 pointer-events-none absolute inset-y-0 right-0 hidden overflow-hidden font-mono sm:block',
          props.compact ? 'w-1/2 opacity-45' : 'w-[58%] opacity-75'
        )}
        aria-hidden='true'
      >
        <pre
          className={cn(
            'absolute right-3 [mask-image:linear-gradient(90deg,transparent_0%,black_30%,black_82%,transparent_100%)] text-right tracking-[0.38em] whitespace-pre',
            props.compact
              ? '-top-6 text-[9px] leading-4'
              : 'top-1 text-[11px] leading-5'
          )}
        >
          {SETUP_GUIDE_CODE_PATTERN}
        </pre>
      </div>
      <div
        className='from-background/35 to-background/70 dark:from-background/20 dark:to-background/80 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent'
        aria-hidden='true'
      />
    </>
  )
}

function StartStepItem(props: {
  step: StartStep
  index: number
  isLast: boolean
}) {
  const Icon = props.step.icon
  const StatusIcon = props.step.completed ? Check : Circle

  return (
    <li className='relative flex gap-3 pb-2.5 last:pb-0'>
      {!props.isLast && (
        <span
          className='bg-border absolute top-9 bottom-0 left-4 w-px'
          aria-hidden='true'
        />
      )}
      <span
        className={cn(
          'bg-background relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-xs',
          props.step.completed && 'border-success/30 bg-success/10'
        )}
      >
        <StatusIcon
          className={props.step.completed ? 'text-success size-4' : 'size-4'}
          aria-hidden='true'
        />
      </span>

      <Link
        to={props.step.to}
        className='bg-background/70 hover:bg-muted/50 focus-visible:ring-ring flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left shadow-xs transition-colors outline-none focus-visible:ring-2'
      >
        <span className='flex min-w-0 items-start gap-2.5'>
          <span className='bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg'>
            <Icon className='size-3.5' aria-hidden='true' />
          </span>
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='flex items-center gap-2 text-sm font-medium'>
              <span className='text-muted-foreground font-mono text-xs tabular-nums'>
                {props.index + 1}.
              </span>
              <span className='truncate'>{props.step.title}</span>
            </span>
            <span className='text-muted-foreground line-clamp-1 text-xs'>
              {props.step.description}
            </span>
          </span>
        </span>
        <ArrowRight
          className='text-muted-foreground size-4 shrink-0'
          aria-hidden='true'
        />
      </Link>
    </li>
  )
}

function RequestPreview(props: {
  example: RequestExample
  signals: HeroSignal[]
  baseUrl: string
}) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [isCopying, setIsCopying] = useState(false)
  const [setupTool, setSetupTool] = useState<SetupTool>('claude')
  const [setupPlatform, setSetupPlatform] = useState<SetupPlatform>('windows')
  const { copyToClipboard } = useCopyToClipboard({ notify: false })
  const previewCurl = buildCurlCommand({
    endpoint: props.example.endpoint,
    apiKey: props.example.displayKey,
    model: props.example.model,
  })
  const previewLines = previewCurl.split('\n')
  const setupCommand = buildSetupCommand({
    tool: setupTool,
    platform: setupPlatform,
    baseUrl: props.baseUrl,
    apiKey: props.example.displayKey,
  })
  const handleCopyRequest = async () => {
    if (!props.example.keyId || isCopying) return

    setIsCopying(true)
    try {
      const result = await fetchTokenKey(props.example.keyId)
      const key = result.success && result.data?.key ? result.data.key : ''
      if (!key) {
        toast.error(result.message || t('Failed to copy to clipboard'))
        return
      }

      const realCurl = buildCurlCommand({
        endpoint: props.example.endpoint,
        apiKey: `sk-${key}`,
        model: props.example.model,
      })
      const copied = await copyToClipboard(realCurl)
      if (copied) {
        toast.success(t('Copied to clipboard'))
      } else {
        toast.error(t('Failed to copy to clipboard'))
      }
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={MOTION_TRANSITION.slow}
      className='bg-background/75 relative overflow-hidden rounded-2xl border p-3 shadow-sm backdrop-blur'
    >
      {!shouldReduceMotion && (
        <motion.div
          className='via-foreground/30 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent'
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden='true'
        />
      )}

      <div className='flex items-center justify-between gap-3 border-b pb-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg'>
            <TerminalSquare className='size-4' aria-hidden='true' />
          </span>
          <div className='min-w-0'>
            <div className='truncate text-sm font-medium'>
              {t('First API request')}
            </div>
            <div className='text-muted-foreground truncate text-xs'>
              {props.example.ready
                ? props.example.keyName
                : t('Create an API key to unlock the real request')}
            </div>
          </div>
        </div>
        {props.example.ready ? (
          <Button
            variant='outline'
            size='sm'
            className='h-7 gap-1.5 px-2 text-xs'
            disabled={isCopying}
            onClick={handleCopyRequest}
            aria-label={t('Copy ready-to-run curl')}
          >
            <Copy data-icon='inline-start' />
            {isCopying ? t('Loading') : t('Copy')}
          </Button>
        ) : (
          <Button size='sm' variant='outline' render={<Link to='/keys' />}>
            {t('Create API Key')}
          </Button>
        )}
      </div>

      <div className='bg-foreground/[0.035] my-3 rounded-xl p-3 font-mono text-xs'>
        <div className='mb-2 flex items-center gap-1.5'>
          <span className='bg-destructive size-2 rounded-full' />
          <span className='bg-warning size-2 rounded-full' />
          <span className='bg-success size-2 rounded-full' />
        </div>
        <div className='flex flex-col gap-1 overflow-hidden'>
          {previewLines.map((line, index) => (
            <code
              key={`${line}-${index}`}
              className='text-muted-foreground truncate'
              title={line}
            >
              {line}
            </code>
          ))}
        </div>
      </div>

      <div className='my-3 rounded-xl border bg-muted/25 p-2'>
        <Tabs
          value={setupTool}
          onValueChange={(value) => setSetupTool(value as SetupTool)}
          className='gap-2'
        >
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <TabsList className='group-data-horizontal/tabs:h-7'>
              <TabsTrigger value='claude' className='text-xs'>
                {t('Claude Code')}
              </TabsTrigger>
              <TabsTrigger value='codex' className='text-xs'>
                {t('Codex')}
              </TabsTrigger>
            </TabsList>
            <div className='bg-muted inline-flex h-7 rounded-lg p-[3px] text-muted-foreground'>
              <button
                type='button'
                className={cn(
                  'rounded-md px-2 text-xs font-medium transition-colors motion-reduce:transition-none',
                  setupPlatform === 'windows'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground'
                )}
                onClick={() => setSetupPlatform('windows')}
              >
                {t('Windows')}
              </button>
              <button
                type='button'
                className={cn(
                  'rounded-md px-2 text-xs font-medium transition-colors motion-reduce:transition-none',
                  setupPlatform === 'unix'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground'
                )}
                onClick={() => setSetupPlatform('unix')}
              >
                {t('Linux / macOS')}
              </button>
            </div>
          </div>
          <TabsContent value='claude' className='mt-2'>
            <CodeBlock code={setupCommand} language='bash' />
          </TabsContent>
          <TabsContent value='codex' className='mt-2'>
            <CodeBlock code={setupCommand} language='bash' />
          </TabsContent>
        </Tabs>
      </div>

      <div className='grid gap-2'>
        {props.signals.map((signal) => {
          const Icon = signal.icon

          return (
            <div
              key={signal.label}
              className='bg-muted/40 flex items-center justify-between gap-3 rounded-xl px-3 py-2'
            >
              <span className='flex min-w-0 items-center gap-2'>
                <Icon
                  className='text-muted-foreground size-3.5 shrink-0'
                  aria-hidden='true'
                />
                <span className='truncate text-xs font-medium'>
                  {signal.label}
                </span>
              </span>
              <span className='text-muted-foreground shrink-0 text-xs'>
                {signal.value}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function QuickActionItem(props: { action: QuickAction }) {
  const Icon = props.action.icon

  return (
    <Button
      variant='outline'
      className='h-auto justify-start rounded-xl px-3 py-3 text-left'
      render={<Link to={props.action.to} />}
    >
      <span className='bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg'>
        <Icon className='size-4' aria-hidden='true' />
      </span>
      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className='truncate text-sm font-medium'>
          {props.action.title}
        </span>
        <span className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
          {props.action.description}
        </span>
      </span>
    </Button>
  )
}

function CompactQuickAction(props: { action: QuickAction }) {
  const Icon = props.action.icon

  return (
    <Button
      variant='outline'
      size='sm'
      className='bg-background/70 h-8 min-w-24 gap-1.5 px-2.5'
      render={<Link to={props.action.to} />}
    >
      <Icon data-icon='inline-start' />
      <span>{props.action.title}</span>
    </Button>
  )
}

function AccountQuotaPanel(props: {
  apiKeyCount: number
  groupCount: number
}) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const quotaPercent = getQuotaUsagePercent(remainQuota, usedQuota)
  const roleLabel = user?.role && user.role >= ROLE.ADMIN ? 'Admin' : 'User'

  return (
    <CardStaggerContainer className='grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]'>
      <CardStaggerItem className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-start gap-3'>
            <span className='bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl'>
              <ShieldCheck className='size-5' aria-hidden='true' />
            </span>
            <div className='min-w-0 flex-1'>
              <div className='text-muted-foreground text-xs font-medium'>
                {t('Profile')}
              </div>
              <div className='truncate text-lg font-semibold'>
                {user?.display_name || user?.username || t('Current user')}
              </div>
              <div className='text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs'>
                <Badge variant='technical'>{t(roleLabel)}</Badge>
                {user?.group && (
                  <Badge variant='technical'>
                    {t('Group')}: {user.group}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2'>
            <div className='bg-muted/35 rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {t('Requests')}
              </div>
              <div className='font-mono text-sm font-semibold tabular-nums'>
                {formatNumber(Number(user?.request_count ?? 0))}
              </div>
            </div>
            <div className='bg-muted/35 rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {t('API Keys')}
              </div>
              <div className='font-mono text-sm font-semibold tabular-nums'>
                {formatNumber(props.apiKeyCount)}
              </div>
            </div>
            <div className='bg-muted/35 rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {t('Groups')}
              </div>
              <div className='font-mono text-sm font-semibold tabular-nums'>
                {formatNumber(props.groupCount)}
              </div>
            </div>
          </div>
        </div>
      </CardStaggerItem>

      <CardStaggerItem className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
        <div className='flex h-full flex-col justify-between gap-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <div className='text-muted-foreground text-xs font-medium'>
                {t('Subscription and quota')}
              </div>
              <div className='mt-1 text-xl font-semibold tracking-tight'>
                {formatQuota(remainQuota)}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                {t('Remaining quota')}
              </div>
            </div>
            <Badge variant={remainQuota > 0 ? 'success' : 'destructive'}>
              {remainQuota > 0 ? t('Available') : t('Balance depleted')}
            </Badge>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>{t('Quota used')}</span>
              <span className='font-mono tabular-nums'>
                {Math.round(quotaPercent)}%
              </span>
            </div>
            <Progress value={quotaPercent} />
            <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs'>
              <span>
                {t('Used')}: {formatQuota(usedQuota)}
              </span>
              <span>
                {t('Total')}: {formatQuota(remainQuota + usedQuota)}
              </span>
            </div>
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
  const trendRange = useMemo(() => computeTimeRange(7), [])
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
    () =>
      processChartData(
        trendQuery.data?.data ?? [],
        'day',
        t,
        undefined
      ),
    [trendQuery.data?.data, t]
  )

  const spec = useMemo(
    () => ({
      ...chartData.spec_area,
      title: {
        visible: false,
      },
      legends: { visible: true, orient: 'bottom', selectMode: 'single' },
      area: {
        style: {
          fillOpacity: 0.16,
          curveType: 'monotone',
        },
      },
      line: {
        style: {
          lineWidth: 2,
          curveType: 'monotone',
        },
      },
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
              <h3 className='text-base font-semibold'>{t('Usage trend')}</h3>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>
              {t('Seven-day quota consumption by model')}
            </p>
          </div>
          <Badge variant='technical'>{t('Last 7 days')}</Badge>
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

function RecentRequestsPanel(props: { isAdmin: boolean }) {
  const { t } = useTranslation()
  const logsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'recent-requests', props.isAdmin],
    queryFn: async () => {
      const result = props.isAdmin
        ? await getAllLogs({ p: 1, page_size: 6 })
        : await getUserLogs({ p: 1, page_size: 6 })
      return result.success ? ((result.data?.items ?? []) as UsageLog[]) : []
    },
    staleTime: 30 * 1000,
  })

  const logs = logsQuery.data ?? []

  return (
    <CardStaggerItem className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <Clock3 className='text-muted-foreground size-4' />
            <h3 className='text-base font-semibold'>
              {t('Recent requests')}
            </h3>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            {t('Latest gateway activity')}
          </p>
        </div>
        <Button variant='outline' size='sm' render={<Link to='/usage-logs' />}>
          {t('View all')}
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border'>
        <div className='bg-table-header text-muted-foreground grid grid-cols-[minmax(0,1fr)_5rem_6rem] gap-3 border-b px-3 py-2 text-xs font-medium sm:grid-cols-[minmax(0,1fr)_7rem_7rem_6rem]'>
          <span>{t('Model')}</span>
          <span className='hidden sm:block'>{t('Group')}</span>
          <span>{t('Latency')}</span>
          <span className='text-right'>{t('Cost')}</span>
        </div>
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className='grid grid-cols-[minmax(0,1fr)_5rem_6rem] gap-3 border-b px-3 py-2.5 text-sm last:border-b-0 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_6rem]'
            >
              <div className='min-w-0'>
                <div className='flex min-w-0 items-center gap-2'>
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      log.type === LOG_TYPE_ENUM.ERROR
                        ? 'bg-destructive'
                        : 'bg-success'
                    )}
                    aria-hidden='true'
                  />
                  <span className='truncate font-medium'>
                    {log.model_name || t('Unknown model')}
                  </span>
                </div>
                <div className='text-muted-foreground mt-0.5 truncate font-mono text-[11px]'>
                  {log.request_id || formatTimestampToDate(log.created_at)}
                </div>
              </div>
              <div className='hidden min-w-0 items-center sm:flex'>
                <Badge variant='technical'>{log.group || t('Default')}</Badge>
              </div>
              <div className='flex items-center'>
                <Badge variant={getLogStatusVariant(log)}>
                  {formatUseTime(Number(log.use_time) || 0)}
                </Badge>
              </div>
              <div className='flex items-center justify-end font-mono text-xs tabular-nums'>
                {formatLogQuota(Number(log.quota) || 0)}
              </div>
            </div>
          ))
        ) : (
          <div className='text-muted-foreground px-3 py-8 text-center text-sm'>
            {logsQuery.isLoading
              ? t('Loading')
              : t('No recent requests yet')}
          </div>
        )}
      </div>
    </CardStaggerItem>
  )
}

function GroupsPanel(props: { groups: UserGroupMap }) {
  const { t } = useTranslation()
  const entries = Object.entries(props.groups).slice(0, 6)

  return (
    <CardStaggerItem className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <Boxes className='text-muted-foreground size-4' />
            <h3 className='text-base font-semibold'>{t('Groups')}</h3>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            {t('Available routing groups')}
          </p>
        </div>
        <Badge variant='technical'>
          {formatNumber(entries.length)} {t('visible')}
        </Badge>
      </div>

      <div className='grid gap-2'>
        {entries.length > 0 ? (
          entries.map(([name, group]) => (
            <div
              key={name}
              className='bg-muted/25 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5'
            >
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <span
                    className='bg-success size-1.5 rounded-full'
                    aria-hidden='true'
                  />
                  <span className='truncate text-sm font-medium'>{name}</span>
                </div>
                <div className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
                  {group.desc || t('No description')}
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <Badge variant='technical'>{group.ratio}x</Badge>
                <Badge variant='technical'>/v1</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className='text-muted-foreground rounded-xl border px-3 py-8 text-center text-sm'>
            {t('No groups available')}
          </div>
        )}
      </div>
    </CardStaggerItem>
  )
}

export function OverviewDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const { items: apiInfoItems } = useApiInfo()
  const {
    apiInfo: showApiInfoPanel,
    announcements: showAnnouncementsPanel,
    faq: showFAQPanel,
    uptimeKuma: showUptimePanel,
  } = useDashboardContentVisibility()
  const [manualSetupGuideExpanded, setManualSetupGuideExpanded] = useState<
    boolean | null
  >(() => getSavedSetupGuideExpanded())

  const requestCount = Number(user?.request_count ?? 0)
  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const isAdmin = Boolean(user?.role && user.role >= ROLE.ADMIN)

  const apiKeysQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'api-keys'],
    queryFn: async () => {
      const result = await getApiKeys({ p: 1, size: 10 })
      return result.success ? (result.data?.items ?? []) : []
    },
    staleTime: 60 * 1000,
  })

  const groupsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'user-groups'],
    queryFn: async () => {
      const result = await getUserGroups()
      return result.success ? (result.data ?? {}) : {}
    },
    staleTime: 5 * 60 * 1000,
  })

  const modelsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'user-models'],
    queryFn: async () => {
      const result = await getUserModels()
      return result.success ? (result.data ?? []) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const preferredKey = useMemo(
    () => getPreferredKey(apiKeysQuery.data ?? []),
    [apiKeysQuery.data]
  )

  const startSteps = useMemo<StartStep[]>(
    () => [
      {
        title: t('Create API Key'),
        description: t('Create a key for your app or service'),
        to: '/keys',
        icon: KeyRound,
        completed: Boolean(preferredKey),
      },
      {
        title: t('Add credits'),
        description: t('Keep enough balance before production traffic'),
        to: '/wallet',
        icon: CreditCard,
        completed: remainQuota > 0 || usedQuota > 0,
      },
      {
        title: t('Send a request'),
        description: t('Verify routing with Playground or your client'),
        to: '/playground',
        icon: TerminalSquare,
        completed: requestCount > 0,
      },
    ],
    [preferredKey, remainQuota, requestCount, t, usedQuota]
  )

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: t('API Keys'),
        description: t('Create a key for your app or service'),
        to: '/keys',
        icon: KeyRound,
      },
      {
        title: t('Channels'),
        description: t('Configure upstream providers and routing.'),
        to: '/channels',
        icon: RadioTower,
        adminOnly: true,
      },
      {
        title: t('Usage Logs'),
        description: t('Inspect requests, errors, and billing details'),
        to: '/usage-logs',
        icon: FileText,
      },
      {
        title: t('Pricing'),
        description: t('Review model rates before scaling traffic'),
        to: '/pricing',
        icon: BookOpen,
      },
    ],
    [t]
  )

  const visibleQuickActions = useMemo(
    () => quickActions.filter((action) => !action.adminOnly || isAdmin),
    [isAdmin, quickActions]
  )

  const heroSignals = useMemo<HeroSignal[]>(
    () => [
      {
        label: t('Route active'),
        value: apiInfoItems.length > 0 ? t('Online') : t('Current domain'),
        icon: RadioTower,
      },
      {
        label: t('Auth configured'),
        value: preferredKey ? t('Secured') : t('Needs API key'),
        icon: ShieldCheck,
      },
      {
        label: t('Model selected'),
        value: modelsQuery.data?.[0] ?? t('Loading'),
        icon: Timer,
      },
    ],
    [apiInfoItems.length, modelsQuery.data, preferredKey, t]
  )

  const requestExample = useMemo<RequestExample>(() => {
    const endpoint = normalizeEndpoint(apiInfoItems[0]?.url)
    const model = modelsQuery.data?.[0] ?? 'gpt-4o-mini'
    const keyName = preferredKey?.name ?? t('No API key yet')
    const ready = Boolean(preferredKey?.id && model)

    return {
      endpoint,
      model,
      keyName,
      keyId: preferredKey?.id,
      displayKey: preferredKey
        ? formatDisplayKey(`sk-${preferredKey.key}`)
        : 'sk-...',
      ready,
    }
  }, [apiInfoItems, modelsQuery.data, preferredKey, t])

  const baseUrl = useMemo(
    () => normalizeBaseUrl(apiInfoItems[0]?.url),
    [apiInfoItems]
  )
  const userGroups = (groupsQuery.data ?? {}) as UserGroupMap

  const completedStepCount = startSteps.filter((step) => step.completed).length
  const setupComplete = completedStepCount === startSteps.length
  const setupStatusReady = apiKeysQuery.isFetched && Boolean(user)
  const setupGuideExpanded =
    manualSetupGuideExpanded ?? (setupStatusReady && !setupComplete)
  const showLeftContentPanels =
    isAdmin || showApiInfoPanel || showAnnouncementsPanel || showFAQPanel
  const showContentPanels = showLeftContentPanels || showUptimePanel

  const handleSetupGuideToggle = () => {
    const nextExpanded = !setupGuideExpanded
    setManualSetupGuideExpanded(nextExpanded)
    saveSetupGuideExpanded(nextExpanded)
  }

  return (
    <div className='flex flex-col gap-4'>
      {setupGuideExpanded ? (
        <CardStaggerContainer className='grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
          <CardStaggerItem className='bg-card h-full overflow-hidden rounded-2xl border shadow-xs'>
            <div className='relative h-full overflow-hidden p-4 sm:p-5'>
              <SetupGuideBackdrop />
              <div className='relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]'>
                <div className='flex min-w-0 flex-col gap-5'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='flex max-w-2xl flex-col gap-1'>
                      <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wider uppercase'>
                        <ListChecks className='size-3.5' aria-hidden='true' />
                        {t('Get started')}
                      </div>
                      <h3 className='text-xl font-semibold tracking-tight sm:text-2xl'>
                        {t('Build on your API gateway in minutes')}
                      </h3>
                      <p className='text-muted-foreground max-w-xl text-sm leading-relaxed'>
                        {t(
                          'A focused home for keys, balance, routing, and service health.'
                        )}
                      </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleSetupGuideToggle}
                      >
                        <ChevronUp data-icon='inline-start' />
                        {t('Hide setup guide')}
                      </Button>
                      <Button size='sm' render={<Link to='/keys' />}>
                        <KeyRound data-icon='inline-start' />
                        {t('Create API Key')}
                      </Button>
                    </div>
                  </div>

                  <ol className='bg-background/45 rounded-2xl border p-2 backdrop-blur'>
                    {startSteps.map((step, index) => (
                      <StartStepItem
                        key={step.title}
                        step={step}
                        index={index}
                        isLast={index === startSteps.length - 1}
                      />
                    ))}
                  </ol>
                </div>

                <RequestPreview
                  example={requestExample}
                  signals={heroSignals}
                  baseUrl={baseUrl}
                />
              </div>
            </div>
          </CardStaggerItem>

          <CardStaggerItem className='bg-card h-full rounded-2xl border p-4 shadow-xs sm:p-5'>
            <div className='flex h-full flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                  {t('Recommended actions')}
                </div>
                <h3 className='text-lg font-semibold tracking-tight'>
                  {t('Keep the platform ready')}
                </h3>
              </div>
              <div className='grid gap-2'>
                {visibleQuickActions.map((action) => (
                  <QuickActionItem key={action.title} action={action} />
                ))}
              </div>
            </div>
          </CardStaggerItem>
        </CardStaggerContainer>
      ) : (
        <CardStaggerContainer>
          <CardStaggerItem className='bg-card overflow-hidden rounded-2xl border shadow-xs'>
            <div className='relative overflow-hidden px-4 py-3 sm:px-5'>
              <SetupGuideBackdrop compact />
              <div className='relative flex flex-wrap items-center justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span className='bg-background/70 flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-xs'>
                    <Check className='text-success size-4' aria-hidden='true' />
                  </span>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <h3 className='truncate text-sm font-semibold'>
                        {setupComplete
                          ? t('Setup guide complete')
                          : t('Setup guide')}
                      </h3>
                      <span className='text-muted-foreground bg-background/60 rounded-md border px-2 py-0.5 text-xs'>
                        {t('Setup progress: {{completed}}/{{total}}', {
                          completed: completedStepCount,
                          total: startSteps.length,
                        })}
                      </span>
                    </div>
                    <p className='text-muted-foreground line-clamp-1 text-xs'>
                      {setupComplete
                        ? t(
                            'Your setup guide is collapsed so usage stays in focus.'
                          )
                        : t('Setup guide is collapsed. Expand it anytime.')}
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  {visibleQuickActions.map((action) => (
                    <CompactQuickAction key={action.title} action={action} />
                  ))}
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-background/70 h-8 min-w-28'
                    onClick={handleSetupGuideToggle}
                  >
                    <ChevronDown data-icon='inline-start' />
                    {t('Show setup guide')}
                  </Button>
                </div>
              </div>
            </div>
          </CardStaggerItem>
        </CardStaggerContainer>
      )}

      <SummaryCards />

      <AccountQuotaPanel
        apiKeyCount={apiKeysQuery.data?.length ?? 0}
        groupCount={Object.keys(userGroups).length}
      />

      <UsageTrendPanel />

      <CardStaggerContainer className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]'>
        <RecentRequestsPanel isAdmin={isAdmin} />
        <GroupsPanel groups={userGroups} />
      </CardStaggerContainer>

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
