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
  /** Public entry point developers call. Override to add pagination. */
  async search(options) {
    const url = `${this.config.baseUrl}${this.config.searchPath(options.query)}`
    const html = await this.fetchHtml(url)
    const products = this.parse(html, 0)
    return options.limit !== void 0
      ? products.slice(0, options.limit)
      : products
  }
}

// src/utils/helpers.ts
var BENGALI_DIGITS =
  '\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF'
function toAbsoluteUrl(href, base_url) {
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
async function waitASec() {
  await new Promise((resolve) => setTimeout(resolve, 1e3))
  return
}
var normalizeWhitespace = (text) => text.replace(/\s+/g, ' ').trim()
var normalizeDigits = (text) =>
  text.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))

// src/adapters/DarazScraper.ts
var DarazScraper = class extends BaseScraper {
  config = {
    name: 'daraz',
    baseUrl: 'https://www.daraz.com.bd',
    searchPath: (q) => `/catalog/?ajax=true&q=${encodeURIComponent(q)}`,
  }
  async search(options) {
    const targetLimit = options.limit ?? 40
    const allProducts = []
    let page = 1
    while (allProducts.length < targetLimit) {
      const url = `${this.config.baseUrl}${this.config.searchPath(options.query)}&page=${page}`
      const html = await this.fetchHtml(url)
      const pageProducts = this.parse(html, allProducts.length)
      if (pageProducts.length === 0) break
      allProducts.push(...pageProducts)
      page++
      await waitASec()
      if (page > 102) break
    }
    return allProducts.slice(0, targetLimit)
  }
  /**
   * @param offset Number of products already collected in previous pages.
   *               Ensures `number` is continuous across pages.
   */
  parse(html, offset = 0) {
    const data = JSON.parse(html)
    const items = data?.mods?.listItems ?? []
    return items.map((it, count) => {
      const rawUrl = toAbsoluteUrl(it.itemUrl, this.config.baseUrl)
      const product = {
        number: offset + count + 1,
        title: it.name,
        price: Number(it.price),
        originalPrice: Number(it.originalPrice),
        currency: 'BDT',
        url: rawUrl?.startsWith('http') ? rawUrl : `https:${rawUrl}`,
        source: 'daraz',
        totalSold: parseSoldCount(it.itemSoldCntShow),
        review: Number(it.review),
        location: it.location,
        description: it.description,
        seller: it.sellerName,
        brand: it.brandName,
      }
      if (it.image) product.imageUrl = it.image
      if (it.ratingScore) product.rating = Number(it.ratingScore)
      return product
    })
  }
}

// src/adapters/RokomariScraper.ts
import { load } from 'cheerio'
var BASE_URL = 'https://www.rokomari.com'
var DEFAULT_LIMIT = 60
var MAX_PAGES = 35
var SELECTORS = {
  card: '[class*="filterGridData_productGridItem__"]',
  link: 'a[href]',
  title: '[class*="productContainer_productTitle__"]',
  brand: '[class*="productContainer_productAuthor__"]',
  price: '[class*="productContainer_productPrice__"]',
  originalPrice: 'del',
  image: '[class*="productContainer_bookImage__"] img',
  star: 'img[alt^="Rating Star"]',
}
var PLACEHOLDER_IMAGE = /placeholder-image/i
function parsePrice(text) {
  const match = normalizeDigits(text)
    .replace(/,/g, '')
    .match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const value = Number.parseFloat(match[0])
  return Number.isFinite(value) ? value : null
}
function ratingFromStarAlts(alts) {
  return alts.reduce((sum, alt) => {
    if (/full/i.test(alt)) return sum + 1
    if (/half/i.test(alt)) return sum + 0.5
    return sum
  }, 0)
}
var RokomariScraper = class extends BaseScraper {
  config = {
    name: 'rokomari',
    baseUrl: BASE_URL,
    searchPath: (q) =>
      `/search?term=${encodeURIComponent(q)}&search_type=ALL&dt=n`,
  }
  async search(options) {
    const query = String(options.query ?? '').trim()
    const targetLimit = options.limit ?? DEFAULT_LIMIT
    if (!query || Number.isNaN(targetLimit) || targetLimit <= 0) return []
    const collected = []
    const seen = /* @__PURE__ */ new Set()
    for (
      let page = 1;
      page <= MAX_PAGES && collected.length < targetLimit;
      page++
    ) {
      const url = `${this.config.baseUrl}${this.config.searchPath(query)}&page=${page}`
      const html = await this.fetchHtml(url)
      let added = 0
      for (const product of this.parse(html, collected.length)) {
        const key = product.url || `${product.title}|${product.price}`
        if (seen.has(key)) continue
        seen.add(key)
        collected.push(product)
        added++
      }
      if (added === 0) break
      if (collected.length < targetLimit) await waitASec()
    }
    return collected
      .slice(0, targetLimit)
      .map((product, i) => ({ ...product, number: i + 1 }))
  }
  /**
   * @param offset Number of products already collected in previous pages.
   *               Keeps `number` continuous across pages.
   */
  parse(html, offset = 0) {
    const $ = load(html)
    const products = []
    $(SELECTORS.card).each((_, el) => {
      const $card = $(el)
      const title = normalizeWhitespace(
        $card.find(SELECTORS.title).first().text()
      )
      const price = parsePrice($card.find(SELECTORS.price).first().text())
      if (!title || price === null) return
      const product = {
        number: offset + products.length + 1,
        title,
        price,
        currency: 'BDT',
        url: toAbsoluteUrl(
          $card.find(SELECTORS.link).first().attr('href'),
          BASE_URL
        ),
        source: 'rokomari',
      }
      const originalPrice = parsePrice(
        $card.find(SELECTORS.originalPrice).first().text()
      )
      if (originalPrice !== null && originalPrice > price) {
        product.originalPrice = originalPrice
      }
      const brand = normalizeWhitespace(
        $card.find(SELECTORS.brand).first().text()
      )
      if (brand) product.brand = brand
      const $img = $card.find(SELECTORS.image).first()
      const imageUrl = [$img.attr('data-src'), $img.attr('src')]
        .map((url) => toAbsoluteUrl(url, BASE_URL))
        .find((url) => url && !PLACEHOLDER_IMAGE.test(url))
      if (imageUrl) product.imageUrl = imageUrl
      const $stars = $card.find(SELECTORS.star)
      if ($stars.length > 0) {
        const alts = $stars.toArray().map((s) => $(s).attr('alt') ?? '')
        product.rating = ratingFromStarAlts(alts)
        const reviews = normalizeDigits(
          $stars.first().parent().next('span').text()
        ).match(/\d+/)
        if (reviews) product.review = Number.parseInt(reviews[0], 10)
      }
      products.push(product)
    })
    return products
  }
}
export { DarazScraper, RokomariScraper }
//# sourceMappingURL=index.js.map
