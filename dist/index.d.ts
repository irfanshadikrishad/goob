interface Product {
  number: number
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
  location?: string
  description?: string
  seller?: string
  brand?: string
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
  /**
   * Subclasses MUST implement: parse a raw response into Product[].
   * @param offset Number of products already collected on previous pages.
   *               Use it to keep `number` continuous across pages.
   */
  protected abstract parse(html: string, offset?: number): Product[]
  /** Public entry point developers call. Override to add pagination. */
  search(options: ScrapeOptions): Promise<Product[]>
}

declare class DarazScraper extends BaseScraper {
  protected config: SiteConfig
  search(options: ScrapeOptions): Promise<Product[]>
  /**
   * @param offset Number of products already collected in previous pages.
   *               Ensures `number` is continuous across pages.
   */
  protected parse(html: string, offset?: number): Product[]
}

declare class RokomariScraper extends BaseScraper {
  protected config: SiteConfig
  protected parse(html: string, limit?: number): Product[]
}

export { DarazScraper, RokomariScraper }
export type { Product, ScrapeOptions }
