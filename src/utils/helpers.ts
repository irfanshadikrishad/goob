/**
 * Bengali numeral characters mapped by their corresponding numeric values.
 *
 * The character at each index represents that index as an Arabic numeral.
 */
const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/**
 * Resolves a URL against BASE_URL and validates its protocol.
 *
 * Supports absolute, relative, and protocol-relative URLs.
 * Only HTTP and HTTPS URLs are accepted. Dangerous or unsupported
 * schemes, invalid URLs, and missing values return an empty string.
 *
 * @param href - The URL to normalize and validate.
 * @returns The absolute HTTP(S) URL, or an empty string if invalid.
 *
 * @example
 * toAbsoluteUrl('/products/123')
 * // 'https://www.rokomari.com/products/123'
 *
 * @example
 * toAbsoluteUrl('//example.com/products/123')
 * // 'https://example.com/products/123'
 *
 * @example
 * toAbsoluteUrl('javascript:alert(1)')
 * // ''
 *
 * @example
 * toAbsoluteUrl('https://example.com')
 * // 'https://example.com/'
 */
export function toAbsoluteUrl(
  href: string | undefined,
  base_url: string
): string {
  if (!href) return ''

  try {
    const url = new URL(href.trim(), base_url)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return ''
    }

    return url.href
  } catch {
    return ''
  }
}

export function sanitizeLink(link: string): string {
  if (!link) return ''

  const trimmed = link.trim()
  const lowerLink = trimmed.toLowerCase()

  // Block dangerous schemes to prevent XSS (e.g., javascript:, data:)
  if (
    lowerLink.startsWith('javascript:') ||
    lowerLink.startsWith('data:') ||
    lowerLink.startsWith('vbscript:')
  ) {
    return '#'
  }

  // Convert protocol-relative URLs (e.g., '//www.daraz.com.bd/...') to absolute HTTPS URLs
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  return trimmed
}

export function parseSoldCount(soldStr: string): number {
  if (!soldStr) return 0

  // Remove the word 'sold', commas, and whitespace, then make it uppercase
  const cleaned = soldStr
    .replace(/sold/gi, '')
    .replace(/,/g, '')
    .trim()
    .toUpperCase()

  let multiplier = 1
  let numericPart = cleaned

  if (cleaned.endsWith('K')) {
    multiplier = 1000
    numericPart = cleaned.slice(0, -1)
  } else if (cleaned.endsWith('M')) {
    multiplier = 1000000
    numericPart = cleaned.slice(0, -1)
  }

  const numberValue = parseFloat(numericPart)
  return isNaN(numberValue) ? 0 : Math.round(numberValue * multiplier)
}

/**
 * Waits a Second
 * Usefull for delaying repitative requests and avoiding rate-limit
 */
export async function waitASec() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return
}

/**
 * Normalizes whitespace by replacing consecutive whitespace characters
 * with a single space and removing leading and trailing whitespace.
 *
 * @param text - The input string to normalize.
 * @returns The normalized string.
 *
 * @example
 * normalizeWhitespace('  Full   Stack\nWeb\tDevelopment  ')
 * // 'Full Stack Web Development'
 */
export const normalizeWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim()

/**
 * Converts Bengali numerals (০–৯) in a string to Arabic numerals (0–9).
 *
 * Non-numeric characters are preserved.
 *
 * @param text - The input string containing Bengali numerals.
 * @returns The string with Bengali numerals converted to Arabic numerals.
 *
 * @example
 * normalizeDigits('৳১,২৫০')
 * // '৳1,250'
 */
export const normalizeDigits = (text: string): string =>
  text.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
