import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultSort: 'sortOrder',
    group: 'Shop',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data && typeof data.stock === 'number' && data.stock < 0) {
          data.stock = 0
        }
        return data
      },
    ],
  },
  fields: [
    // --- Main content area ---
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Product Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Auto-generated from name. Used in product URLs.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      label: 'Product Photos',
      admin: {
        description: 'First image is the main photo. Drag to reorder.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Photo',
        },
      ],
    },
    // --- Sidebar fields ---
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 1,
      label: 'Price (pence)',
      admin: {
        position: 'sidebar',
        description: 'Enter price in pence. E.g. 2500 = GBP 25.00.',
      },
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 1,
      label: 'Stock',
      admin: {
        position: 'sidebar',
        description: 'How many are available. Set to 0 when sold out.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured on Homepage',
      admin: {
        position: 'sidebar',
        description: 'Show this product in the homepage featured section.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: false,
      label: 'Category',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first in the shop.',
      },
    },
    // --- Technical Details (collapsed) ---
    {
      name: 'technicalDetails',
      type: 'collapsible',
      label: 'Technical Details',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'sku',
          type: 'text',
          unique: true,
          label: 'SKU',
          admin: {
            description: 'Product code for your records.',
          },
        },
        {
          name: 'dimensions',
          type: 'text',
          label: 'Dimensions',
          admin: {
            description: 'E.g. 12cm x 8cm.',
          },
        },
      ],
    },
  ],
}
