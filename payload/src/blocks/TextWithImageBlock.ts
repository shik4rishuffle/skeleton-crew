import type { Block } from 'payload'

export const TextWithImageBlock: Block = {
  slug: 'textWithImageBlock',
  labels: { singular: 'Text with Image', plural: 'Text with Image' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body Text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      label: 'Image Position',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      admin: {
        description: 'Which side the image appears on.',
      },
    },
  ],
}
