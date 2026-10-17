"use client";
import { tinaField } from "tinacms/dist/react";

type Link = { label?: string | null; url?: string | null };
type Globals = { site?: { name?: string | null; logo?: string | null } | null; footer?: { about?: string | null; links?: (Link | null)[] | null; copyright?: string | null } | null };

export default function Footer({ globals }: { globals: Globals | null | undefined }) {
  const year = new Date().getFullYear();
  const f = globals?.footer;
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__line" aria-hidden="true" />
      <div className="footer__inner container">
        <div className="footer__brand">
          <a href="/" className="footer__logo" aria-label={`${globals?.site?.name || ""} home`}>
            {globals?.site?.logo ? <img src={globals.site.logo} alt={globals?.site?.name || ""} className="footer__logo-img" /> : <span className="nav__logo-text">{globals?.site?.name}</span>}
          </a>
          {f?.about && <p className="footer__tagline" data-tina-field={tinaField(f, "about")}>{f.about}</p>}
        </div>
        <nav className="footer__nav" aria-label="Footer navigation">
          {(f?.links ?? []).map((l, i) => l && <a key={i} href={l.url || "#"} className="footer__link" data-tina-field={tinaField(l)}>{l.label}</a>)}
        </nav>
        <p className="footer__copy">&copy; {year} <span data-tina-field={f ? tinaField(f, "copyright") : undefined}>{f?.copyright || globals?.site?.name}</span></p>
      </div>
    </footer>
  );
}
