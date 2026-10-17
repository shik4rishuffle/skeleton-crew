import type { BlockDefinition } from "@skeleton-crew/blocks";
import { agencyHeroTemplate } from "./template";
import { AgencyHero, type AgencyHeroData } from "./AgencyHero";
export const agencyHero: BlockDefinition<AgencyHeroData> = { name: "agencyHero", template: agencyHeroTemplate, component: AgencyHero };
