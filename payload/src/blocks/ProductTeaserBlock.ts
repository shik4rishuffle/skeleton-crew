import type { Block } from 'payload'

export const ProductTeaserBlock: Block = {
  slug: 'productTeaserBlock',
  labels: { singular: 'Product Teaser', plural: 'Product Teasers' },
  fields: [
    {
      name: 'sectionHeading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        description: 'E.g. Featured Pieces',
      },
    },
    {
      name: 'maxItems',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      label: 'Max Products to Show',
    },
    {
      name: 'linkText',
      type: 'text',
      label: 'Button Text',
      admin: {
        description: 'E.g. View all',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Button Link',
      admin: {
        description: 'E.g. /shop',
      },
    },
  ],
}
