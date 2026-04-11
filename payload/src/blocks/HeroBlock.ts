import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'heroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'text' },
    { name: 'style', type: 'select', defaultValue: 'short', options: [
      { label: 'Full (homepage)', value: 'full' },
      { label: 'Short (subpage)', value: 'short' },
    ]},
    { name: 'ctas', type: 'array', fields: [
      { name: 'text', type: 'text', required: true },
      { name: 'url', type: 'text', required: true },
      { name: 'style', type: 'select', defaultValue: 'ghost', options: [
        { label: 'Ghost', value: 'ghost' },
        { label: 'Primary', value: 'primary' },
      ]},
    ]},
    { name: 'toggleButtonText', type: 'text', admin: { description: 'If set, shows the before/after toggle button. Homepage only.' } },
  ],
}
