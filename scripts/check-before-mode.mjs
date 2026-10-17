// Checks that every block the site opts into has at least one before-mode rule,
// so the theirs/ours demo never shows a half-transformed section.
import { readFileSync } from "node:fs";
const before = readFileSync(new URL("../src/app/before.css", import.meta.url), "utf8");
const list = readFileSync(new URL("../site.blocks.ts", import.meta.url), "utf8");
const names = [...list.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]).concat(["agencyHero"]);
// blocks that are pure token consumers need no override; list them explicitly
const tokenOnly = new Set(["richText", "textWithImage", "faq", "testimonials", "logoStrip", "pageHeading", "contactSection", "uspCards", "cta"]);
const classFor = { serviceCards: "services", pricing: "pricing", portfolioTeaser: "portfolio", portfolioGrid: "portfolio", agencyHero: "ahero" };
const missing = names.filter((n) => !tokenOnly.has(n) && !before.includes(`.${classFor[n] || n}`));
if (missing.length) { console.error("before-mode is missing rules for:", missing.join(", ")); process.exit(1); }
console.log(`before-mode covers ${names.length} blocks`);
