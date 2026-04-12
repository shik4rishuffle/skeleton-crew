import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1600,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
