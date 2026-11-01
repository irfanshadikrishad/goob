#### [Use Case]

```ts
import { DarazScraper } from '@irfanshadikrishad/goob'

const daraz = new DarazScraper()

const products = await daraz.search({
  query: 'watch',
  limit: 1,
})

console.log('Daraz Products:', products)
```

#### [Example Output]

```text
Daraz Products: [
  {
    number: 1,
    title: 'SKMEI Digital Sports Watch for Men',
    price: 1250,
    originalPrice: 1800,
    currency: 'BDT',
    url: 'https://www.daraz.com.bd/products/skmei-digital-watch.html',
    imageUrl: 'https://example.com/images/skmei-watch.jpg',
    rating: 4.7,
    sold: 320,
    totalSold: '320',
    review: 64,
    source: 'daraz',
    location: 'Dhaka',
    description: 'Digital sports watch with alarm, stopwatch and water resistance.',
    seller: 'Watch Store',
    brand: 'SKMEI'
  }
]
```

_Note: Example data is illustrative, not actual scraped results._
