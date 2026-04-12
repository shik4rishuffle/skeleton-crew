import type { Block } from 'payload'

export const ProductGridBlock: Block = {
  slug: 'productGridBlock',
  labels: { singular: 'Product Grid', plural: 'Product Grids' },
  fields: [
    {
      name: 'sectionHeading',
      type: 'text',
      label: 'Heading',
    },
    {
      name: 'enableFiltering',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Category Filters',
      admin: {
        description: 'Show filter buttons above the product grid.',
      },
    },
  ],
}
