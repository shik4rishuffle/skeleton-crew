/* THIS FILE WAS GENERATED AUTOMATICALLY BY NEXT.JS */
import configPromise from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import './custom.scss'
import { importMap } from './admin/importMap'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
