import type { CollectionConfig } from 'payload'

export const PageHeroes: CollectionConfig = {
  slug: 'page-heroes',
  admin: {
    useAsTitle: 'headline',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'pageKey',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Homepage', value: 'homepage' },
        { label: 'Work', value: 'work' },
        { label: 'Services', value: 'services' },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'subheadline',
      type: 'text',
    },
  ],
}
