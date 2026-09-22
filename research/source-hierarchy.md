# HeritageWatch Source Hierarchy

Full definitions live in `research-methodology-workflow.md` §6 (project docs). Quick reference:

- **Tier 1 — Primary/official:** UNESCO (World Heritage List, Danger List, State of Conservation reports), national heritage/culture ministries, official ALIPH/Blue Shield/UNOSAT reports, ICOMOS official reports, UN-affiliated reporting (e.g. UN News)
- **Tier 2 — Institutional/academic:** peer-reviewed publications, established universities/museums, established heritage-focused NGOs and quasi-governmental heritage bodies
- **Tier 3 — Reputable journalism:** major wire services and established outlets, always dated
- **Tier 4 — Reference/bootstrap:** Wikipedia, Wikidata — fine for basic metadata only, never the sole source for a status, confidence, or DPI claim

**A tier is a floor, not a guarantee.** Sources within a tier are not all equally reliable. Any `sources[]` entry may carry an optional `reliability_note` flagging a specific concern (unclear editorial standards, single uncorroborated claim, etc.). A source carrying a `reliability_note` cannot, by itself, support a status-determining core claim — treat it like Tier 4 for that purpose, regardless of its nominal tier.

**Core claims vs. basic metadata:**
- *Core claims* (require a per-claim `source_ids` citation): threats, documented damage, recent developments/events, conservation problems, status rationale, digital-preservation evidence
- *Basic metadata* (needs one dossier-level `metadata_sources[]` entry, not per-field citation): site name, alternate names, country, region, coordinates, UNESCO ID/status, site type, inscription/designation year

**Accuracy over completeness.** A real historical event that cannot be adequately sourced is omitted from `events[]`, not filled in on a weak or Tier-4-only source. Note the gap in the dossier's `changelog` if worth flagging for future research.
