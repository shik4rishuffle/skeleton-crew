import type { CollectionConfig } from 'payload'

export const CtaStrips: CollectionConfig = {
  slug: 'cta-strips',
  admin: {
    useAsTitle: 'headline',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonText',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonUrl',
      type: 'text',
      required: true,
      defaultValue: '/contact/',
    },
  ],
}
