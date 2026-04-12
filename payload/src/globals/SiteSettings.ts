import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navLinks',
      type: 'array',
      label: 'Navigation Links',
      admin: {
        description: 'Links shown in the main navigation bar.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Link Text' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'footerTagline',
      type: 'text',
      label: 'Footer Tagline',
      admin: {
        description: 'Short text displayed in the footer area.',
      },
    },
    {
      name: 'footerLinks',
      type: 'array',
      label: 'Footer Links',
      admin: {
        description: 'Links shown in the site footer.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Link Text' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Copyright Text',
      admin: {
        description: 'Copyright notice shown at the bottom of the site.',
      },
    },
    // --- Contact & Social ---
    {
      name: 'contactEmail',
      type: 'text',
      label: 'Contact Email',
      admin: {
        description: 'Contact form messages and order alerts are sent here.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Platform',
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Etsy', value: 'etsy' },
            { label: 'TikTok', value: 'tiktok' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
          admin: {
            description: 'Full URL including https://',
          },
        },
      ],
    },
  ],
}
