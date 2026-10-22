// src/core/types.ts
export interface Product {
  number: number
  title: string
  price: number
  originalPrice?: number
  currency: string
  url: string
  imageUrl?: string
  rating?: number
  sold?: number
  source: string // "daraz" | "rokomari"
  totalSold?: string | number
  review?: number
  location?: string
  description?: string
  seller?: string
  brand?: string
}

export interface ScrapeOptions {
  query: string
  limit?: number
}

export interface SiteConfig {
  name: string
  baseUrl: string
  searchPath: (query: string) => string
}
