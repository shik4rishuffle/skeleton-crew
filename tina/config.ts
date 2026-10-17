import { defineSiteConfig } from "@skeleton-crew/blocks/schema";
import { blockNames } from "../site.blocks";
import { agencyHeroTemplate } from "../src/blocks/agencyHero/template";

// Templates only in here: Tina's config bundler cannot load React or CSS.
export default defineSiteConfig({ blocks: blockNames, localTemplates: [agencyHeroTemplate], portfolio: true });
