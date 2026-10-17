import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import { loadGlobals, loadPage, loadPortfolio } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPage("home");
  const seo = page.data.page.seo;
  return { title: { absolute: seo?.metaTitle || "Skeleton Crew - Bespoke Web Design & AI Consulting" }, description: seo?.metaDescription || undefined, robots: seo?.noIndex ? { index: false } : undefined };
}

export default async function Home() {
  const [page, globals, portfolio] = await Promise.all([loadPage("home"), loadGlobals(), loadPortfolio()]);
  return <SitePage page={page} globals={globals} portfolio={portfolio} />;
}
