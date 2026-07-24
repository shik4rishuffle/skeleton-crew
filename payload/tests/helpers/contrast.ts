/**
 * WCAG 2.1 contrast ratio helper (TASK-010 / QA-01).
 *
 * Pure function, no dependency. Consumed by TASK-075 (BJ frontend a11y
 * sweep). Plan section 10 documents the design choice to hand-roll rather
 * than pull in `color`/`wcag-contrast` for ~40 lines of pure arithmetic.
 *
 * Supported colour formats:
 *   - `#rgb`        e.g. `#abc`
 *   - `#rrggbb`     e.g. `#aabbcc`
 *   - `rgb(r, g, b)` and `rgba(r, g, b, a)` (alpha ignored)
 *
 * `hsl(...)` deliberately deferred until TASK-075 needs it - the BJ palette
 * is hex/RGB only.
 *
 * WCAG 2.1 thresholds:
 *   - AA  normal text: 4.5
 *   - AA  large  text: 3
 *   - AAA normal text: 7
 *   - AAA large  text: 4.5
 */

export type ContrastLevel = 'AA' | 'AAA'
export type ContrastSize = 'normal' | 'large'

interface RGB {
  r: number
  g: number
  b: number
}

function parseColor(input: string): RGB {
  const s = input.trim().toLowerCase()

  // #rgb / #rrggbb
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0]!, 16)
      const g = parseInt(hex[1]! + hex[1]!, 16)
      const b = parseInt(hex[2]! + hex[2]!, 16)
      if ([r, g, b].some((n) => Number.isNaN(n))) {
        throw new Error(`contrast: invalid #rgb colour "${input}"`)
      }
      return { r, g, b }
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      if ([r, g, b].some((n) => Number.isNaN(n))) {
        throw new Error(`contrast: invalid #rrggbb colour "${input}"`)
      }
      return { r, g, b }
    }
    throw new Error(`contrast: unsupported hex length in "${input}"`)
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/)
  if (m) {
    const r = parseInt(m[1]!, 10)
    const g = parseInt(m[2]!, 10)
    const b = parseInt(m[3]!, 10)
    return { r, g, b }
  }

  throw new Error(`contrast: unsupported colour format "${input}"`)
}

/**
 * sRGB -> linear-light per WCAG 2.1 relative-luminance formula.
 * Channel value c is in [0, 255].
 */
function channelLuminance(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance({ r, g, b }: RGB): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/**
 * WCAG contrast ratio between two colours. Returns a value in [1, 21].
 */
export function contrastRatio(fg: string, bg: string): number {
  const lFg = luminance(parseColor(fg))
  const lBg = luminance(parseColor(bg))
  const [light, dark] = lFg >= lBg ? [lFg, lBg] : [lBg, lFg]
  return (light + 0.05) / (dark + 0.05)
}

const THRESHOLDS: Record<`${ContrastLevel}-${ContrastSize}`, number> = {
  'AA-normal': 4.5,
  'AA-large': 3,
  'AAA-normal': 7,
  'AAA-large': 4.5,
}

/**
 * Throws an Error if the contrast ratio is below the requested WCAG threshold.
 * Vitest reports the throw as a failed assertion.
 */
export function assertContrast(
  fg: string,
  bg: string,
  opts: { level: ContrastLevel; size?: ContrastSize },
): void {
  const size = opts.size ?? 'normal'
  const required = THRESHOLDS[`${opts.level}-${size}`]
  const actual = contrastRatio(fg, bg)
  if (actual < required) {
    throw new Error(
      `contrast: ${fg} on ${bg} = ${actual.toFixed(2)}:1 (required ${required}:1 for WCAG ${opts.level} ${size})`,
    )
  }
}
