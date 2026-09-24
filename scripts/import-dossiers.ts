// Imports approved dossier JSON files (research/dossiers/approved/*.json)
// into the database, using the schema in prisma/schema.prisma.
//
// Usage:
//   npx tsx scripts/import-dossiers.ts
//
// What it does and doesn't do:
// - Only imports dossiers with review_status === "approved". Draft dossiers
//   are skipped and reported, never imported half-finished.
// - Site, ThreatCategory, Event, Source and DigitalPreservationEvidence rows
//   are replaced on each run (delete-then-recreate for that site), so this
//   script is safe to re-run after editing an approved dossier.
// - StatusEntry rows are the one exception: they are APPEND-ONLY, per
//   methodology §17. A status_history entry is only inserted if a row with
//   the same site, status, and effectiveDate doesn't already exist. Existing
//   StatusEntry rows are never deleted or edited by this script.
// - It does not invent data. A field the JSON has as null (e.g.
//   first_identified_date) is imported as null, not guessed.

import { PrismaClient } from "@prisma/client";
import type {
  SiteStatus,
  ConfidenceLevel,
  ThreatCategoryType,
  SourceTier,
  DpiCategory,
  DpiTier,
  SiteType,
} from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const DOSSIER_DIR = path.join(
  process.cwd(),
  "research",
  "dossiers",
  "approved"
);

// ---------- Enum mapping helpers ----------
// The dossiers use lowercase_snake_case strings; Prisma enums use UPPER_SNAKE_CASE.
// Mapping explicitly (rather than a blind toUpperCase()) means an unexpected
// value in a dossier throws a clear error instead of silently importing junk.

function mapStatus(value: string): SiteStatus {
  const map: Record<string, SiteStatus> = {
    safe: "SAFE",
    moderate_concern: "MODERATE_CONCERN",
    high_concern: "HIGH_CONCERN",
    critical_concern: "CRITICAL_CONCERN",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown status value: "${value}"`);
  return mapped;
}

function mapConfidence(value: string): ConfidenceLevel {
  const map: Record<string, ConfidenceLevel> = {
    confirmed: "CONFIRMED",
    supported: "SUPPORTED",
    developing: "DEVELOPING",
    insufficient_evidence: "INSUFFICIENT_EVIDENCE",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown confidence value: "${value}"`);
  return mapped;
}

function mapThreatCategory(value: string): ThreatCategoryType {
  const map: Record<string, ThreatCategoryType> = {
    armed_conflict: "ARMED_CONFLICT",
    natural_disaster: "NATURAL_DISASTER",
    environmental_climate: "ENVIRONMENTAL_CLIMATE",
    conservation_structural: "CONSERVATION_STRUCTURAL",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown threat category value: "${value}"`);
  return mapped;
}

function mapSourceTier(value: number): SourceTier {
  const map: Record<number, SourceTier> = {
    1: "TIER_1",
    2: "TIER_2",
    3: "TIER_3",
    4: "TIER_4",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown source tier value: ${value}`);
  return mapped;
}

function mapDpiCategory(value: string): DpiCategory {
  const map: Record<string, DpiCategory> = {
    photographic: "PHOTOGRAPHIC",
    archival_records: "ARCHIVAL_RECORDS",
    "3d_documentation": "THREE_D_DOCUMENTATION",
    virtual_tour: "VIRTUAL_TOUR",
    academic_scholarly: "ACADEMIC_SCHOLARLY",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown DPI category value: "${value}"`);
  return mapped;
}

function mapDpiTier(value: string): DpiTier {
  const map: Record<string, DpiTier> = {
    extensive: "EXTENSIVE",
    moderate: "MODERATE",
    limited: "LIMITED",
    minimal: "MINIMAL",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown DPI tier value: "${value}"`);
  return mapped;
}

function mapSiteType(value: string): SiteType {
  const map: Record<string, SiteType> = {
    cultural: "CULTURAL",
    natural: "NATURAL",
    mixed: "MIXED",
  };
  const mapped = map[value];
  if (!mapped) throw new Error(`Unknown site type value: "${value}"`);
  return mapped;
}

// Only accept unambiguous full dates (YYYY-MM-DD). Anything else (null,
// "", a year-month like "2018-12", a range like "2024-11/2024-12", or
// "not established") is left unparsed — the raw string is kept separately
// wherever the schema has a *Display field for it.
function parseFullDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------- Main import ----------

