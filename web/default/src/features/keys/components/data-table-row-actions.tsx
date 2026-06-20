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
import { type Row } from '@tanstack/react-table'
import {
  Trash2,
  Edit,
  Power,
  PowerOff,
  PauseCircle,
  ExternalLink,
  ArrowRightLeft,
  Copy,
  Link,
  Loader2,
  MoreHorizontal as DotsHorizontalIcon,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useChatPresets } from '@/features/chat/hooks/use-chat-presets'
import { resolveChatUrl, type ChatPreset } from '@/features/chat/lib/chat-links'
import { sendToFluent } from '@/features/chat/lib/send-to-fluent'
import { copyToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'

import { updateApiKeyStatus } from '../api'
import { API_KEY_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import { apiKeySchema } from '../types'
import { useApiKeys } from './api-keys-provider'

function getServerAddress(): string {
  try {
    const raw = localStorage.getItem('status')
    if (raw) {
      const status = JSON.parse(raw)
      if (status.server_address) return status.server_address as string
    }
  } catch {
    /* empty */
  }
  return window.location.origin
}

function encodeConnectionString(key: string, url: string): string {
  return JSON.stringify({
    _type: 'newapi_channel_conn',
    key,
    url,
  })
}

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
  /**
   * `menu` (default): compact toggle + "..." menu for the dense table view.
   * `bar`: an expanded footer button row (Edit / Enable-Disable / Delete shown
   * as labelled buttons, secondary actions tucked into a "..." menu) used by
   * the card list to mirror the reference design.
   */
  variant?: 'menu' | 'bar'
}

export function DataTableRowActions<TData>({
  row,
  variant = 'menu',
}: DataTableRowActionsProps<TData>) {
  const { t } = useTranslation()
  const apiKey = apiKeySchema.parse(row.original)
  const {
    setOpen,
    setCurrentRow,
    triggerRefresh,
    setResolvedKey,
    resolveRealKey,
    resolvedKeys,
    loadingKeys,
  } = useApiKeys()
  const isEnabled = apiKey.status === API_KEY_STATUS.ENABLED
  const { chatPresets, serverAddress } = useChatPresets()
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const resolvedRealKey = resolvedKeys[apiKey.id]
  const isRealKeyLoading = Boolean(loadingKeys[apiKey.id])

  const hasChatPresets = chatPresets.length > 0

  const handleMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open && !resolvedRealKey && !isRealKeyLoading) {
        void resolveRealKey(apiKey.id)
      }
    },
    [apiKey.id, isRealKeyLoading, resolvedRealKey, resolveRealKey]
  )

  const getCachedRealKey = useCallback(() => {
    if (resolvedRealKey) return resolvedRealKey
    void resolveRealKey(apiKey.id)
    toast.info(t('API key is loading, please try again in a moment'))
    return null
  }, [apiKey.id, resolvedRealKey, resolveRealKey, t])

  const handleOpenChatPreset = useCallback(
    async (preset: ChatPreset) => {
      const realKey = await resolveRealKey(apiKey.id)
      if (!realKey) return

      if (preset.type === 'fluent') {
        const success = sendToFluent(realKey, serverAddress)
        if (success) {
          toast.success(t('Sent the API key to FluentRead.'))
        } else {
          toast.info(
            t(
              'FluentRead extension not detected. Please ensure it is installed and active.'
            )
          )
        }
        return
      }

      const resolvedUrl = resolveChatUrl({
        template: preset.url,
        apiKey: realKey,
        serverAddress,
      })

      if (!resolvedUrl) {
        toast.error(t('Invalid chat link. Please contact your administrator.'))
        return
      }

      if (typeof window === 'undefined') return

      try {
        window.open(resolvedUrl, '_blank', 'noopener')
      } catch {
        window.location.href = resolvedUrl
      }
    },
    [resolveRealKey, apiKey.id, serverAddress, t]
  )

  const handleToggleStatus = async (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.stopPropagation()
    const newStatus = isEnabled
      ? API_KEY_STATUS.DISABLED
      : API_KEY_STATUS.ENABLED

    setIsTogglingStatus(true)
    try {
      const result = await updateApiKeyStatus(apiKey.id, newStatus)
      if (result.success) {
        const message = isEnabled
          ? t(SUCCESS_MESSAGES.API_KEY_DISABLED)
          : t(SUCCESS_MESSAGES.API_KEY_ENABLED)
        toast.success(message)
        triggerRefresh()
      } else {
        toast.error(result.message || t(ERROR_MESSAGES.STATUS_UPDATE_FAILED))
      }
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Status toggle icon, computed without nested ternaries. The bar variant uses
  // PauseCircle for the disable affordance; the menu variant uses PowerOff.
  let toggleIconMenu = <Power className='size-4' />
  let toggleIconBar = <Power className='size-4' />
  if (isTogglingStatus) {
    const spinner = <Loader2 className='size-4 animate-spin' />
    toggleIconMenu = spinner
    toggleIconBar = spinner
  } else if (isEnabled) {
    toggleIconMenu = <PowerOff className='size-4' />
    toggleIconBar = <PauseCircle className='size-4' />
  }

  const editKey = () => {
    setCurrentRow(apiKey)
    setOpen('update')
  }

  const deleteKey = () => {
    setCurrentRow(apiKey)
    setOpen('delete')
  }

  // Secondary actions shared by both variants. In `menu` mode these sit
  // alongside Edit/Delete; in `bar` mode they are the only menu contents
  // because Edit/Delete are promoted to standalone footer buttons.
  const secondaryMenuItems = (
    <>
      <DropdownMenuItem
        onClick={async () => {
          const realKey = getCachedRealKey()
          if (!realKey) return
          const ok = await copyToClipboard(realKey)
          if (ok) toast.success(t('Copied'))
        }}
      >
        {t('Copy Key')}
        <DropdownMenuShortcut>
          <Copy size={16} />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={async () => {
          const realKey = getCachedRealKey()
          if (!realKey) return
          const connStr = encodeConnectionString(realKey, getServerAddress())
          const ok = await copyToClipboard(connStr)
          if (ok) toast.success(t('Copied'))
        }}
      >
        {t('Copy Connection Info')}
        <DropdownMenuShortcut>
          <Link size={16} />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={async () => {
          const realKey = await resolveRealKey(apiKey.id)
          if (!realKey) return
          setResolvedKey(realKey)
          setCurrentRow(apiKey)
          setOpen('cc-switch')
        }}
      >
        {t('CC Switch')}
        <DropdownMenuShortcut>
          <ArrowRightLeft size={16} />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      {hasChatPresets && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t('Chat')}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {chatPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => handleOpenChatPreset(preset)}
              >
                {preset.name}
                {preset.type !== 'web' && (
                  <DropdownMenuShortcut>
                    <ExternalLink size={16} />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </>
  )

  if (variant === 'bar') {
    return (
      <div className='flex flex-wrap items-center justify-end gap-1'>
        <DropdownMenu modal={false} onOpenChange={handleMenuOpenChange}>
          <DropdownMenuTrigger
            render={
              <Button
                variant='ghost'
                size='sm'
                className='data-popup-open:bg-muted text-muted-foreground gap-1.5'
              />
            }
          >
            <DotsHorizontalIcon className='size-4' />
            {t('More')}
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[200px]'>
            {secondaryMenuItems}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant='ghost'
          size='sm'
          onClick={editKey}
          className='gap-1.5'
        >
          <Edit className='size-4' />
          {t('Edit')}
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleToggleStatus()}
          disabled={isTogglingStatus}
          className={cn(
            'gap-1.5',
            isEnabled
              ? 'text-muted-foreground'
              : 'text-success hover:text-success'
          )}
        >
          {toggleIconBar}
          {isEnabled ? t('Disable') : t('Enable')}
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={deleteKey}
          className='text-destructive hover:text-destructive gap-1.5'
        >
          <Trash2 className='size-4' />
          {t('Delete')}
        </Button>
      </div>
    )
  }

  return (
    <div className='-ml-1.5 flex items-center gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              aria-label={isEnabled ? t('Disable') : t('Enable')}
              className={
                isEnabled
                  ? 'text-destructive hover:text-destructive'
                  : 'text-success hover:text-success'
              }
            />
          }
        >
          {toggleIconMenu}
        </TooltipTrigger>
        <TooltipContent>
          {isEnabled ? t('Disable') : t('Enable')}
        </TooltipContent>
      </Tooltip>

      <DropdownMenu modal={false} onOpenChange={handleMenuOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              className='data-popup-open:bg-muted flex h-8 w-8 p-0'
            />
          }
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>{t('Open menu')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[200px]'>
          {secondaryMenuItems}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={editKey}>
            {t('Edit')}
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={deleteKey}
            className='text-destructive focus:text-destructive'
          >
            {t('Delete')}
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
