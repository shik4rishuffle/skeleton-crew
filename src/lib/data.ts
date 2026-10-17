import { client } from "../../tina/__generated__/client";
import { PageDocument, GlobalsDocument } from "../../tina/__generated__/types";
import { loadDocument, listDocuments, listCollection, parsePageRichText } from "@skeleton-crew/blocks/server";
import { pickTemplates } from "@skeleton-crew/blocks/templates";
import { blockNames } from "../../site.blocks";
import { agencyHeroTemplate } from "@/blocks/agencyHero/template";

const templates = pickTemplates(blockNames, [agencyHeroTemplate]);

export async function loadPage(slug: string) {
  const relativePath = `${slug}.json`;
  return loadDocument(() => client.queries.page({ relativePath }), {
    key: "page",
    collectionPath: "content/pages",
    relativePath,
    query: PageDocument,
    variables: { relativePath },
    transform: (raw) => parsePageRichText(raw, templates),
  });
}

export async function loadGlobals() {
  const relativePath = "site.json";
  return loadDocument(() => client.queries.globals({ relativePath }), {
    key: "globals",
    collectionPath: "content/globals",
    relativePath,
    query: GlobalsDocument,
    variables: { relativePath },
  });
}

export const listPages = () => listDocuments("content/pages");
export const loadPortfolio = () => listCollection<{ name: string }>("content/portfolio");
