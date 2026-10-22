function sanitizeLink(link: string): string {
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

function parseSoldCount(soldStr: string): number {
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

async function waitASec() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return
}

export { parseSoldCount, sanitizeLink, waitASec }
