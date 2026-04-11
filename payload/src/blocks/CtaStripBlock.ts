import type { Block } from 'payload'

export const CtaStripBlock: Block = {
  slug: 'ctaStripBlock',
  labels: { singular: 'CTA Strip', plural: 'CTA Strips' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'buttonText', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true, defaultValue: '/contact/' },
  ],
}
