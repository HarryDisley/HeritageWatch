// Central place for turning database enum values into the labels, colors,
// and short explanations shown across the site.
//
// Why one shared file: the project's core rule is that a site's status
// color means the same thing everywhere it appears (map, list, profile
// page). Keeping every mapping here — instead of re-deciding "what color is
// High Concern?" separately in each component — is what keeps that
// consistent as the site grows past these two pages.
import type {
  SiteStatus,
  ConfidenceLevel,
  ThreatCategoryType,
  DpiTier,
  SiteType,
} from "@prisma/client";

export const STATUS_META: Record<
  SiteStatus,
  { label: string; badgeClass: string; description: string }
> = {
  SAFE: {
    label: "Safe",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description:
      "No significant documented threats to this site's current survival, integrity, or accessibility.",
  },
  MODERATE_CONCERN: {
    label: "Moderate Concern",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    description:
      "Conservation or other pressures are documented, but without imminent risk to the site.",
  },
  HIGH_CONCERN: {
    label: "High Concern",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    description:
      "Serious, currently active threats are documented, or major historical damage remains substantially unrepaired.",
  },
  CRITICAL_CONCERN: {
    label: "Critical Concern",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    description:
      "Severe, currently active threats to the site's survival are documented by credible sources.",
  },
};

export const CONFIDENCE_META: Record<
  ConfidenceLevel,
  { label: string; description: string }
> = {
  CONFIRMED: {
    label: "Confirmed",
    description: "Multiple corroborating high-tier sources support this status.",
  },
  SUPPORTED: {
    label: "Supported",
    description: "Credible sources support this status, with some limits on corroboration.",
  },
  DEVELOPING: {
    label: "Developing",
    description: "The situation is actively changing and evidence is still emerging.",
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient Evidence",
    description: "Available sources are too limited to assess this status with confidence.",
  },
};

export const THREAT_CATEGORY_LABELS: Record<ThreatCategoryType, string> = {
  ARMED_CONFLICT: "Armed Conflict",
  NATURAL_DISASTER: "Natural Disaster",
  ENVIRONMENTAL_CLIMATE: "Environmental / Climate",
  CONSERVATION_STRUCTURAL: "Conservation / Structural",
};

export const DPI_TIER_META: Record<
  DpiTier,
  { label: string; description: string }
> = {
  EXTENSIVE: {
    label: "Extensive",
    description: "Well documented across most or all digital preservation categories.",
  },
  MODERATE: {
    label: "Moderate",
    description: "Documented in several categories, with some notable gaps.",
  },
  LIMITED: {
    label: "Limited",
    description: "Only a small amount of public digital documentation could be found.",
  },
  MINIMAL: {
    label: "Minimal",
    description: "Little to no public digital documentation could be found.",
  },
};

export const SITE_TYPE_LABELS: Record<SiteType, string> = {
  CULTURAL: "Cultural",
  NATURAL: "Natural",
  MIXED: "Mixed (Cultural & Natural)",
};

export function formatDate(date: Date | null): string {
  if (!date) return "Undated";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ---------- Countries, treaties and casebook ----------
// Countries and cases deliberately have NO status colors, scores or rankings.
// They show documented facts only. Membership cells use a symbol AND a word
// (never color alone) so they stay readable for colour-blind users.

import type { MembershipStatus, SourceTier, CaseType } from "@prisma/client";

// Fixed column order for the five instruments (alphabetical order of
// countries, never an order based on how many treaties a country has joined).
export const TREATY_ORDER = [
  "hague-1954",
  "hague-1954-first-protocol",
  "hague-1999-second-protocol",
  "world-heritage-1972",
  "rome-statute",
] as const;

export const TREATY_SHORT_LABELS: Record<string, string> = {
  "hague-1954": "1954 Hague Convention",
  "hague-1954-first-protocol": "1954 First Protocol",
  "hague-1999-second-protocol": "1999 Second Protocol",
  "world-heritage-1972": "1972 World Heritage Convention",
  "rome-statute": "Rome Statute (ICC)",
};

export const MEMBERSHIP_META: Record<
  MembershipStatus,
  { label: string; symbol: string; className: string }
> = {
  PARTY: {
    label: "Party",
    symbol: "✓",
    className: "text-neutral-900 font-medium",
  },
  SIGNED_NOT_RATIFIED: {
    label: "Signed only",
    symbol: "◐",
    className: "text-neutral-700",
  },
  NOT_PARTY: {
    label: "Not listed",
    symbol: "—",
    className: "text-neutral-500",
  },
};

export const SOURCE_TIER_LABELS: Record<SourceTier, string> = {
  TIER_1: "Tier 1: official or primary record",
  TIER_2: "Tier 2: institutional or academic",
  TIER_3: "Tier 3: reputable journalism",
  TIER_4: "Tier 4: reference only",
};

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  INTERNATIONAL_CRIMINAL: "International criminal case",
  INTERNATIONAL_COURT: "International court case",
  TRIBUNAL: "Tribunal case",
  SECURITY_COUNCIL_OR_UN_ACTION: "UN Security Council or UN action",
  RESTITUTION_OR_DISPUTE: "Restitution or dispute",
  OTHER: "Other international decision",
};

// "1958" from a parsed date, otherwise whatever raw string the register used.
export function membershipYear(
  date: Date | null,
  dateDisplay: string | null
): string | null {
  if (date) return String(date.getUTCFullYear());
  return dateDisplay && dateDisplay !== "not listed" ? dateDisplay : null;
}
