import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { PortfolioEntries } from './collections/PortfolioEntries'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { ShopSettings } from './globals/ShopSettings'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL, process.env.POTTERY_FRONTEND_URL].filter(Boolean) as string[],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Media,
    Orders,
    Pages,
    PortfolioEntries,
    ProductCategories,
    Products,
  ],
  globals: [SiteSettings, ShopSettings],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  secret: process.env.PAYLOAD_SECRET || '',
})
