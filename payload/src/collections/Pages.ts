import type { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/HeroBlock'
import { ServiceCardsBlock } from '../blocks/ServiceCardsBlock'
import { PortfolioTeaserBlock } from '../blocks/PortfolioTeaserBlock'
import { PortfolioGridBlock } from '../blocks/PortfolioGridBlock'
import { PricingSectionBlock } from '../blocks/PricingSectionBlock'
import { CtaStripBlock } from '../blocks/CtaStripBlock'
import { ContactSectionBlock } from '../blocks/ContactSectionBlock'
import { ProductTeaserBlock } from '../blocks/ProductTeaserBlock'
import { ProductGridBlock } from '../blocks/ProductGridBlock'
import { TextWithImageBlock } from '../blocks/TextWithImageBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        ServiceCardsBlock,
        PortfolioTeaserBlock,
        PortfolioGridBlock,
        PricingSectionBlock,
        CtaStripBlock,
        ContactSectionBlock,
        ProductTeaserBlock,
        ProductGridBlock,
        TextWithImageBlock,
      ],
    },
  ],
}
