import type { Block } from 'payload'

export const ContactSectionBlock: Block = {
  slug: 'contactSectionBlock',
  labels: { singular: 'Contact Section', plural: 'Contact Sections' },
  fields: [
    { name: 'contactEmail', type: 'text' },
  ],
}
