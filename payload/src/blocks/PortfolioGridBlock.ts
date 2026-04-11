import type { Block } from 'payload'

export const PortfolioGridBlock: Block = {
  slug: 'portfolioGridBlock',
  labels: { singular: 'Portfolio Grid', plural: 'Portfolio Grids' },
  fields: [
    { name: 'sectionHeading', type: 'text' },
    { name: 'showAll', type: 'checkbox', defaultValue: true },
  ],
}
