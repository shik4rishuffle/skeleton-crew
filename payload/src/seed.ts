import { getPayload } from 'payload'
import config from './payload.config'

async function seed() {
  const payload = await getPayload({ config })

  // --- Page Heroes ---
  const pageHeroes = [
    {
      pageKey: 'homepage' as const,
      headline: "Websites that don't look like everyone else's.",
      subheadline: 'Bespoke web design and AI consulting for small UK businesses that refuse to settle.',
    },
    {
      pageKey: 'work' as const,
      headline: 'Our Work',
      subheadline: 'Real sites for real businesses. No templates, no compromise.',
    },
    {
      pageKey: 'services' as const,
      headline: 'What We Offer',
      subheadline: 'Two ways we help small businesses punch above their weight.',
    },
  ]

  for (const hero of pageHeroes) {
    try {
      const existing = await payload.find({
        collection: 'page-heroes',
        where: { pageKey: { equals: hero.pageKey } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`[skip] page-heroes: ${hero.pageKey} already exists`)
        continue
      }
      await payload.create({ collection: 'page-heroes', data: hero })
      console.log(`[created] page-heroes: ${hero.pageKey}`)
    } catch (err) {
      console.error(`[error] page-heroes: ${hero.pageKey} -`, err)
    }
  }

  // --- CTA Strips ---
  const ctaStrips = [
    {
      headline: 'Your competitors have a website. Do you?',
      buttonText: "Let's talk",
      buttonUrl: '/contact/',
    },
  ]

  for (const cta of ctaStrips) {
    try {
      const existing = await payload.find({
        collection: 'cta-strips',
        where: { headline: { equals: cta.headline } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`[skip] cta-strips: "${cta.headline}" already exists`)
        continue
      }
      await payload.create({ collection: 'cta-strips', data: cta })
      console.log(`[created] cta-strips: "${cta.headline}"`)
    } catch (err) {
      console.error(`[error] cta-strips: "${cta.headline}" -`, err)
    }
  }

  // --- Service Descriptions ---
  const serviceDescriptions = [
    {
      serviceKey: 'websites' as const,
      title: 'Website Builds',
      body: "We build websites that make your competitors nervous. No templates, no page builders, no compromise. Just a site that looks like yours and nobody else's.",
    },
    {
      serviceKey: 'ai' as const,
      title: 'AI Consulting',
      body: 'We find the repetitive tasks eating your day and replace them with AI that actually works. No hype, no jargon - just fewer hours wasted on things a machine should be doing.',
    },
  ]

  for (const service of serviceDescriptions) {
    try {
      const existing = await payload.find({
        collection: 'service-descriptions',
        where: { serviceKey: { equals: service.serviceKey } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`[skip] service-descriptions: ${service.serviceKey} already exists`)
        continue
      }
      await payload.create({ collection: 'service-descriptions', data: service })
      console.log(`[created] service-descriptions: ${service.serviceKey}`)
    } catch (err) {
      console.error(`[error] service-descriptions: ${service.serviceKey} -`, err)
    }
  }

  // --- Pricing Tiers ---
  const pricingTiers = [
    // Website tiers
    {
      tierName: 'Starter',
      category: 'website' as const,
      audience: 'For businesses getting online for the first time.',
      price: 'From \u00a3499',
      features: [
        { feature: 'One-page site that actually looks good' },
        { feature: 'Mobile-ready from day one' },
        { feature: 'Live in two weeks' },
      ],
      isFeatured: false,
      sortOrder: 1,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
    {
      tierName: 'Growth',
      category: 'website' as const,
      audience: 'For businesses ready to stand out.',
      price: 'From \u00a31,499',
      features: [
        { feature: 'Multi-page bespoke design' },
        { feature: 'Content managed by you' },
        { feature: 'Built to grow with your business' },
      ],
      isFeatured: true,
      sortOrder: 2,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
    {
      tierName: 'Premium',
      category: 'website' as const,
      audience: 'For businesses that want the full package.',
      price: 'From \u00a33,000',
      features: [
        { feature: 'Everything in Growth, plus' },
        { feature: 'Advanced features and integrations' },
        { feature: 'Priority support' },
      ],
      isFeatured: false,
      sortOrder: 3,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
    // AI tiers
    {
      tierName: 'Audit',
      category: 'ai' as const,
      audience: 'For businesses wondering where AI fits in.',
      price: 'From \u00a3299',
      features: [
        { feature: 'Full workflow review' },
        { feature: 'Written report with priorities' },
        { feature: 'Clear next steps - no fluff' },
      ],
      isFeatured: false,
      sortOrder: 1,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
    {
      tierName: 'Build',
      category: 'ai' as const,
      audience: 'For businesses ready to automate what matters.',
      price: '\u00a3800 - \u00a32,500',
      features: [
        { feature: 'One or two AI workflows built for you' },
        { feature: 'Integrated into your existing tools' },
        { feature: 'Trained to work without hand-holding' },
      ],
      isFeatured: true,
      sortOrder: 2,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
    {
      tierName: 'Retainer',
      category: 'ai' as const,
      audience: 'For businesses that want ongoing AI support.',
      price: '\u00a3300 - \u00a3600/mo',
      features: [
        { feature: 'Ongoing maintenance and updates' },
        { feature: 'New automations as you grow' },
        { feature: 'Monthly strategy call' },
      ],
      isFeatured: false,
      sortOrder: 3,
      ctaText: 'Get started',
      ctaUrl: '/contact/',
    },
  ]

  for (const tier of pricingTiers) {
    try {
      const existing = await payload.find({
        collection: 'pricing-tiers',
        where: {
          and: [
            { tierName: { equals: tier.tierName } },
            { category: { equals: tier.category } },
          ],
        },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`[skip] pricing-tiers: ${tier.tierName} (${tier.category}) already exists`)
        continue
      }
      await payload.create({ collection: 'pricing-tiers', data: tier })
      console.log(`[created] pricing-tiers: ${tier.tierName} (${tier.category})`)
    } catch (err) {
      console.error(`[error] pricing-tiers: ${tier.tierName} (${tier.category}) -`, err)
    }
  }

  // --- Portfolio Entries ---
  const portfolioEntries = [
    {
      projectName: 'Fungi & Forage',
      description: 'A bespoke website for a small mushroom growing business in the UK.',
      liveUrl: 'https://fungi-and-forage.example.co.uk',
      sortOrder: 1,
    },
  ]

  for (const entry of portfolioEntries) {
    try {
      const existing = await payload.find({
        collection: 'portfolio-entries',
        where: { projectName: { equals: entry.projectName } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`[skip] portfolio-entries: ${entry.projectName} already exists`)
        continue
      }
      await payload.create({ collection: 'portfolio-entries', data: entry })
      console.log(`[created] portfolio-entries: ${entry.projectName}`)
    } catch (err) {
      console.error(`[error] portfolio-entries: ${entry.projectName} -`, err)
    }
  }

  console.log('\nSeed complete.')
  process.exit(0)
}

seed()
