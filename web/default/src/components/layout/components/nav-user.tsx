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
import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, Home, LogOut, Settings, User, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SignOutDialog } from '@/components/sign-out-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import useDialogState from '@/hooks/use-dialog'
import { useUserDisplay } from '@/hooks/use-user-display'
import { getUserAvatarFallback, getUserAvatarStyle } from '@/lib/avatar'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

const avatarFallbackClassName = 'font-semibold text-white'

/**
 * Sidebar bottom user card.
 *
 * Renders the signed-in user's identity (avatar + name + email) at the
 * bottom-left of the sidebar and exposes the account menu (Profile / Wallet /
 * System Settings / Sign out). This replaces the old top-bar ProfileDropdown:
 * the top bar now hosts only global tools, while identity lives here.
 *
 * Collapses gracefully to an icon-only avatar when the sidebar is in
 * `collapsible=icon` mode.
 */
export function NavUser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const user = useAuthStore((state) => state.auth.user)
  const { displayName, secondaryText, roleLabel } = useUserDisplay(user)
  const isSuperAdmin = user?.role === ROLE.SUPER_ADMIN
  const avatarName = user?.username || displayName
  const avatarFallback = getUserAvatarFallback(avatarName)
  const avatarFallbackStyle = useMemo(
    () => getUserAvatarStyle(avatarName),
    [avatarName]
  )

  return (
    <SidebarFooter className='border-sidebar-border border-t p-2'>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                />
              }
            >
              <Avatar className='size-8 shrink-0 rounded-md'>
                <AvatarFallback
                  className={`${avatarFallbackClassName} rounded-md text-xs`}
                  style={avatarFallbackStyle}
                >
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-medium'>{displayName}</span>
                <span className='text-sidebar-foreground/60 truncate font-mono text-[11px]'>
                  {secondaryText || roleLabel}
                </span>
              </div>
              <ChevronsUpDown className='text-sidebar-foreground/50 ml-auto size-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={8}
              className='w-56'
            >
              <div className='flex items-center gap-2 px-1.5 py-1.5'>
                <Avatar className='size-8 rounded-md'>
                  <AvatarFallback
                    className={`${avatarFallbackClassName} rounded-md text-xs`}
                    style={avatarFallbackStyle}
                  >
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-1 flex-col gap-0.5 overflow-hidden'>
                  <p className='text-foreground truncate text-sm font-medium'>
                    {displayName}
                  </p>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-muted-foreground text-xs'>
                      {roleLabel}
                    </span>
                    {user?.group && (
                      <>
                        <span className='text-muted-foreground text-xs'>·</span>
                        <span className='text-muted-foreground truncate text-xs'>
                          {String(user.group)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate({ to: '/' })}>
                <Home className='size-4' />
                {t('Home')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                <User className='size-4' />
                {t('Profile')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate({ to: '/wallet' })}>
                <Wallet className='size-4' />
                {t('Wallet')}
              </DropdownMenuItem>

              {isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: '/system-settings/site/$section',
                      params: { section: 'system-info' },
                    })
                  }
                >
                  <Settings className='size-4' />
                  {t('System Settings')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut className='size-4' />
                {t('Sign out')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </SidebarFooter>
  )
}
