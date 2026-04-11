import type { CollectionConfig } from 'payload'

export const PricingTiers: CollectionConfig = {
  slug: 'pricing-tiers',
  admin: {
    useAsTitle: 'tierName',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'tierName',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Website', value: 'website' },
        { label: 'AI', value: 'ai' },
      ],
    },
    {
      name: 'audience',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'text',
      required: true,
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
    },
    {
      name: 'ctaText',
      type: 'text',
      defaultValue: 'Get started',
    },
    {
      name: 'ctaUrl',
      type: 'text',
      defaultValue: '/contact/',
    },
  ],
}
