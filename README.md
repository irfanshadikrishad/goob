#### Goob

Goob is an extensible e-commerce data extraction toolkit designed to collect, structure, and analyze publicly available product information from online marketplaces and e-commerce platforms.

It helps developers, entrepreneurs, and researchers gather valuable market intelligence to better understand product demand, monitor competitors, and identify emerging market opportunities.

Whether you're researching a niche, comparing competitor pricing, exploring product trends, or validating a business idea, Goob provides a foundation for turning scattered e-commerce data into actionable insights.

#### Why Goob?

Understanding a market requires more than browsing individual product listings. It requires collecting and analyzing information across multiple platforms.

Goob aims to simplify this process by providing a unified, extensible approach to extracting e-commerce data from different sources.

#### What You Can Build

- Market Research: Explore product categories, pricing patterns, and market trends.
- Competitor Analysis: Monitor competitor products, pricing, availability, and product positioning.
- Demand Research: Collect product signals that can help evaluate potential market demand.
- Product Discovery: Identify interesting products, emerging niches, and potential business opportunities.
- Price Monitoring: Track product prices across supported e-commerce platforms.
- Business Validation: Gather market data to support product and business decisions.

#### Design Philosophy

Goob is built around extensibility and simplicity.

Its architecture is designed to support multiple data sources through independent extractors, allowing new platforms to be integrated without fundamentally changing the core API.

The goal is to provide a consistent interface for collecting structured e-commerce data, regardless of the underlying platform.

#### Project Goals

- Provide a unified interface for e-commerce data extraction.
- Support multiple marketplaces and data sources.
- Make adding custom extractors straightforward.
- Normalize extracted data into consistent structures.
- Keep the core lightweight and developer-friendly.
- Establish a foundation for market intelligence and demand research.

#### Prerequisites

```bash
node -v
npm -v

```

#### Install

```bash
npm i @irfanshadikrishad/goob

```

#### Use Cases

```js
import { DarazScraper, RokomariScraper } from '@irfanshadikrishad/goob'

const rokomari = new RokomariScraper()
const daraz = new DarazScraper()

const rokomariProducts = await rokomari.search({
  query: 'watch',
  limit: 1,
})

const darazProducts = await daraz.search({
  query: 'watch',
  limit: 1,
})

console.log('Rokomari Products:', rokomariProducts)
console.log('Daraz Products:', darazProducts)

/*
// Example Output
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
    brand: 'Casio',
    seller: 'Rokomari'
  }
]

Daraz Products: [
  {
    number: 1,
    title: 'SKMEI Digital Sports Watch for Men',
    price: 1250,
    originalPrice: 1800,
    currency: 'BDT',
    url: 'https://www.daraz.com.bd/products/example.html',
    imageUrl: 'https://example.com/images/skmei-watch.jpg',
    rating: 4.7,
    sold: 320,
    totalSold: '320 sold',
    review: 64,
    source: 'daraz',
    location: 'Dhaka',
    seller: 'Watch Store',
    brand: 'SKMEI'
  }
] */
```

#### Available Adapters

- [Daraz](/docs/daraz.md)
- [Rokomari](/docs/rokomari.md)

#### Support

Need help with Goob, encountered a bug, or have an idea for improvement? I'm happy to help!

You can reach out through either of the following channels:

- Report an issue: Create a GitHub [Issue](https://github.com/irfanshadikrishad/goob/issues/new) to report bugs, request features, or discuss technical problems.
- Email support: [hello@irfanshadikrishad.dev](mailto:hello@irfanshadikrishad.dev?subject=Goob%20-%20Support%20Request) for questions, assistance, or anything else related to Goob.

When reporting a bug, please include relevant details, steps to reproduce the issue or anything that would help fix it.

#### Disclaimer

Goob is intended for research, educational, and legitimate business intelligence purposes. Users are responsible for ensuring their data collection activities comply with applicable laws, website terms of service, robots.txt policies, and privacy requirements.
