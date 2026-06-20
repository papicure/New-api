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
'use client'

import type { BundledLanguage } from 'shiki/bundle/web'
import { useTranslation } from 'react-i18next'

import {
  CodeBlock as AiCodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block'
import { cn } from '@/lib/utils'

type CodeBlockProps = {
  code: string
  language?: BundledLanguage
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock(props: CodeBlockProps) {
  const { t } = useTranslation()

  return (
    <AiCodeBlock
      code={props.code}
      language={props.language ?? 'bash'}
      showLineNumbers={props.showLineNumbers}
      className={cn(
        'border-border/70 bg-muted/40 shadow-soft [&>div>div:first-child]:[&>pre]:bg-transparent!',
        props.className
      )}
    >
      <CodeBlockCopyButton
        aria-label={t('Copy')}
        className='bg-background/80 hover:bg-background size-7 border'
      />
    </AiCodeBlock>
  )
}
