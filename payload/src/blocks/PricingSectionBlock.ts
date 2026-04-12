import type { Block } from 'payload'

export const PricingSectionBlock: Block = {
  slug: 'pricingSectionBlock',
  labels: { singular: 'Pricing Section', plural: 'Pricing Sections' },
  fields: [
    { name: 'sectionHeading', type: 'text', required: true },
    { name: 'introText', type: 'text' },
    {
      name: 'tiers',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Tier', plural: 'Tiers' },
      fields: [
        { name: 'tierName', type: 'text', required: true },
        { name: 'audience', type: 'text', required: true },
        { name: 'price', type: 'text', required: true },
        {
          name: 'features',
          type: 'array',
          required: true,
          labels: { singular: 'Feature', plural: 'Features' },
          fields: [
            { name: 'feature', type: 'text', required: true },
          ],
        },
        { name: 'isFeatured', type: 'checkbox', defaultValue: false },
        { name: 'ctaText', type: 'text', defaultValue: 'Get started' },
        { name: 'ctaUrl', type: 'text', defaultValue: '/contact/' },
      ],
    },
    { name: 'linkText', type: 'text' },
    { name: 'linkUrl', type: 'text' },
  ],
}
