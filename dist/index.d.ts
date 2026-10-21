interface Product {
  title: string
  price: number
  originalPrice?: number
  currency: string
  url: string
  imageUrl?: string
  rating?: number
  sold?: number
  source: string
  totalSold?: string | number
  review?: number
}
interface ScrapeOptions {
  query: string
  limit?: number
}
interface SiteConfig {
  name: string
  baseUrl: string
  searchPath: (query: string) => string
}

declare abstract class BaseScraper {
  protected abstract config: SiteConfig
  /** Fetch raw HTML for a search query. Override for custom headers/auth. */
  protected fetchHtml(url: string): Promise<string>
  /** Subclasses MUST implement: parse HTML string into Product[] */
  protected abstract parse(html: string, limit?: number): Product[]
  /** Public entry point developers call */
  search(options: ScrapeOptions): Promise<Product[]>
}

declare class DarazScraper extends BaseScraper {
  protected config: SiteConfig
  protected parse(html: string, limit?: number): Product[]
}

declare class RokomariScraper extends BaseScraper {
  protected config: SiteConfig
  protected parse(html: string, limit?: number): Product[]
}

export { DarazScraper, RokomariScraper }
export type { Product, ScrapeOptions }
