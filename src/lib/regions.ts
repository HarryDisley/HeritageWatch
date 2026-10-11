// The `region` field in each dossier is free text written by hand, and the
// values are not consistent - some are broad ("Europe") and some include
// extra detail ("South Asia (Kathmandu Valley, Nepal)"). For a filter menu
// we need a small, fixed list of choices, so this file maps any region
// string onto one broad group.
//
// Why a lookup in code instead of changing the data: it needs no database
// change and no re-import. The trade-off is that a brand-new kind of region
// text falls into "Other" until a rule is added here. The longer-term fix
// is to store a clean broad region on each site (a schema change we would
// discuss first).
export const REGION_GROUPS = [
  "Europe",
  "Middle East",
  "Asia",
  "Americas",
  "Oceania / Pacific",
  "Africa",
] as const;

export type RegionGroup = (typeof REGION_GROUPS)[number] | "Other";

// Order matters: the first matching rule wins. "South Asia" must be
// checked as Asia before anything else could claim it.
const RULES: { group: (typeof REGION_GROUPS)[number]; match: RegExp }[] = [
  { group: "Middle East", match: /^(middle east|west asia|near east)/i },
  { group: "Oceania / Pacific", match: /^(oceania|pacific|polynesia)/i },
  { group: "Europe", match: /^europe/i },
  { group: "Asia", match: /^(asia|south asia|southeast asia|east asia|central asia)/i },
  { group: "Americas", match: /^(americas?|north america|south america|latin america|central america|caribbean)/i },
  { group: "Africa", match: /^(africa|north africa|sub-saharan)/i },
];

export function getRegionGroup(region: string): RegionGroup {
  const text = region.trim();
  for (const rule of RULES) {
    if (rule.match.test(text)) return rule.group;
  }
  return "Other";
}
