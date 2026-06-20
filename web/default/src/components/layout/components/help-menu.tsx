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
import { BookOpen, CircleHelp, ExternalLink, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStatus } from '@/hooks/use-status'

/**
 * Global help entry in the top app bar.
 *
 * Fills the slot freed up by relocating the profile menu to the sidebar.
 * Surfaces documentation (external, only when configured), the About page,
 * and a shortcut back to the console overview where the setup guide lives.
 */
export function HelpMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { status } = useStatus()
  const docsLink = status?.docs_link as string | undefined

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            aria-label={t('Help')}
          />
        }
      >
        <CircleHelp className='size-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className='w-52'>
        <DropdownMenuLabel>{t('Help & support')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {docsLink && (
          <DropdownMenuItem
            onClick={() =>
              window.open(docsLink, '_blank', 'noopener,noreferrer')
            }
          >
            <BookOpen className='size-4' />
            <span className='flex-1'>{t('Documentation')}</span>
            <ExternalLink className='text-muted-foreground size-3.5' />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
          <CircleHelp className='size-4' />
          {t('Setup guide')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate({ to: '/about' })}>
          <Info className='size-4' />
          {t('About')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
