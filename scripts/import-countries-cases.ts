// Imports treaties, approved country dossiers and approved case dossiers
// into the database (schema: prisma/schema.prisma, "Standing expansion").
//
// Usage:
//   npm run import:countries-cases
//
// Rules (same spirit as import-dossiers.ts):
// - Treaties come from research/treaties.json (reference data, always upserted).
// - Countries: research/countries/approved/*.json, only review_status "approved".
// - Cases: research/cases/approved/*.json, only review_status "approved".
//   Countries are imported first so cases can link to them.
// - A country's memberships/sources and a case's events/sources/links are
//   replaced on each run (delete-then-recreate), so re-running is safe.
// - A link to a site or country that is not in the database yet is skipped
//   with a warning (never invented, never silently dropped).
// - Nothing is guessed: null stays null.

import { PrismaClient } from "@prisma/client";
import type {
  SourceTier,
  MembershipStatus,
  CaseType,
  CaseSection,
} from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const ROOT = process.cwd();

function mapTier(v: number): SourceTier {
  const map: Record<number, SourceTier> = {
    1: "TIER_1",
    2: "TIER_2",
    3: "TIER_3",
    4: "TIER_4",
  };
  const m = map[v];
  if (!m) throw new Error(`Unknown source tier: ${v}`);
  return m;
}

function mapMembership(v: string): MembershipStatus {
  const map: Record<string, MembershipStatus> = {
    party: "PARTY",
    signed_not_ratified: "SIGNED_NOT_RATIFIED",
    not_party: "NOT_PARTY",
  };
  const m = map[v];
  if (!m) throw new Error(`Unknown membership status: "${v}"`);
  return m;
}

const CASE_TYPES: CaseType[] = [
  "INTERNATIONAL_CRIMINAL",
  "INTERNATIONAL_COURT",
  "TRIBUNAL",
  "SECURITY_COUNCIL_OR_UN_ACTION",
  "RESTITUTION_OR_DISPUTE",
  "OTHER",
];
function mapCaseType(v: string): CaseType {
  const m = CASE_TYPES.find((t) => t === v);
  if (!m) throw new Error(`Unknown case_type: "${v}"`);
  return m;
}

const SECTIONS: CaseSection[] = [
  "SUMMARY",
  "LEGAL_BASIS",
  "OUTCOME",
  "INTERPRETATION",
];
function mapSection(v: string): CaseSection {
  const m = SECTIONS.find((s) => s === v);
  if (!m) throw new Error(`Unknown case section: "${v}"`);
  return m;
}

// Only unambiguous full dates (YYYY-MM-DD) are parsed; the raw string is
// kept in the *Display fields.
function parseFullDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function jsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f));
}

async function importTreaties() {
  const file = path.join(ROOT, "research", "treaties.json");
  const treaties = JSON.parse(fs.readFileSync(file, "utf-8"));
  for (const t of treaties) {
    await prisma.treaty.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        name: t.name,
        adoptedYear: t.adoptedYear ?? null,
        depositary: t.depositary ?? null,
        description: t.description,
      },
      update: {
        name: t.name,
        adoptedYear: t.adoptedYear ?? null,
        depositary: t.depositary ?? null,
        description: t.description,
      },
    });
  }
  console.log(`Treaties: ${treaties.length} upserted.`);
}

async function importCountry(filePath: string) {
  const d = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (d.review_status !== "approved") {
    console.log(`  Skipping ${d.slug}: review_status is "${d.review_status}", not "approved".`);
    return false;
  }
  console.log(`  Importing country ${d.slug}...`);

  await prisma.$transaction(
    async (tx) => {
      const data = {
        name: d.name,
        isoCode: d.iso_code,
        region: d.region,
        summary: d.summary,
        reviewStatus: "APPROVED" as const,
        approvedBy: d.approved_by ?? null,
        approvedDate: parseFullDate(d.approved_date ?? null),
        lastVerifiedDate: parseFullDate(d.last_verified_date ?? null),
        changelog: d.changelog ?? undefined,
      };
      const country = await tx.country.upsert({
        where: { slug: d.slug },
        create: { slug: d.slug, ...data },
        update: data,
      });

      // Replace children. Memberships first (they point at sources).
      await tx.treatyMembership.deleteMany({ where: { countryId: country.id } });
      await tx.countrySource.deleteMany({ where: { countryId: country.id } });
      await tx.siteCountry.deleteMany({ where: { countryId: country.id } });

      const sourceIdByKey = new Map<string, string>();
      for (const s of d.sources ?? []) {
        const created = await tx.countrySource.create({
          data: {
            countryId: country.id,
            sourceKey: s.source_id,
            title: s.title,
            publisher: s.publisher,
            url: s.url,
            sourceType: s.source_type,
            tier: mapTier(s.tier),
            reliabilityNote: s.reliability_note ?? null,
            publishedDate: parseFullDate(s.published_date ?? null),
            publishedDateDisplay: s.published_date_display ?? null,
            accessedDate: parseFullDate(s.accessed_date ?? null),
          },
        });
        sourceIdByKey.set(s.source_id, created.id);
      }

      for (const m of d.treaty_memberships ?? []) {
        const treaty = await tx.treaty.findUnique({ where: { slug: m.treaty_slug } });
        if (!treaty) {
          throw new Error(`Unknown treaty_slug "${m.treaty_slug}" in ${d.slug}. Run the treaties import first.`);
        }
        const sourceId = m.source_id ? sourceIdByKey.get(m.source_id) : undefined;
        if (m.source_id && !sourceId) {
          throw new Error(`Unknown source_id "${m.source_id}" in ${d.slug}`);
        }
        await tx.treatyMembership.create({
          data: {
            countryId: country.id,
            treatyId: treaty.id,
            status: mapMembership(m.status),
            actionType: m.action_type ?? null,
            date: parseFullDate(m.date ?? null),
            dateDisplay: m.date_display ?? null,
            note: m.note ?? null,
            sourceId: sourceId ?? null,
          },
        });
      }

      for (const slug of d.site_slugs ?? []) {
        const site = await tx.site.findUnique({ where: { slug } });
        if (!site) {
          console.warn(`    WARNING: site "${slug}" not in database; link skipped.`);
          continue;
        }
        await tx.siteCountry.create({ data: { siteId: site.id, countryId: country.id } });
      }
    },
    { timeout: 30000, maxWait: 10000 }
  );
  return true;
}

