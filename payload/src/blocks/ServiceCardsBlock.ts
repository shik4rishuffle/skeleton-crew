import type { Block } from 'payload'

export const ServiceCardsBlock: Block = {
  slug: 'serviceCardsBlock',
  labels: { singular: 'Service Cards', plural: 'Service Cards' },
  fields: [
    { name: 'cards', type: 'array', required: true, minRows: 1, maxRows: 6, fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
    ]},
  ],
}
