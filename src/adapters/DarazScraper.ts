// src/adapters/DarazScraper.ts
import { BaseScraper } from '@/core/BaseScraper.js'
import { Product, SiteConfig } from '@/core/types.js'
import { parseSoldCount, sanitizeLink } from '@/utils/helpers.js'

export class DarazScraper extends BaseScraper {
  protected config: SiteConfig = {
    name: 'daraz',
    baseUrl: 'https://www.daraz.com.bd',
    searchPath: (q) => `/catalog/?ajax=true&q=${encodeURIComponent(q)}`,
  }

  protected parse(html: string, limit?: number): Product[] {
    // The AJAX endpoint returns JSON, not HTML.
    const data = JSON.parse(html)
    const items = data?.mods?.listItems ?? []

    return items.slice(0, limit ?? items.length).map((it: any): Product => {
      const product: Product = {
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