async function importCase(filePath: string) {
  const d = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (d.review_status !== "approved") {
    console.log(`  Skipping ${d.slug}: review_status is "${d.review_status}", not "approved".`);
    return false;
  }
  console.log(`  Importing case ${d.slug}...`);

  await prisma.$transaction(
    async (tx) => {
      const data = {
        title: d.title,
        caseType: mapCaseType(d.case_type),
        body: d.body,
        caseReference: d.case_reference ?? null,
        summary: d.summary,
        legalBasis: d.legal_basis,
        outcome: d.outcome,
        interpretation: d.interpretation ?? null,
        startDate: parseFullDate(d.start_date ?? null),
        startDateDisplay: d.start_date_display ?? null,
        endDate: parseFullDate(d.end_date ?? null),
        endDateDisplay: d.end_date_display ?? null,
        reviewStatus: "APPROVED" as const,
        approvedBy: d.approved_by ?? null,
        approvedDate: parseFullDate(d.approved_date ?? null),
        lastVerifiedDate: parseFullDate(d.last_verified_date ?? null),
        changelog: d.changelog ?? undefined,
      };
      const c = await tx.case.upsert({
        where: { slug: d.slug },
        create: { slug: d.slug, ...data },
        update: data,
      });

      // Replace children (cascade handles the link tables on source/event delete).
      await tx.caseSectionSource.deleteMany({ where: { caseId: c.id } });
      await tx.caseEvent.deleteMany({ where: { caseId: c.id } });
      await tx.caseSource.deleteMany({ where: { caseId: c.id } });
      await tx.caseSite.deleteMany({ where: { caseId: c.id } });
      await tx.caseCountry.deleteMany({ where: { caseId: c.id } });

      const sourceIdByKey = new Map<string, string>();
      for (const s of d.sources ?? []) {
        const created = await tx.caseSource.create({
          data: {
            caseId: c.id,
            sourceKey: s.source_id,
            title: s.title,
            publisher: s.publisher,
            url: s.url,
            sourceType: s.source_type,
            tier: mapTier(s.tier),
            reliabilityNote: s.reliability_note ?? null,
            publishedDate: parseFullDate(s.published_date ?? null),
            publishedDateDisplay: s.published_date_display ?? null,
            accessedDate: parseFullDate(s.accessed_date ?? null),
          },
        });
        sourceIdByKey.set(s.source_id, created.id);
      }
      const resolve = (keys: string[] | undefined): string[] =>
        (keys ?? []).map((k) => {
          const id = sourceIdByKey.get(k);
          if (!id) throw new Error(`Unknown source_id "${k}" in case ${d.slug}`);
          return id;
        });

      for (const ev of d.timeline ?? []) {
        const created = await tx.caseEvent.create({
          data: {
            caseId: c.id,
            date: parseFullDate(ev.date ?? null),
            dateDisplay: ev.date_display,
            title: ev.title,
            description: ev.description,
          },
        });
        for (const sourceId of resolve(ev.source_ids)) {
          await tx.caseEventSource.create({
            data: { caseEventId: created.id, sourceId },
          });
        }
      }

      for (const [section, keys] of Object.entries(d.section_sources ?? {})) {
        for (const sourceId of resolve(keys as string[])) {
          await tx.caseSectionSource.create({
            data: { caseId: c.id, section: mapSection(section), sourceId },
          });
        }
      }

      for (const slug of d.site_slugs ?? []) {
        const site = await tx.site.findUnique({ where: { slug } });
        if (!site) {
          console.warn(`    WARNING: site "${slug}" not in database; link skipped.`);
          continue;
        }
        await tx.caseSite.create({ data: { caseId: c.id, siteId: site.id } });
      }

      for (const link of d.country_links ?? []) {
        const country = await tx.country.findUnique({ where: { slug: link.country_slug } });
        if (!country) {
          console.warn(`    WARNING: country "${link.country_slug}" not in database yet; link skipped.`);
          continue;
        }
        await tx.caseCountry.create({
          data: { caseId: c.id, countryId: country.id, role: link.role ?? null },
        });
      }
    },
    { timeout: 30000, maxWait: 10000 }
  );
  return true;
}

async function main() {
  await importTreaties();

  const countryFiles = jsonFiles(path.join(ROOT, "research", "countries", "approved"));
  console.log(`Countries: ${countryFiles.length} file(s) in research/countries/approved`);
  let c = 0;
  for (const f of countryFiles) if (await importCountry(f)) c++;

  const caseFiles = jsonFiles(path.join(ROOT, "research", "cases", "approved"));
  console.log(`Cases: ${caseFiles.length} file(s) in research/cases/approved`);
  let k = 0;
  for (const f of caseFiles) if (await importCase(f)) k++;

  console.log(`\nImport summary: ${c} country dossier(s), ${k} case dossier(s) imported.`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
