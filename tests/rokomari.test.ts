import { RokomariScraper } from '@/adapters/RokomariScraper.js'
import { describe, expect, test } from '@jest/globals'

describe('[Rokomari Scraper]', () => {
  test('Search a product', async () => {
    const rokomari = new RokomariScraper()
    const product = await rokomari.search({ query: 'watch', limit: 5 })

    expect(product.length).toBeGreaterThan(1)
  })
})
