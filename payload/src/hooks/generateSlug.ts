/**
 * Shared `beforeValidate` hook factory that auto-generates a slug from a configured
 * source field on a collection.
 *
 * Usage:
 *   import { generateSlug } from '@/hooks/generateSlug'
 *
 *   export const BjTopics: CollectionConfig = {
 *     slug: 'bj-topics',
 *     hooks: { beforeValidate: [generateSlug({ sourceField: 'name' })] },
 *     fields: [
 *       { name: 'name', type: 'text', required: true },
 *       { name: 'slug', type: 'text', required: true, unique: true, index: true },
 *     ],
 *   }
 *
 * Behaviour:
 *   - Runs at `beforeValidate` so the slug exists before the `slug.required` validator
 *     fires (matching the existing inline precedent in SSP's ProductCategories.ts).
 *   - Slugifies the source field value (lowercase, hyphen-separated, ASCII-only).
 *   - Performs ONE collision query per save (`like '${base}%'` with a 100-row cap),
 *     then picks the lowest unused `-N` suffix from the in-memory result set.
 *   - On `update` excludes the current row's id so renaming-to-itself is a no-op.
 *   - Skips entirely when the user supplied an explicit slug, unless `alwaysRegenerate`
 *     is true.
 *
 * Race-window note: two simultaneous saves of identically-named rows can both pass the
 * lookup and conflict at DB write. Mitigation is the `unique: true` on the consuming
 * collection's slug field; the second write fails with a Payload validation error and
 * the user retries. Acknowledged in TASK-002's "Unexpected Outcomes" line.
 */

import type { CollectionBeforeValidateHook } from 'payload'

export type GenerateSlugOptions = {
  /** Field name to read the source string from. */
  sourceField: string
  /** Field name to write the slug into. Defaults to `'slug'`. */
  slugField?: string
  /**
   * If true, regenerate the slug whenever the source field changes (even if a slug
   * already exists). If false (default), only generate when the slug field is empty.
   */
  alwaysRegenerate?: boolean
}

/**
 * Hand-rolled slugify - no `slugify` npm dependency.
 *
 * Rules:
 *   - Lowercase.
 *   - NFKD normalise so composed accents decompose into base char + combining mark;
 *     the subsequent strip drops the combining marks but keeps the ASCII base char.
 *     Net effect: `Café` -> `cafe`, `naïve` -> `naive`. (This is a side-effect of
 *     NFKD that gives us Latin transliteration "for free" without pulling in the
 *     `slugify` npm package. Non-Latin scripts -- e.g. CJK, Cyrillic, Arabic --
 *     have no ASCII base char to fall back to and remain stripped entirely.)
 *   - Whitespace runs collapse to a single hyphen.
 *   - Strip every char that isn't `a-z`, `0-9`, or hyphen.
 *   - Collapse hyphen runs to one.
 *   - Trim leading/trailing hyphens.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\x00-\x7f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const generateSlug = (options: GenerateSlugOptions): CollectionBeforeValidateHook => {
  const { sourceField, slugField = 'slug', alwaysRegenerate = false } = options

  return async ({ data, operation, originalDoc, req, collection }) => {
    if (!data) return data

    const existingSlug = (data as Record<string, unknown>)[slugField] ?? originalDoc?.[slugField as keyof typeof originalDoc]

    // Respect editor-supplied slugs unless the caller opts into always-regenerate.
    if (!alwaysRegenerate && typeof existingSlug === 'string' && existingSlug.trim().length > 0) {
      return data
    }

    const sourceVal = (data as Record<string, unknown>)[sourceField] ?? originalDoc?.[sourceField as keyof typeof originalDoc]
    if (typeof sourceVal !== 'string' || sourceVal.trim() === '') return data

    const base = slugify(sourceVal)
    if (!base) {
      // Pathological input (e.g. all non-ASCII). Let the field's required validator
      // surface a plain-English error rather than writing an empty slug.
      return data
    }

    // Single collision query - acceptable per task spec's Unexpected Outcomes line.
    const existing = await req.payload.find({
      collection: collection.slug,
      where: {
        [slugField]: { like: `${base}%` },
        ...(operation === 'update' && originalDoc && 'id' in originalDoc && originalDoc.id != null
          ? { id: { not_equals: originalDoc.id } }
          : {}),
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const taken = new Set<string>(
      existing.docs
        .map((d) => (d as unknown as Record<string, unknown>)[slugField])
        .filter((v): v is string => typeof v === 'string'),
    )

    if (!taken.has(base)) {
      ;(data as Record<string, unknown>)[slugField] = base
    } else {
      let n = 2
      while (taken.has(`${base}-${n}`)) n++
      ;(data as Record<string, unknown>)[slugField] = `${base}-${n}`
    }

    return data
  }
}
