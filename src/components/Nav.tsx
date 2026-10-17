"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { tinaField } from "tinacms/dist/react";

type Link = { label?: string | null; url?: string | null };
type Globals = { site?: { name?: string | null; logo?: string | null } | null; nav?: { links?: (Link | null)[] | null } | null };

export default function Nav({ globals }: { globals: Globals | null | undefined }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const name = globals?.site?.name || "Skeleton Crew";
  const links = (globals?.nav?.links ?? []).filter((l): l is Link => !!l);
  const isCurrent = (url?: string | null) => !!url && url !== "/" && pathname.startsWith(url.replace(/\/$/, ""));
  return (
    <header className="nav" role="banner">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="nav__inner container">
        <a href="/" className="nav__logo" aria-label={`${name} home`}>
          {globals?.site?.logo && <img src={globals.site.logo} alt="" className="nav__logo-img" />}
          <span className="nav__logo-text" data-tina-field={globals?.site ? tinaField(globals.site, "name") : undefined}>{name}</span>
        </a>
        <nav className="nav__links" aria-label="Main navigation">
          {links.map((l, i) => <a key={i} href={l.url || "#"} className="nav__link" aria-current={isCurrent(l.url) ? "page" : undefined} data-tina-field={tinaField(l)}>{l.label}</a>)}
        </nav>
        <button className="nav__burger" type="button" aria-expanded={open} aria-controls="nav-overlay" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <span className="nav__burger-line" /><span className="nav__burger-line" /><span className="nav__burger-line" />
        </button>
      </div>
      <div className={`nav__overlay${open ? " is-active" : ""}`} id="nav-overlay" aria-hidden={!open}>
        <nav className="nav__overlay-links" aria-label="Mobile navigation">
          {links.map((l, i) => <a key={i} href={l.url || "#"} className="nav__overlay-link" onClick={() => setOpen(false)}>{l.label}</a>)}
        </nav>
      </div>
    </header>
  );
}
