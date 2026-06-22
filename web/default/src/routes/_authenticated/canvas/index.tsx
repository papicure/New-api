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
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Main } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { isSidebarModuleEnabled } from '@/lib/nav-modules'

const CANVAS_URL = 'https://canvas.papicure.de/'

export const Route = createFileRoute('/_authenticated/canvas/')({
  beforeLoad: () => {
    if (!isSidebarModuleEnabled('chat', 'canvas')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: CanvasPage,
})

function CanvasPage() {
  const { t } = useTranslation()

  return (
    <Main className='bg-background p-0'>
      <div className='border-border bg-background flex h-12 shrink-0 items-center justify-between border-b px-4'>
        <h1 className='text-foreground truncate text-base font-semibold'>
          {t('AI Image Processing')}
        </h1>
        <Button
          variant='outline'
          size='sm'
          render={<a href={CANVAS_URL} target='_blank' rel='noreferrer' />}
        >
          <ExternalLink className='size-4' />
          <span>{t('Open in new tab')}</span>
        </Button>
      </div>
      <iframe
        title={t('AI Image Processing')}
        src={CANVAS_URL}
        className='bg-background h-full min-h-0 w-full flex-1 border-0'
        referrerPolicy='no-referrer-when-downgrade'
        allow='clipboard-read; clipboard-write; fullscreen'
      />
    </Main>
  )
}
