import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Permanent_Marker } from "next/font/google";
import "@skeleton-crew/blocks/tokens.css";
import "../tokens.css";
import "@skeleton-crew/blocks/blocks.css";
import "./globals.css";
import "./before.css";

// Three fonts maximum: Permanent Marker for the hero, Bebas Neue for headings, DM Sans for body.
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-permanent-marker", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Skeleton Crew - Bespoke Web Design & AI Consulting", template: "%s - Skeleton Crew" },
  description: "Skeleton Crew - bespoke web design and AI consulting for small UK businesses",
  icons: { icon: "/assets/favicon.svg" },
  manifest: "/site.webmanifest",
};
export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${marker.variable} ${bebas.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
