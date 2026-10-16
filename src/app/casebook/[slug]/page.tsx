import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { truncate } from "@/lib/seo";
import {
  CASE_TYPE_LABELS,
  SOURCE_TIER_LABELS,
  formatDate,
} from "@/lib/display";
import type { CaseSection } from "@prisma/client";

export const dynamic = "force-dynamic";

type SourceLink = { id: string; url: string; publisher: string };

// Small "Sources:" line under a section. Defined outside the page component
// so React doesn't re-create it on every render.
function SectionSources({ sources }: { sources: SourceLink[] }) {
  if (sources.length === 0) return null;
  return (
    <p className="mt-2 text-xs text-neutral-500">
      Sources:{" "}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ", "}
          <a href={s.url} className="text-blue-700 hover:underline">
            {s.publisher}
          </a>
        </span>
      ))}
    </p>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.case.findUnique({
    where: { slug },
    select: { title: true, summary: true, reviewStatus: true },
  });
  if (!c || c.reviewStatus !== "APPROVED") return {};
  return {
    title: c.title,
    description: truncate(c.summary),
    alternates: { canonical: `/casebook/${slug}` },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const c = await prisma.case.findUnique({
    where: { slug },
    include: {
      events: {
        orderBy: { id: "asc" },
        include: { sources: { include: { source: true } } },
      },
      sources: { orderBy: [{ tier: "asc" }, { sourceKey: "asc" }] },
      sectionSources: { include: { source: true } },
      sites: { include: { site: true } },
      countries: { include: { country: true } },
    },
  });

  // Draft or unknown entries are never shown.
  if (!c || c.reviewStatus !== "APPROVED") notFound();

  const sourcesFor = (section: CaseSection) => {
    const seen = new Set<string>();
    return c.sectionSources
      .filter((s) => s.section === section)
      .map((s) => s.source)
      .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
  };

  const hasRelated = c.countries.length > 0 || c.sites.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/casebook" className="text-sm text-blue-700 hover:underline">
        &larr; Casebook
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-neutral-900">{c.title}</h1>
        <p className="mt-1 text-neutral-600">
          {CASE_TYPE_LABELS[c.caseType]} &middot; {c.body}
          {c.caseReference && <> &middot; {c.caseReference}</>}
        </p>
        {(c.startDateDisplay || c.endDateDisplay) && (
          <p className="mt-1 text-sm text-neutral-500">
            {c.startDateDisplay}
            {c.endDateDisplay && c.endDateDisplay !== c.startDateDisplay && (
              <> &ndash; {c.endDateDisplay}</>
            )}
          </p>
        )}
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Summary</h2>
        <p className="mt-2 leading-relaxed text-neutral-700">{c.summary}</p>
        <SectionSources sources={sourcesFor("SUMMARY")} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Legal basis</h2>
        <p className="mt-2 leading-relaxed text-neutral-700">{c.legalBasis}</p>
        <SectionSources sources={sourcesFor("LEGAL_BASIS")} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Outcome</h2>
        <p className="mt-2 leading-relaxed text-neutral-700">{c.outcome}</p>
        <SectionSources sources={sourcesFor("OUTCOME")} />
      </section>

      {c.events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">Timeline</h2>
          <ol className="mt-2 space-y-4 border-l-2 border-neutral-200 pl-4">
            {c.events.map((ev) => (
              <li key={ev.id}>
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {ev.dateDisplay === "not established"
                    ? "Date not established"
                    : ev.dateDisplay}
                </div>
                <div className="font-medium text-neutral-900">{ev.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  {ev.description}
                </p>
                {ev.sources.length > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Sources:{" "}
                    {ev.sources.map((link, i) => (
                      <span key={link.sourceId}>
                        {i > 0 && ", "}
                        <a
                          href={link.source.url}
                          className="text-blue-700 hover:underline"
                        >
                          {link.source.publisher}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {c.interpretation && (
        <section className="mt-8 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Interpretation
          </h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Attributed analysis, not established fact
          </p>
          <p className="mt-3 leading-relaxed text-neutral-700">
            {c.interpretation}
          </p>
          <SectionSources sources={sourcesFor("INTERPRETATION")} />
        </section>
      )}

      {hasRelated && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Connected pages
          </h2>
          <ul className="mt-2 space-y-2">
            {c.countries.map(({ country, role }) => (
              <li key={country.id}>
                <Link
                  href={`/countries/${country.slug}`}
                  className="text-blue-700 hover:underline"
                >
                  {country.name}
                </Link>
                {role && (
                  <span className="text-sm text-neutral-500"> &mdash; {role}</span>
                )}
              </li>
            ))}
            {c.sites.map(({ site }) => (
              <li key={site.id}>
                <Link
                  href={`/sites/${site.slug}`}
                  className="text-blue-700 hover:underline"
                >
                  {site.name}
                </Link>
                <span className="text-sm text-neutral-500"> &mdash; heritage site</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 border-t border-neutral-200 pt-6">
        <h2 className="text-lg font-semibold text-neutral-900">Sources</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {c.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} className="text-blue-700 hover:underline">
                {s.title}
              </a>{" "}
              <span className="text-neutral-500">
                &mdash; {s.publisher} &middot; {SOURCE_TIER_LABELS[s.tier]}
              </span>
              {s.reliabilityNote && (
                <p className="mt-1 text-xs text-amber-700">
                  Note: {s.reliabilityNote}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-neutral-500">
          Last checked {formatDate(c.lastVerifiedDate)}
          {c.approvedBy && (
            <>
              {" "}
              &middot; Approved by {c.approvedBy}
              {c.approvedDate && <> on {formatDate(c.approvedDate)}</>}
            </>
          )}
        </p>
      </section>
    </main>
  );
}
