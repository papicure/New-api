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
/**
 * Theme customization constants and types.
 *
 * Lives in `lib/` (not `context/`) so it can be imported alongside the
 * provider without breaking React Fast Refresh boundaries.
 */

export const THEME_PRESETS = [
  {
    value: 'default',
    name: 'Default',
    swatches: ['oklch(0.985 0.006 75)', 'oklch(0.56 0.13 42)'],
  },
  {
    value: 'terracotta',
    name: 'Terracotta',
    swatches: ['oklch(0.56 0.13 42)', 'oklch(0.928 0.03 58)'],
  },
  {
    value: 'clay',
    name: 'Clay',
    swatches: ['oklch(0.54 0.14 30)', 'oklch(0.925 0.032 45)'],
  },
  {
    value: 'amber',
    name: 'Amber',
    swatches: ['oklch(0.62 0.13 70)', 'oklch(0.93 0.04 72)'],
  },
  {
    value: 'sage',
    name: 'Sage',
    swatches: ['oklch(0.55 0.105 140)', 'oklch(0.918 0.032 118)'],
  },
] as const

export type ThemePreset = (typeof THEME_PRESETS)[number]['value']
export type ThemeRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ThemeScale = 'default' | 'sm' | 'lg' | 'xl'
export type ContentLayout = 'full' | 'centered'

/**
 * Font axis for the theme.
 *
 * - `default` resolves at runtime from the active preset.
 * - `sans` is the humanist UI face (Public Sans).
 * - `serif` is the editorial serif (Lora + CJK fallbacks).
 */
export type ThemeFont = 'default' | 'sans' | 'serif'

/**
 * The resolved (non-`default`) font value applied to the DOM. The provider
 * always sets `data-theme-font` to one of these concrete values so CSS only
 * needs simple attribute selectors.
 */
export type ResolvedThemeFont = Exclude<ThemeFont, 'default'>

export type ThemeCustomization = {
  preset: ThemePreset
  font: ThemeFont
  radius: ThemeRadius
  scale: ThemeScale
  contentLayout: ContentLayout
}

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  preset: 'default',
  font: 'default',
  radius: 'default',
  scale: 'default',
  contentLayout: 'full',
}

export const THEME_PRESET_VALUES = new Set(
  THEME_PRESETS.map((p) => p.value)
) as ReadonlySet<ThemePreset>

export const THEME_FONT_VALUES: ReadonlySet<ThemeFont> = new Set([
  'default',
  'sans',
  'serif',
])

export const THEME_RADIUS_VALUES: ReadonlySet<ThemeRadius> = new Set([
  'default',
  'none',
  'sm',
  'md',
  'lg',
  'xl',
])

export const THEME_SCALE_VALUES: ReadonlySet<ThemeScale> = new Set([
  'default',
  'sm',
  'lg',
  'xl',
])

export const CONTENT_LAYOUT_VALUES: ReadonlySet<ContentLayout> = new Set([
  'full',
  'centered',
])

export const THEME_COOKIE_KEYS = {
  preset: 'theme_preset',
  font: 'theme_font',
  radius: 'theme_radius',
  scale: 'theme_scale',
  contentLayout: 'theme_content_layout',
} as const

/**
 * Preset to default font mapping. Presets not listed here fall back to the
 * `resolveThemeFont` default of `sans`.
 */
export const PRESET_DEFAULT_FONT: Partial<
  Record<ThemePreset, ResolvedThemeFont>
> = {
  default: 'sans',
}

export function resolveThemeFont(
  font: ThemeFont,
  preset: ThemePreset
): ResolvedThemeFont {
  if (font === 'default') {
    return PRESET_DEFAULT_FONT[preset] ?? 'sans'
  }
  return font
}
