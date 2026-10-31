import { DarazScraper } from '@/adapters/DarazScraper.js'
import { describe, expect, test } from '@jest/globals'

describe('[Daraz Scrapper]', () => {
  test('resolves the @/ alias at runtime', () => {
    expect(DarazScraper).toBeDefined()
  })

  test('Search a product', async () => {
    const daraz = new DarazScraper()
    const product = await daraz.search({ query: 'watch', limit: 1 })
    expect(product.length).toBeGreaterThan(0)
  })
})
