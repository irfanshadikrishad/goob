// src/adapters/DarazScraper.ts
import { BaseScraper } from '@/core/BaseScraper.js'
import { Product, ScrapeOptions, SiteConfig } from '@/core/types.js'
import { parseSoldCount, sanitizeLink, waitASec } from '@/utils/helpers.js'

export class DarazScraper extends BaseScraper {
  protected config: SiteConfig = {
    name: 'daraz',
    baseUrl: 'https://www.daraz.com.bd',
    searchPath: (q) => `/catalog/?ajax=true&q=${encodeURIComponent(q)}`,
  }

  async search(options: ScrapeOptions): Promise<Product[]> {
    const targetLimit = options.limit ?? 40
    const allProducts: Product[] = []
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
  protected parse(html: string, offset = 0): Product[] {
    const data = JSON.parse(html)
    const items = data?.mods?.listItems ?? []

    return items.map((it: any, count: number): Product => {
      const rawUrl = sanitizeLink(it.itemUrl)

      const product: Product = {
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
