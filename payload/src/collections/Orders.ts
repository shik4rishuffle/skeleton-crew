import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderRef',
    defaultSort: '-createdAt',
    group: 'Shop',
    listSearchableFields: ['orderRef', 'customerName', 'customerEmail'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // --- Order Summary (collapsible is presentational-only, no name = no nesting) ---
    {
      type: 'collapsible',
      label: 'Order Summary',
      fields: [
        {
          name: 'orderRef',
          type: 'text',
          required: true,
          unique: true,
          label: 'Order Reference',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'createdAt',
          type: 'date',
          required: true,
          label: 'Order Date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'customerName',
          type: 'text',
          required: true,
          label: 'Customer Name',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'customerEmail',
          type: 'text',
          required: true,
          label: 'Customer Email',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalAmount',
          type: 'number',
          required: true,
          label: 'Total (pence)',
          admin: {
            readOnly: true,
            description: 'Total including shipping, in pence.',
          },
        },
        {
          name: 'shippingCost',
          type: 'number',
          required: true,
          label: 'Shipping (pence)',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // --- Items ---
    {
      type: 'collapsible',
      label: 'Items',
      fields: [
        {
          name: 'items',
          type: 'json',
          required: true,
          label: 'Items Ordered',
          admin: {
            readOnly: true,
            description: 'Snapshot of products at time of purchase.',
          },
        },
      ],
    },
    // --- Fulfilment (primary working section - not collapsed) ---
    {
      name: 'fulfilmentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Fulfilment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Requires Attention', value: 'requires-attention' },
      ],
    },
    {
      name: 'trackingNumber',
      type: 'text',
      label: 'Tracking Number',
      admin: {
        description: 'Royal Mail tracking number.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Internal notes - not visible to customers.',
      },
    },
    // --- Payment Details (collapsed) ---
    {
      type: 'collapsible',
      label: 'Payment Details',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'stripePaymentStatus',
          type: 'select',
          required: true,
          label: 'Payment Status',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
            { label: 'Requires Attention', value: 'requires-attention' },
          ],
        },
        {
          name: 'stripeSessionId',
          type: 'text',
          required: true,
          unique: true,
          label: 'Stripe Session ID',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // --- Shipping Address (collapsed) ---
    {
      type: 'collapsible',
      label: 'Shipping Address',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'shippingAddress',
          type: 'json',
          required: true,
          label: 'Shipping Address',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
}
