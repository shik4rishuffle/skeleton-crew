import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'tenant', 'role', 'createdAt'],
    group: 'Admin',
    listSearchableFields: ['email'],
  },
  access: {
    // Anyone in the same tenant can read other users in their tenant.
    read: ({ req }) => {
      if (!req.user) return false
      return { tenant: { equals: req.user.tenant } }
    },
    // Only authenticated users with role: 'admin' can create new users.
    // The new user's `tenant` is constrained by the beforeValidate hook
    // below so an admin cannot create a user in another tenant.
    create: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
    // Update: same tenant, admin role required.
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role !== 'admin') return false
      return { tenant: { equals: req.user.tenant } }
    },
    // Delete: same tenant, admin role required.
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role !== 'admin') return false
      return { tenant: { equals: req.user.tenant } }
    },
  },
  hooks: {
    beforeValidate: [
      async ({ req, data, operation }) => {
        if (!req.user) return data
        if (operation === 'create') {
          // Force the new row's tenant to the requesting admin's tenant.
          return { ...data, tenant: req.user.tenant }
        }
        if (operation === 'update') {
          // Disallow tenant changes after creation.
          if (data?.tenant && data.tenant !== req.user.tenant) {
            throw new APIError("You cannot change a user's tenant.", 400, undefined, true)
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'select',
      required: true,
      defaultValue: 'betterjustice',
      index: true,
      label: 'Tenant',
      options: [
        { label: 'Better Justice', value: 'betterjustice' },
        { label: 'Sel Sells Pottery', value: 'selsellspottery' },
        { label: 'Centrifungal', value: 'centrifungal' },
      ],
      admin: {
        description:
          'Which client this user manages content for. Set on creation; cannot be changed afterwards.',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description:
          'Admins can manage users, delete content, and access financial records. Editors can create and update content.',
      },
    },
  ],
}
