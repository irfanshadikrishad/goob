#### Use Case

```ts
import { RokomariScraper } from '@irfanshadikrishad/goob'

const rokomari = new RokomariScraper()

const products = await rokomari.search({
  query: 'watch',
  limit: 1,
})

console.log('Rokomari Products:', products)
```

**Example output**

```text
Rokomari Products: [
  {
    number: 1,
    title: 'Casio Vintage Digital Watch',
    price: 1850,
    originalPrice: 2200,
    currency: 'BDT',
    url: 'https://www.rokomari.com/product/123456',
    imageUrl: 'https://example.com/images/casio-watch.jpg',
    rating: 4.5,
    review: 28,
    source: 'rokomari',
    seller: 'Rokomari',
    brand: 'Casio'
  }
]
```

_Note: Example data is illustrative, not actual scraped results. Optional fields are included only when available._
