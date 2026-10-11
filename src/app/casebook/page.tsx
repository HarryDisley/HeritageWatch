import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CaseList, { type CaseRow } from "@/components/CaseList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Casebook",
  description:
    "Court cases and international decisions about protecting cultural heritage, summarised in plain language with every claim traced to a source.",
};

export default async function CasebookPage() {
  // Only approved entries are ever shown publicly.
  const cases = await prisma.case.findMany({
    where: { reviewStatus: "APPROVED" },
    orderBy: { title: "asc" },
    include: { countries: { include: { country: true } } },
  });

  const rows: CaseRow[] = cases.map((c) => ({
    slug: c.slug,
    title: c.title,
    caseType: c.caseType,
    body: c.body,
    years:
      c.startDateDisplay && c.endDateDisplay && c.startDateDisplay !== c.endDateDisplay
        ? `${c.startDateDisplay.slice(0, 4)}–${c.endDateDisplay.slice(0, 4)}`
        : c.startDateDisplay
          ? c.startDateDisplay.slice(0, 4)
          : null,
    countries: c.countries.map((cc) => cc.country.name),
    summary: c.summary,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        &larr; Map
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-neutral-900">Casebook</h1>
      <p className="mt-2 leading-relaxed text-neutral-700">
        Court cases and international decisions where heritage and law meet,
        written in plain language. Each entry separates what the official record
        says from analysis, and every claim links to its sources.
      </p>
      <div className="mt-8">
        {rows.length === 0 ? (
          <p className="text-neutral-600">No entries have been published yet.</p>
        ) : (
          <CaseList rows={rows} />
        )}
      </div>
    </main>
  );
}
