import type { CollectionConfig } from 'payload'

export const PortfolioEntries: CollectionConfig = {
  slug: 'portfolio-entries',
  admin: {
    useAsTitle: 'projectName',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'projectName',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'screenshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'liveUrl',
      type: 'text',
    },
    {
      name: 'brandColour',
      type: 'text',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
