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
import { Link, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useSidebarView } from '@/hooks/use-sidebar-view'

import { checkIsActive } from '../lib/url-utils'
import type { NavCollapsible, NavGroup, NavItem, NavLink } from '../types'

type BreadcrumbMatch = {
  groupTitle: string
  parentTitle?: string
  title: string
  url?: NavLink['url']
}

export function AppBreadcrumb() {
  const { t } = useTranslation()
  const href = useLocation({ select: (location) => location.href })
  const pathname = useLocation({ select: (location) => location.pathname })
  const { navGroups } = useSidebarView()
  const match = findBreadcrumbMatch(navGroups, href)
  const fallbackTitle = pathname
    .split('/')
    .filter(Boolean)
    .at(-1)
    ?.replaceAll('-', ' ')

  return (
    <Breadcrumb>
      <BreadcrumbList className='gap-1.5 text-xs sm:text-sm'>
        <BreadcrumbItem className='hidden sm:inline-flex'>
          <BreadcrumbPage className='text-muted-foreground font-medium'>
            {match?.groupTitle ?? t('Dashboard')}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator className='hidden sm:inline-flex' />

        {match?.parentTitle && (
          <>
            <BreadcrumbItem className='hidden min-w-0 sm:inline-flex'>
              <BreadcrumbPage className='text-muted-foreground max-w-36 truncate'>
                {match.parentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='hidden sm:inline-flex' />
          </>
        )}

        <BreadcrumbItem className='min-w-0'>
          {match?.url ? (
            <BreadcrumbLink
              className='text-foreground max-w-44 truncate font-medium sm:max-w-64'
              render={<Link to={match.url} />}
            >
              {match.title}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className='max-w-44 truncate font-medium capitalize sm:max-w-64'>
              {match?.title ?? fallbackTitle ?? t('Dashboard')}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function findBreadcrumbMatch(
  navGroups: NavGroup[],
  href: string
): BreadcrumbMatch | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = getItemMatch(group.title, item, href)
      if (match) return match
    }
  }

  return null
}

function getItemMatch(
  groupTitle: string,
  item: NavItem,
  href: string
): BreadcrumbMatch | null {
  if (item.type === 'chat-presets') return null

  if ('items' in item && item.items) {
    const parent = item as NavCollapsible
    for (const subItem of parent.items) {
      if (checkIsActive(href, subItem)) {
        return {
          groupTitle,
          parentTitle: parent.title,
          title: subItem.title,
          url: subItem.url,
        }
      }
    }

    if (checkIsActive(href, parent)) {
      return {
        groupTitle,
        title: parent.title,
      }
    }

    return null
  }

  if (checkIsActive(href, item)) {
    return {
      groupTitle,
      title: item.title,
      url: item.url,
    }
  }

  return null
}
