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
import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

import { checkIsActive } from '@/components/layout/lib/url-utils'
import type { NavGroup, NavItem } from '@/components/layout/types'
import { useSidebarView } from '@/hooks/use-sidebar-view'
import { useSystemConfigStore } from '@/stores/system-config-store'

/**
 * Resolve the active navigation item's title for the current URL.
 *
 * Walks the resolved sidebar nav groups (which include nested children) and
 * returns the title of the deepest item that matches the current location,
 * mirroring how the breadcrumb determines the active page.
 */
function findActiveTitle(navGroups: NavGroup[], href: string): string | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      const title = matchItemTitle(item, href)
      if (title) return title
    }
  }
  return null
}

function matchItemTitle(item: NavItem, href: string): string | null {
  if (item.type === 'chat-presets') return null

  if ('items' in item && item.items) {
    for (const subItem of item.items) {
      if (checkIsActive(href, subItem)) return subItem.title
    }
    if (checkIsActive(href, item)) return item.title
    return null
  }

  if (checkIsActive(href, item)) return item.title
  return null
}

/**
 * Keep `document.title` in sync with the active page and system name, producing
 * titles like "Overview | RelaxyCode". Falls back to just the system name when
 * no navigation item matches (e.g. detail pages outside the sidebar).
 */
export function useDocumentTitle() {
  const href = useLocation({ select: (l) => l.href })
  const { navGroups } = useSidebarView()
  const systemName = useSystemConfigStore((s) => s.config.systemName)

  useEffect(() => {
    const pageTitle = findActiveTitle(navGroups, href)
    const next =
      pageTitle && systemName
        ? `${pageTitle} | ${systemName}`
        : pageTitle || systemName

    if (next && document.title !== next) {
      document.title = next
      const meta = document.querySelector(
        'meta[name="title"]'
      ) as HTMLMetaElement | null
      if (meta) meta.setAttribute('content', next)
    }
  }, [navGroups, href, systemName])
}
