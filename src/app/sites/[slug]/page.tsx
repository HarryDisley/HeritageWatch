import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  STATUS_META,
  CONFIDENCE_META,
  THREAT_CATEGORY_LABELS,
  DPI_TIER_META,
  SITE_TYPE_LABELS,
  formatDate,
} from "@/lib/display";

export const dynamic = "force-dynamic";

// One template for every site's profile page, rather than a separate
// hand-written page per site. Both Stonehenge and Ancient City of Aleppo
// render from this file today; adding a third approved site later means
// adding a dossier and re-running the importer, not writing a new page.
export default async function SiteProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      statusEntries: { orderBy: { effectiveDate: "desc" } },
      threatCategories: {
        include: { sources: { include: { source: true } } },
      },
      events: {
        orderBy: { createdAt: "asc" },
        include: { sources: { include: { source: true } } },
      },
      dpiEvidence: { include: { source: true } },
      sources: true,
      metadataSources: { include: { source: true } },
    },
  });

  if (!site) notFound();

  const currentStatus = site.statusEntries[0] ?? null;
  const pastStatuses = site.statusEntries.slice(1);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        &larr; All sites
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-neutral-900">{site.name}</h1>
        <p className="mt-1 text-neutral-600">
          {site.region}, {site.country} &middot; {SITE_TYPE_LABELS[site.siteType]} site
          {site.unescoId && (
            <>
              {" "}
              &middot; UNESCO World Heritage property #{site.unescoId}
            </>
          )}
        </p>

        {currentStatus && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${STATUS_META[currentStatus.status].badgeClass}`}
            >
              {STATUS_META[currentStatus.status].label}
            </span>
            <span className="rounded-full border border-neutral-300 bg-neutral-50 px-4 py-1.5 text-sm text-neutral-700">
              Confidence: {CONFIDENCE_META[currentStatus.confidence].label}
            </span>
            <span className="text-sm text-neutral-500">
              as of {formatDate(currentStatus.effectiveDate)}
            </span>
          </div>
        )}
      </header>

      {site.isSerialComponent && site.serialComponentNote && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          <strong>Part of a serial UNESCO listing</strong>
          {site.unescoListingName && <> ({site.unescoListingName})</>}.{" "}
          {site.serialComponentNote}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">
          Significance
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          {site.significanceSummary}
        </p>
      </section>

      {currentStatus && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Current Status Rationale
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-700">
            {currentStatus.rationale}
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            {STATUS_META[currentStatus.status].description}{" "}
            {CONFIDENCE_META[currentStatus.confidence].description}
          </p>
        </section>
      )}

      {site.threatCategories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Threat Categories
          </h2>
          <div className="mt-2 space-y-4">
            {site.threatCategories.map((tc) => (
              <div
                key={tc.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="font-medium text-neutral-900">
                  {THREAT_CATEGORY_LABELS[tc.category]}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {tc.evidenceSummary}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  First identified:{" "}
                  {tc.firstIdentifiedDate
                    ? formatDate(tc.firstIdentifiedDate)
                    : "Not established"}
                  {tc.dateNote && <> — {tc.dateNote}</>}
                </p>
                {tc.sources.length > 0 && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Sources:{" "}
                    {tc.sources.map((link, i) => (
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
              </div>
            ))}
          </div>
        </section>
      )}

      {site.events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Historical Timeline
          </h2>
          <ol className="mt-2 space-y-4 border-l-2 border-neutral-200 pl-4">
            {site.events.map((event) => (
              <li key={event.id}>
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {event.dateDisplay === "not established"
                    ? "Date not established"
                    : event.dateDisplay}
                </div>
                <div className="font-medium text-neutral-900">
                  {event.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  {event.description}
                </p>
                {event.sources.length > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Sources:{" "}
                    {event.sources.map((link, i) => (
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

      {site.dpiTier && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Digital Preservation Index
          </h2>
          <p className="mt-2 text-sm text-neutral-700">
            Overall coverage:{" "}
            <strong>{DPI_TIER_META[site.dpiTier].label}</strong> &mdash;{" "}
            {DPI_TIER_META[site.dpiTier].description}
          </p>
          {site.dpiCoverageNote && (
            <p className="mt-2 text-sm text-neutral-500">
              {site.dpiCoverageNote}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {site.dpiEvidence.map((ev) => (
              <li
                key={ev.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm"
              >
                <div className="font-medium text-neutral-900">
                  {ev.category
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/^\w|\s\w/g, (c) => c.toUpperCase())}
                </div>
                <p className="mt-1 text-neutral-700">{ev.description}</p>
                {ev.url && (
                  <a
                    href={ev.url}
                    className="mt-1 inline-block text-blue-700 hover:underline"
                  >
                    View source
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {pastStatuses.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Status History
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            HeritageWatch keeps every past status on record rather than
            overwriting it — this is the full history for this site.
          </p>
          <ul className="mt-3 space-y-2">
            {pastStatuses.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm"
              >
                <span
                  className={`rounded-full border px-3 py-1 font-medium ${STATUS_META[s.status].badgeClass}`}
                >
                  {STATUS_META[s.status].label}
                </span>
                <span className="text-neutral-500">
                  {formatDate(s.effectiveDate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {site.sources.length > 0 && (
        <section className="mt-8 border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold text-neutral-900">Sources</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {site.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} className="text-blue-700 hover:underline">
                  {s.title}
                </a>{" "}
                <span className="text-neutral-500">
                  &mdash; {s.publisher}
                  {s.reliabilityNote && (
                    <span className="text-amber-700"> (flagged: context only)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