async function importDossier(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const dossier = JSON.parse(raw);

  if (dossier.review_status !== "approved") {
    console.log(
      `  Skipping ${dossier.slug ?? filePath}: review_status is "${dossier.review_status}", not "approved".`
    );
    return { skipped: true, slug: dossier.slug };
  }

  console.log(`  Importing ${dossier.slug} ("${dossier.name}")...`);

  await prisma.$transaction(async (tx) => {
    // 1. Upsert the Site row itself.
    const site = await tx.site.upsert({
      where: { slug: dossier.slug },
      create: {
        slug: dossier.slug,
        name: dossier.name,
        alternateNames: dossier.alternate_names ?? [],
        country: dossier.country,
        region: dossier.region,
        latitude: dossier.coordinates.lat,
        longitude: dossier.coordinates.lng,
        coordinateNote: dossier.coordinate_note ?? null,
        unescoId: dossier.unesco_id ?? null,
        inscriptionYear: dossier.inscription_year ?? null,
        unescoListingName: dossier.unesco_listing_name ?? null,
        isSerialComponent: dossier.is_serial_component ?? false,
        serialComponentNote: dossier.serial_component_note ?? null,
        siteType: mapSiteType(dossier.site_type),
        significanceSummary: dossier.significance_summary,
        dpiTier: dossier.digital_preservation?.tier_recommendation
          ? mapDpiTier(dossier.digital_preservation.tier_recommendation)
          : null,
        dpiCoverageNote: dossier.digital_preservation?.coverage_note ?? null,
        reviewStatus: "APPROVED",
        approvedBy: dossier.status_history?.at(-1)?.approved_by ?? null,
        approvedDate: parseFullDate(
          dossier.status_history?.at(-1)?.approved_date ?? null
        ),
        lastVerifiedDate: parseFullDate(dossier.last_verified_date ?? null),
        editorialChecklist: dossier.editorial_checklist ?? undefined,
        changelog: dossier.changelog ?? undefined,
      },
      update: {
        name: dossier.name,
        alternateNames: dossier.alternate_names ?? [],
        country: dossier.country,
        region: dossier.region,
        latitude: dossier.coordinates.lat,
        longitude: dossier.coordinates.lng,
        coordinateNote: dossier.coordinate_note ?? null,
        unescoId: dossier.unesco_id ?? null,
        inscriptionYear: dossier.inscription_year ?? null,
        unescoListingName: dossier.unesco_listing_name ?? null,
        isSerialComponent: dossier.is_serial_component ?? false,
        serialComponentNote: dossier.serial_component_note ?? null,
        siteType: mapSiteType(dossier.site_type),
        significanceSummary: dossier.significance_summary,
        dpiTier: dossier.digital_preservation?.tier_recommendation
          ? mapDpiTier(dossier.digital_preservation.tier_recommendation)
          : null,
        dpiCoverageNote: dossier.digital_preservation?.coverage_note ?? null,
        reviewStatus: "APPROVED",
        approvedBy: dossier.status_history?.at(-1)?.approved_by ?? null,
        approvedDate: parseFullDate(
          dossier.status_history?.at(-1)?.approved_date ?? null
        ),
        lastVerifiedDate: parseFullDate(dossier.last_verified_date ?? null),
        editorialChecklist: dossier.editorial_checklist ?? undefined,
        changelog: dossier.changelog ?? undefined,
      },
    });

    // 2. Replace Sources for this site (dossier's src_XX id -> new Source row).
    await tx.source.deleteMany({ where: { siteId: site.id } });
    const sourceIdByKey = new Map<string, string>();
    for (const s of dossier.sources ?? []) {
      const created = await tx.source.create({
        data: {
          siteId: site.id,
          sourceKey: s.source_id,
          title: s.title,
          publisher: s.publisher,
          url: s.url,
          sourceType: s.source_type,
          tier: mapSourceTier(s.tier),
          reliabilityNote: s.reliability_note ?? null,
          publishedDate: parseFullDate(s.published_date),
          publishedDateDisplay: s.published_date || null,
          accessedDate: parseFullDate(s.accessed_date),
        },
      });
      sourceIdByKey.set(s.source_id, created.id);
    }

    const resolveSourceIds = (keys: string[] | undefined) =>
      (keys ?? [])
        .map((k) => sourceIdByKey.get(k))
        .filter((id): id is string => Boolean(id));

    // 3. Metadata sources (dossier-level, cite basic fields like name/coordinates).
    await tx.siteMetadataSource.deleteMany({ where: { siteId: site.id } });
    for (const sourceId of resolveSourceIds(dossier.metadata_sources)) {
      await tx.siteMetadataSource.create({
        data: { siteId: site.id, sourceId },
      });
    }

    // 4. Threat categories.
    await tx.threatCategory.deleteMany({ where: { siteId: site.id } });
    for (const tc of dossier.threat_categories ?? []) {
      const created = await tx.threatCategory.create({
        data: {
          siteId: site.id,
          category: mapThreatCategory(tc.category),
          evidenceSummary: tc.evidence_summary,
          firstIdentifiedDate: parseFullDate(tc.first_identified_date),
          dateNote: tc.date_note ?? null,
        },
      });
      for (const sourceId of resolveSourceIds(tc.source_ids)) {
        await tx.threatCategorySource.create({
          data: { threatCategoryId: created.id, sourceId },
        });
      }
    }

    // 5. Events.
    await tx.event.deleteMany({ where: { siteId: site.id } });
    for (const ev of dossier.events ?? []) {
      const created = await tx.event.create({
        data: {
          siteId: site.id,
          date: parseFullDate(ev.date),
          dateDisplay: String(ev.date),
          title: ev.title,
          description: ev.description,
          eventType: ev.event_type,
        },
      });
      for (const sourceId of resolveSourceIds(ev.source_ids)) {
        await tx.eventSource.create({
          data: { eventId: created.id, sourceId },
        });
      }
    }

    // 6. Digital Preservation Index evidence.
    await tx.digitalPreservationEvidence.deleteMany({
      where: { siteId: site.id },
    });
    for (const ev of dossier.digital_preservation?.evidence ?? []) {
      await tx.digitalPreservationEvidence.create({
        data: {
          siteId: site.id,
          category: mapDpiCategory(ev.category),
          description: ev.description,
          url: ev.url ?? null,
          sourceId: ev.source_id ? sourceIdByKey.get(ev.source_id) : null,
        },
      });
    }

    // 7. Status history — APPEND-ONLY. Only insert entries that don't
    // already exist (matched on site + status + effectiveDate). Never
    // delete or edit an existing StatusEntry.
    for (const sh of dossier.status_history ?? []) {
      const effectiveDate = parseFullDate(sh.effective_date);
      if (!effectiveDate) {
        throw new Error(
          `${dossier.slug}: status_history entry has an unparseable effective_date "${sh.effective_date}" — status entries must have a real date.`
        );
      }
      const existing = await tx.statusEntry.findFirst({
        where: {
          siteId: site.id,
          status: mapStatus(sh.status),
          effectiveDate,
        },
      });
      if (existing) continue;

      const created = await tx.statusEntry.create({
        data: {
          siteId: site.id,
          status: mapStatus(sh.status),
          confidence: mapConfidence(sh.confidence),
          decisionTrigger: sh.decision_trigger,
          rationale: sh.rationale,
          effectiveDate,
          recordedBy: sh.recorded_by,
          approvedBy: sh.approved_by ?? null,
          approvedDate: parseFullDate(sh.approved_date),
          approvalNote: sh.approval_note ?? null,
        },
      });
      for (const sourceId of resolveSourceIds(sh.source_ids)) {
        await tx.statusEntrySource.create({
          data: { statusEntryId: created.id, sourceId },
        });
      }
    }
  });

  console.log(`  Done: ${dossier.slug}`);
  return { skipped: false, slug: dossier.slug };
}

async function main() {
  if (!fs.existsSync(DOSSIER_DIR)) {
    throw new Error(`Dossier directory not found: ${DOSSIER_DIR}`);
  }

  const files = fs
    .readdirSync(DOSSIER_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(DOSSIER_DIR, f));

  if (files.length === 0) {
    console.log(`No dossier JSON files found in ${DOSSIER_DIR}`);
    return;
  }

  console.log(`Found ${files.length} dossier file(s) in ${DOSSIER_DIR}:`);
  const results = [];
  for (const file of files) {
    results.push(await importDossier(file));
  }

  const imported = results.filter((r) => !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  console.log("\nImport summary:");
  console.log(`  Imported: ${imported.map((r) => r.slug).join(", ") || "(none)"}`);
  if (skipped.length > 0) {
    console.log(`  Skipped (not approved): ${skipped.map((r) => r.slug).join(", ")}`);
  }
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
