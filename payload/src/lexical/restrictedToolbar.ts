/**
 * Restricted Lexical editor config used by every BJ rich-text field.
 *
 * Allowed editor capabilities:
 *   - Bold, italic
 *   - Link (with URL validation - see `./linkValidation.ts`)
 *   - Headings H2, H3, H4 (H1 is reserved for page templates)
 *   - Bullet list, ordered list
 *   - Paragraph (implicit base node)
 *   - Fixed toolbar (sticky at the top of the field) + inline toolbar (selection-driven)
 *
 * Deliberately excluded:
 *   - Raw HTML, custom classes, inline styles
 *   - Image embeds (UploadFeature) - belong to specific blocks, not inline rich text
 *   - Inline doc references (RelationshipFeature) - too powerful for editor use
 *   - Blockquote, horizontal rule, checklist, indent, align, text colour / state
 *   - Underline, strikethrough, inline code, sub/superscript
 *   - Tables, raw blocks, HTML conversion
 *
 * Pasted HTML containing `<script>` tags or any node type not declared by the
 * registered features is dropped by Lexical's paste handler before it reaches
 * the DB - the feature set IS the sanitisation surface.
 *
 * The link drawer's URL field is validated server-side via the `fields` builder;
 * a `javascript:` or `data:` URI is rejected with a plain-English error message.
 *
 * Wiring (illustrative; this task ships the helper only - per-collection adoption
 * is owned by TASK-025+):
 *
 *   import { restrictedToolbar } from '@/lexical/restrictedToolbar'
 *
 *   // Field-level (preferred for predictability):
 *   { name: 'abstract', type: 'richText', editor: restrictedToolbar }
 *
 *   // Or as a collection-level editor override.
 */

import type { Field, FieldAffectingData } from 'payload'
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isValidLinkUrl } from './linkValidation'

export const restrictedToolbar = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({
      fields: ({ defaultFields }): (Field | FieldAffectingData)[] =>
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'url') {
            return {
              ...field,
              validate: (value: unknown) => {
                if (typeof value !== 'string' || value.trim() === '') {
                  return 'A URL is required.'
                }
                return isValidLinkUrl(value)
                  ? true
                  : 'Enter an absolute URL beginning with http:// or https://, or an internal path beginning with /.'
              },
            } as Field
          }
          return field
        }),
    }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
