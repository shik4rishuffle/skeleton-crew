import type { Block } from 'payload'

export const PortfolioTeaserBlock: Block = {
  slug: 'portfolioTeaserBlock',
  labels: { singular: 'Portfolio Teaser', plural: 'Portfolio Teasers' },
  fields: [
    { name: 'sectionHeading', type: 'text', required: true },
    { name: 'maxItems', type: 'number', defaultValue: 3 },
    { name: 'linkText', type: 'text' },
    { name: 'linkUrl', type: 'text' },
  ],
}
