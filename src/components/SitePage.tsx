"use client";
import { useTina } from "tinacms/dist/react";
import { Blocks, pick, useScrollEffects } from "@skeleton-crew/blocks";
import { blockNames } from "../../site.blocks";
import { localBlocks } from "@/blocks";
import Nav from "./Nav";
import Footer from "./Footer";
import ThemeToggle from "./ThemeToggle";

const site = pick(blockNames, localBlocks);
type TinaProps<T> = { data: T; query: string; variables: Record<string, unknown> };

export default function SitePage({ page, globals, portfolio = [] }: { page: TinaProps<any>; globals: TinaProps<any>; portfolio?: any[] }) {
  const { data } = useTina(page);
  const { data: g } = useTina(globals);
  useScrollEffects(data);
  return (
    <>
      <Nav globals={g.globals} />
      <main id="main">
        <Blocks blocks={data.page.blocks} components={site.components} context={{ globals: g.globals, portfolio }} />
      </main>
      <Footer globals={g.globals} />
      <ThemeToggle />
    </>
  );
}
