// src/core/BaseScraper.ts
import { Product, ScrapeOptions, SiteConfig } from '@/core/types.js'

export abstract class BaseScraper {
  protected abstract config: SiteConfig

  /** Fetch raw HTML for a search query. Override for custom headers/auth. */
  protected async fetchHtml(url: string): Promise<string> {
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

  /** Subclasses MUST implement: parse HTML string into Product[] */
  protected abstract parse(html: string, limit?: number): Product[]

  /** Public entry point developers call */
  async search(options: ScrapeOptions): Promise<Product[]> {
    const url = `${this.config.baseUrl}${this.config.searchPath(options.query)}`
    const html = await this.fetchHtml(url)
    return this.parse(html, options.limit)
  }
}
