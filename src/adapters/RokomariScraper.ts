import { BaseScraper } from '@/core/BaseScraper.js'
import { Product, ScrapeOptions, SiteConfig } from '@/core/types.js'
import {
  normalizeDigits,
  normalizeWhitespace,
  toAbsoluteUrl,
  waitASec,
} from '@/utils/helpers.js'
import { load } from 'cheerio'

const BASE_URL = 'https://www.rokomari.com'
const DEFAULT_LIMIT = 60

/** Hard ceiling on requests per search, whatever `limit` is. */
const MAX_PAGES = 35

/**
 * Rokomari uses CSS Modules, so class names look like
 * `productContainer_productTitle__bsIaz`. The `file_name` part is stable;
 * the trailing hash changes between deploys. Match on the stable part only.
 *
 * Every selector that depends on Rokomari's markup lives here, so a site
 * change is a one-place fix.
 */
const SELECTORS = {
  card: '[class*="filterGridData_productGridItem__"]',
  link: 'a[href]',
  title: '[class*="productContainer_productTitle__"]',
  brand: '[class*="productContainer_productAuthor__"]',
  price: '[class*="productContainer_productPrice__"]',
  originalPrice: 'del',
  image: '[class*="productContainer_bookImage__"] img',
  star: 'img[alt^="Rating Star"]',
} as const

const PLACEHOLDER_IMAGE = /placeholder-image/i

/** First number in the text (e.g. "৳1,349" -> 1349), or null if none. */
function parsePrice(text: string): number | null {
  const match = normalizeDigits(text)
    .replace(/,/g, '')
    .match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const value = Number.parseFloat(match[0])
  return Number.isFinite(value) ? value : null
}

/** Full star = 1, half star = 0.5, empty = 0 (the site only renders halves). */
function ratingFromStarAlts(alts: string[]): number {
  return alts.reduce((sum, alt) => {
    if (/full/i.test(alt)) return sum + 1
    if (/half/i.test(alt)) return sum + 0.5
    return sum
  }, 0)
}

export class RokomariScraper extends BaseScraper {
  protected config: SiteConfig = {
    name: 'rokomari',
    baseUrl: BASE_URL,
    searchPath: (q) =>
      `/search?term=${encodeURIComponent(q)}&search_type=ALL&dt=n`,
  }

  async search(options: ScrapeOptions): Promise<Product[]> {
    const query = String(options.query ?? '').trim()
    const targetLimit = options.limit ?? DEFAULT_LIMIT
    if (!query || Number.isNaN(targetLimit) || targetLimit <= 0) return []

    const collected: Product[] = []
    const seen = new Set<string>()

    for (
      let page = 1;
      page <= MAX_PAGES && collected.length < targetLimit;
      page++
    ) {
      const url = `${this.config.baseUrl}${this.config.searchPath(query)}&page=${page}`
      const html = await this.fetchHtml(url)

      let added = 0
      for (const product of this.parse(html, collected.length)) {
        // Sorting can shift items between pages, so the same product may show
        // up twice. A page with nothing new also means we ran past the end.
        const key = product.url || `${product.title}|${product.price}`
        if (seen.has(key)) continue
        seen.add(key)
        collected.push(product)
        added++
      }

      if (added === 0) break
      if (collected.length < targetLimit) await waitASec()
    }

    // Renumber after de-duplication and slicing so `number` is always 1..n.
    return collected
      .slice(0, targetLimit)
      .map((product, i) => ({ ...product, number: i + 1 }))
  }

  /**
   * @param offset Number of products already collected in previous pages.
   *               Keeps `number` continuous across pages.
   */
  protected parse(html: string, offset = 0): Product[] {
    const $ = load(html)
    const products: Product[] = []

    $(SELECTORS.card).each((_, el) => {
      const $card = $(el)

      const title = normalizeWhitespace(
        $card.find(SELECTORS.title).first().text()
      )

      const price = parsePrice($card.find(SELECTORS.price).first().text())
      if (!title || price === null) return

      const product: Product = {
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

      // `product.brand` holds the author for books (no author field on Product).
      const brand = normalizeWhitespace(
        $card.find(SELECTORS.brand).first().text()
      )
      if (brand) product.brand = brand

      // Lazy-loaded: the real URL is in data-src, src is a placeholder gif.
      const $img = $card.find(SELECTORS.image).first()
      const imageUrl = [$img.attr('data-src'), $img.attr('src')]
        .map((url) => toAbsoluteUrl(url, BASE_URL))
        .find((url) => url && !PLACEHOLDER_IMAGE.test(url))
      if (imageUrl) product.imageUrl = imageUrl

      const $stars = $card.find(SELECTORS.star)
      if ($stars.length > 0) {
        const alts = $stars.toArray().map((s) => $(s).attr('alt') ?? '')
        product.rating = ratingFromStarAlts(alts)

        // "(19)" sits in the <span> right after the stars; comment nodes
        // (<!-- -->) are not part of .text().
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
