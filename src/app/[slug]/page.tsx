import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import { listPages, loadGlobals, loadPage, loadPortfolio } from "@/lib/data";

export async function generateStaticParams() {
  const slugs = await listPages();
  return slugs.filter((s) => s !== "home").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  const seo = page.data.page.seo;
  return { title: seo?.metaTitle || page.data.page.title, description: seo?.metaDescription || undefined, robots: seo?.noIndex ? { index: false } : undefined };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, globals, portfolio] = await Promise.all([loadPage(slug), loadGlobals(), loadPortfolio()]);
  return <SitePage page={page} globals={globals} portfolio={portfolio} />;
}
