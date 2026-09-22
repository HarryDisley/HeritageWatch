# HeritageWatch Source Hierarchy

Full definitions live in `research-methodology-workflow.md` §6 (project docs). Quick reference:

- **Tier 1 — Primary/official:** UNESCO (World Heritage List, Danger List, State of Conservation reports), national heritage/culture ministries, official ALIPH/Blue Shield/UNOSAT reports, ICOMOS official reports, UN-affiliated reporting (e.g. UN News)
- **Tier 2 — Institutional/academic:** peer-reviewed publications, established universities/museums, established heritage-focused NGOs and quasi-governmental heritage bodies
- **Tier 3 — Reputable journalism:** major wire services and established outlets, always dated
- **Tier 4 — Reference/bootstrap:** Wikipedia, Wikidata — fine for basic metadata only, never the sole source for a status, confidence, or DPI claim

**Core claims vs. basic metadata:**
- *Core claims* (require a per-claim `source_ids` citation): threats, documented damage, recent developments/events, conservation problems, status rationale, digital-preservation evidence
- *Basic metadata* (needs one dossier-level `metadata_sources[]` entry, not per-field citation): site name, alternate names, country, region, coordinates, UNESCO ID/status, site type, inscription/designation year

See the pilot-batch methodology notes for open questions about tier classification (e.g., quasi-governmental heritage charities) surfaced during the first real dossiers.
