// src/adapters/RokomariScraper.ts
import { BaseScraper } from '@/core/BaseScraper.js'
import { Product, SiteConfig } from '@/core/types.js'
import { load } from 'cheerio'

export class RokomariScraper extends BaseScraper {
  protected config: SiteConfig = {
    name: 'rokomari',
    baseUrl: 'https://www.rokomari.com',
    searchPath: (q) => `/search?ref=sm&term=${encodeURIComponent(q)}`,
  }

  protected parse(html: string, limit?: number): Product[] {
    const $ = load(html)
    const products: Product[] = []

    // Rokomari search results use a class like "book-item" or similar
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

      const product: Product = {
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
