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
      admin: {
        placeholder: '#ff6b35',
        description: 'Hex colour code for the card accent (e.g. #ff6b35)',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
