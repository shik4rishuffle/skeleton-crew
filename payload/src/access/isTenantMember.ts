import type { Access } from 'payload'

/**
 * Returns an Access callback that allows the request only when the
 * authenticated user's tenant matches the given tenant value.
 *
 * Usage:
 *   access: {
 *     read: isTenantMember('betterjustice'),
 *     create: isTenantMember('betterjustice'),
 *     update: isTenantMember('betterjustice'),
 *     delete: isTenantMember('betterjustice'),
 *   }
 *
 * The argument is the camelCase tenant ENUM VALUE on Users.tenant, not the
 * kebab `bj-` slug prefix. See architect-residuals-output.md section 4.
 */
export const isTenantMember = (tenantValue: string): Access =>
  ({ req }) => req.user?.tenant === tenantValue
