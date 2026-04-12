import type { GlobalConfig } from 'payload'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  admin: {
    group: 'Shop',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'stripePublicKey',
      type: 'text',
      label: 'Stripe Public Key',
      admin: {
        description: 'Your Stripe publishable key (starts with pk_).',
      },
    },
    {
      name: 'shippingCostPence',
      type: 'number',
      required: true,
      min: 0,
      label: 'Shipping Cost (pence)',
      admin: {
        description: 'Flat rate shipping in pence. E.g. 495 = GBP 4.95.',
      },
    },
    {
      name: 'freeShippingThresholdPence',
      type: 'number',
      min: 0,
      defaultValue: 0,
      label: 'Free Shipping Threshold (pence)',
      admin: {
        description: 'Orders above this amount get free shipping. Set to 0 to disable.',
      },
    },
    {
      name: 'shopAnnouncementText',
      type: 'text',
      label: 'Shop Announcement',
      admin: {
        description: 'Optional banner text shown on the shop page. E.g. All items handmade - please allow 5-7 days.',
      },
    },
  ],
}
