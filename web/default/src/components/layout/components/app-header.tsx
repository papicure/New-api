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
import { Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { Search } from '@/components/search'
import { useNotifications } from '@/hooks/use-notifications'
import { formatQuota } from '@/lib/format'
import { useAuthStore } from '@/stores/auth-store'

import { AppBreadcrumb } from './app-breadcrumb'
import { Header } from './header'
import { HelpMenu } from './help-menu'

/**
 * General application Header component
 * Integrates navigation bar, search, configuration and profile functions
 *
 * @example
 * // Basic usage
 * <AppHeader />
 *
 * @example
 * // Hide navigation bar and search box
 * <AppHeader showSearch={false} />
 *
 * @example
 * // Fully customize left and right content
 * <AppHeader
 *   leftContent={<CustomLeft />}
 *   rightContent={<CustomRight />}
 * />
 */
type AppHeaderProps = {
  /**
   * Left content, overrides breadcrumbs if provided
   */
  leftContent?: React.ReactNode
  /**
   * Whether to show search box
   * @default true
   */
  showSearch?: boolean
  /**
   * Custom right content, overrides default right content if provided
   */
  rightContent?: React.ReactNode
  /**
   * Whether to show notification button
   * @default true
   */
  showNotifications?: boolean
  /**
   * Whether to show config drawer
   * @default true
   */
  showConfigDrawer?: boolean
  /**
   * Whether to show the help menu
   * @default true
   */
  showHelp?: boolean
}

export function AppHeader({
  leftContent,
  showSearch = true,
  rightContent,
  showNotifications = true,
  showConfigDrawer = true,
  showHelp = true,
}: AppHeaderProps) {
  const { t } = useTranslation()
  const quota = useAuthStore((state) => state.auth.user?.quota)

  // Notifications hook
  const notifications = useNotifications()

  return (
    <>
      <Header>
        {leftContent ? (
          <div className='flex min-w-0 items-center'>{leftContent}</div>
        ) : (
          <div className='flex min-w-0 flex-1 items-center'>
            <AppBreadcrumb />
          </div>
        )}

        {rightContent ?? (
          <div className='ms-auto flex items-center gap-1 sm:gap-2'>
            <BalancePill label={t('Balance')} quota={quota} />
            <div className='bg-border/70 mx-1 hidden h-5 w-px sm:block' />
            {showSearch && <Search />}
            {showNotifications && (
              <NotificationPopover
                open={notifications.popoverOpen}
                onOpenChange={notifications.setPopoverOpen}
                unreadCount={notifications.unreadCount}
                activeTab={notifications.activeTab}
                onTabChange={notifications.setActiveTab}
                notice={notifications.notice}
                announcements={notifications.announcements}
                loading={notifications.loading}
              />
            )}
            <LanguageSwitcher />
            {showConfigDrawer && <ConfigDrawer />}
            {showHelp && <HelpMenu />}
          </div>
        )}
      </Header>
    </>
  )
}

function BalancePill(props: { label: string; quota?: number }) {
  const { t } = useTranslation()
  if (props.quota == null || !Number.isFinite(props.quota)) return null

  return (
    <Link
      to='/wallet'
      aria-label={t('Top up balance')}
      className='border-border/70 bg-card text-card-foreground shadow-soft hover:border-primary/50 hover:bg-accent focus-visible:ring-ring/40 hidden h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none sm:inline-flex'
    >
      <Wallet className='text-primary size-3.5 shrink-0' aria-hidden='true' />
      <span className='text-muted-foreground hidden lg:inline'>
        {props.label}
      </span>
      <span>{formatQuota(props.quota)}</span>
    </Link>
  )
}
