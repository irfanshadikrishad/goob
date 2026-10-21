// src/core/BaseScraper.ts
var BaseScraper = class {
  /** Fetch raw HTML for a search query. Override for custom headers/auth. */
  async fetchHtml(url) {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.rokomari.com/',
        'Connection': 'keep-alive',
      },
    })
    if (!res.ok) {
      throw new Error(`[${this.config.name}] HTTP ${res.status} for ${url}`)
    }
    return res.text()
  }
  /** Public entry point developers call */
  async search(options) {
    const url = `${this.config.baseUrl}${this.config.searchPath(options.query)}`
    const html = await this.fetchHtml(url)
    return this.parse(html, options.limit)
  }
}

// src/utils/helpers.ts
function sanitizeLink(link) {
  if (!link) return ''
  const trimmed = link.trim()
  const lowerLink = trimmed.toLowerCase()
  if (
    lowerLink.startsWith('javascript:') ||
    lowerLink.startsWith('data:') ||
    lowerLink.startsWith('vbscript:')
  ) {
    return '#'
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }
  return trimmed
}
function parseSoldCount(soldStr) {
  if (!soldStr) return 0
  const cleaned = soldStr
    .replace(/sold/gi, '')
    .replace(/,/g, '')
    .trim()
    .toUpperCase()
  let multiplier = 1
  let numericPart = cleaned
  if (cleaned.endsWith('K')) {
    multiplier = 1e3
    numericPart = cleaned.slice(0, -1)
  } else if (cleaned.endsWith('M')) {
    multiplier = 1e6
    numericPart = cleaned.slice(0, -1)
  }
  const numberValue = parseFloat(numericPart)
  return isNaN(numberValue) ? 0 : Math.round(numberValue * multiplier)
}

// src/adapters/DarazScraper.ts
var DarazScraper = class extends BaseScraper {
  config = {
    name: 'daraz',
    baseUrl: 'https://www.daraz.com.bd',
    searchPath: (q) => `/catalog/?ajax=true&q=${encodeURIComponent(q)}`,
  }
  parse(html, limit) {
    const data = JSON.parse(html)
    const items = data?.mods?.listItems ?? []
    return items.slice(0, limit ?? items.length).map((it) => {
      const product = {
        title: it.name,
        price: Number(it.price),
        originalPrice: Number(it.originalPrice),
        currency: 'BDT',
        url: sanitizeLink(it.itemUrl?.startsWith('http'))
          ? sanitizeLink(it.itemUrl)
          : `https:${sanitizeLink(it.itemUrl)}`,
        source: 'daraz',
        totalSold: parseSoldCount(it.itemSoldCntShow),
        review: Number(it.review),
      }
      if (it.image) product.imageUrl = it.image
      if (it.ratingScore) product.rating = Number(it.ratingScore)
      return product
    })
  }
}

// src/adapters/RokomariScraper.ts
import { load } from 'cheerio'
var RokomariScraper = class extends BaseScraper {
  config = {
    name: 'rokomari',
    baseUrl: 'https://www.rokomari.com',
    searchPath: (q) => `/search?ref=sm&term=${encodeURIComponent(q)}`,
  }
  parse(html, limit) {
    const $ = load(html)
    const products = []
    $('.book-item, .product-item, .search-result-item').each((_, el) => {
      if (limit && products.length >= limit) return false
      const $el = $(el)
      const title = $el.find('.book-title, .product-title, h4').text().trim()
      const priceText = $el
        .find('.book-price, .product-price, .price')
        .text()
        .trim()
      const link = $el.find('a').attr('href')
      const img = $el.find('img').attr('src')
      if (!title || !priceText) return
      const priceMatch = priceText.replace(/,/g, '').match(/[\d.]+/)
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0
      const product = {
        title,
        price,
        currency: 'BDT',
        url: link
          ? link.startsWith('http')
            ? link
            : `https://www.rokomari.com${link}`
          : '',
        source: 'rokomari',
      }
      if (img) product.imageUrl = img
      products.push(product)
    })
    return products
  }
}
export { DarazScraper, RokomariScraper }
//# sourceMappingURL=index.js.map
