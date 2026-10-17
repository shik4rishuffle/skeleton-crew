import type { Template } from "tinacms";
import { buttonsField } from "@skeleton-crew/blocks/fields";

export const agencyHeroTemplate: Template = {
  name: "agencyHero",
  label: "Hero (Skeleton Crew)",
  ui: { defaultItem: { heading: "Websites that don't look like everyone else's.", toggleLabel: "See what everyone else gives you" } },
  fields: [
    { type: "string", name: "heading", label: "Heading" },
    { type: "string", name: "text", label: "Text", ui: { component: "textarea" } },
    buttonsField("buttons", "Buttons", 2),
    { type: "string", name: "toggleLabel", label: "Theirs/ours toggle button label (blank to hide)" },
  ],
};
