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
import { Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { useNotifications } from '@/hooks/use-notifications'
import { formatQuota } from '@/lib/format'
import { useAuthStore } from '@/stores/auth-store'

import { AppBreadcrumb } from './app-breadcrumb'
import { Header } from './header'

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
   * Whether to show profile dropdown
   * @default true
   */
  showProfileDropdown?: boolean
}

export function AppHeader({
  leftContent,
  showSearch = true,
  rightContent,
  showNotifications = true,
  showConfigDrawer = true,
  showProfileDropdown = true,
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
            {showSearch && <Search />}
            <BalancePill label={t('Balance')} quota={quota} />
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
            {showProfileDropdown && <ProfileDropdown />}
          </div>
        )}
      </Header>
    </>
  )
}

function BalancePill(props: { label: string; quota?: number }) {
  if (props.quota == null || !Number.isFinite(props.quota)) return null

  return (
    <div className='border-border/70 bg-card text-card-foreground shadow-soft hidden h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium tabular-nums sm:inline-flex'>
      <Wallet className='text-primary size-3.5 shrink-0' aria-hidden='true' />
      <span className='text-muted-foreground hidden lg:inline'>
        {props.label}
      </span>
      <span>{formatQuota(props.quota)}</span>
    </div>
  )
}
