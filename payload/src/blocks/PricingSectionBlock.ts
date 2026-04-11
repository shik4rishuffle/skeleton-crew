import type { Block } from 'payload'

export const PricingSectionBlock: Block = {
  slug: 'pricingSectionBlock',
  labels: { singular: 'Pricing Section', plural: 'Pricing Sections' },
  fields: [
    { name: 'sectionHeading', type: 'text', required: true },
    { name: 'introText', type: 'text' },
    { name: 'category', type: 'select', required: true, options: [
      { label: 'Website', value: 'website' },
      { label: 'AI', value: 'ai' },
    ]},
    { name: 'linkText', type: 'text' },
    { name: 'linkUrl', type: 'text' },
  ],
}
