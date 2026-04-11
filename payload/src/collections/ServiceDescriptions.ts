import type { CollectionConfig } from 'payload'

export const ServiceDescriptions: CollectionConfig = {
  slug: 'service-descriptions',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'serviceKey',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Websites', value: 'websites' },
        { label: 'AI', value: 'ai' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
