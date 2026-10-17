"use client";
import { tinaField } from "tinacms/dist/react";
import type { BlockProps } from "@skeleton-crew/blocks";
import { useBeforeMode } from "@/components/ThemeToggle";

type Button = { label?: string | null; url?: string | null; variant?: string | null };
export type AgencyHeroData = { heading?: string | null; text?: string | null; buttons?: (Button | null)[] | null; toggleLabel?: string | null };

/** Full-height home hero with the drifting gradient and the theirs/ours demo button. */
export function AgencyHero({ data }: BlockProps<AgencyHeroData>) {
  const { before, toggle } = useBeforeMode();
  return (
    <section className="ahero" id="top">
      <div className="ahero__bg" aria-hidden="true" />
      <div className="container ahero__content">
        <h1 className="ahero__headline" data-tina-field={tinaField(data, "heading")}>{data.heading}</h1>
        {data.text && <p className="ahero__sub" data-tina-field={tinaField(data, "text")}>{data.text}</p>}
        <div className="ahero__ctas">
          {(data.buttons ?? []).map((b, i) => b && (
            <a key={i} className={`btn btn--${b.variant || "ghost"}`} href={b.url || "#"} data-tina-field={tinaField(b)}>{b.label}</a>
          ))}
          {data.toggleLabel && (
            <button type="button" className="btn btn--primary ahero__toggle" aria-pressed={before} onClick={toggle} data-tina-field={tinaField(data, "toggleLabel")}>
              {before ? "Take me back" : data.toggleLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
