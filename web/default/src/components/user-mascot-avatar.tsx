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
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

/**
 * A cute cartoon mascot avatar rendered as inline SVG.
 *
 * The same friendly "fluffy sheep" character is drawn for every user, with the
 * face tone, fluff tint, and background hue derived from a hash of the user's
 * name. This keeps a single coherent mascot identity across the app while still
 * giving each account a recognizably distinct color. Because it is vector art,
 * it stays crisp at any size (sidebar 32px, overview 48px, profile 64px+).
 */

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

interface MascotPalette {
  bg: string
  fluff: string
  fluffShade: string
  face: string
  faceShade: string
  ear: string
}

function getMascotPalette(name: string): MascotPalette {
  const hash = hashString(name || '?')
  const hue = hash % 360
  const faceHue = (hue + 18) % 360
  return {
    bg: `hsl(${hue} 70% 93%)`,
    fluff: `hsl(${hue} 55% 97%)`,
    fluffShade: `hsl(${hue} 40% 88%)`,
    face: `hsl(${faceHue} 58% 84%)`,
    faceShade: `hsl(${faceHue} 48% 76%)`,
    ear: `hsl(${faceHue} 45% 72%)`,
  }
}

interface UserMascotAvatarProps {
  name: string
  className?: string
  /** Accessible label; defaults to the user's name. */
  alt?: string
}

export function UserMascotAvatar({
  name,
  className,
  alt,
}: UserMascotAvatarProps) {
  const palette = useMemo(() => getMascotPalette(name), [name])
  const ink = '#43425a'

  return (
    <svg
      viewBox='0 0 64 64'
      role='img'
      aria-label={alt ?? name}
      className={cn('size-full! shrink-0 select-none', className)}
    >
      <circle cx='32' cy='32' r='32' fill={palette.bg} />
      {/* Ears tucked behind the fluff */}
      <ellipse cx='17' cy='30' rx='6' ry='8' fill={palette.ear} />
      <ellipse cx='47' cy='30' rx='6' ry='8' fill={palette.ear} />
      {/* Fluffy wool crown — overlapping puffs */}
      <g fill={palette.fluffShade}>
        <circle cx='20' cy='24' r='10' />
        <circle cx='32' cy='18' r='11' />
        <circle cx='44' cy='24' r='10' />
        <circle cx='14' cy='34' r='8' />
        <circle cx='50' cy='34' r='8' />
      </g>
      <g fill={palette.fluff}>
        <circle cx='21' cy='23' r='8.5' />
        <circle cx='32' cy='17' r='9.5' />
        <circle cx='43' cy='23' r='8.5' />
        <circle cx='15' cy='33' r='6.5' />
        <circle cx='49' cy='33' r='6.5' />
      </g>
      {/* Face */}
      <ellipse cx='32' cy='37' rx='15' ry='14' fill={palette.faceShade} />
      <ellipse cx='32' cy='36' rx='14' ry='13' fill={palette.face} />
      {/* Cheeks */}
      <circle cx='23' cy='40' r='3.2' fill='#ff9eb1' opacity='0.7' />
      <circle cx='41' cy='40' r='3.2' fill='#ff9eb1' opacity='0.7' />
      {/* Eyes */}
      <circle cx='26' cy='35' r='2.6' fill={ink} />
      <circle cx='38' cy='35' r='2.6' fill={ink} />
      <circle cx='27' cy='34' r='0.8' fill='#fff' />
      <circle cx='39' cy='34' r='0.8' fill='#fff' />
      {/* Smile */}
      <path
        d='M28 42 Q32 45.5 36 42'
        fill='none'
        stroke={ink}
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  )
}
