import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { truncate } from "@/lib/seo";
import {
  MEMBERSHIP_META,
  TREATY_ORDER,
  SOURCE_TIER_LABELS,
  CASE_TYPE_LABELS,
  formatDate,
  membershipYear,
} from "@/lib/display";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = await prisma.country.findUnique({
    where: { slug },
    select: { name: true, summary: true, reviewStatus: true },
  });
  if (!country || country.reviewStatus !== "APPROVED") return {};
  return {
    title: `${country.name}: heritage treaty record`,
    description: truncate(country.summary),
    alternates: { canonical: `/countries/${slug}` },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      memberships: { include: { treaty: true, source: true } },
      sources: { orderBy: { sourceKey: "asc" } },
      sites: { include: { site: true } },
      cases: { include: { case: true } },
    },
  });

  // Draft or unknown countries are never shown.
  if (!country || country.reviewStatus !== "APPROVED") notFound();

  const memberships = [...country.memberships].sort(
    (a, b) =>
      TREATY_ORDER.indexOf(a.treaty.slug as (typeof TREATY_ORDER)[number]) -
      TREATY_ORDER.indexOf(b.treaty.slug as (typeof TREATY_ORDER)[number])
  );
  const publishedCases = country.cases.filter(
    (cc) => cc.case.reviewStatus === "APPROVED"
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/countries" className="text-sm text-blue-700 hover:underline">
        &larr; All countries
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-neutral-900">{country.name}</h1>
        <p className="mt-1 text-neutral-600">
          {country.region} &middot; ISO {country.isoCode}
        </p>
      </header>

      <p className="mt-6 leading-relaxed text-neutral-700">{country.summary}</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Commitments</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Status as shown on the official registers on the date we checked.
          Joining a treaty is a legal commitment; it does not show how well it
          is kept.
        </p>
        <ul className="mt-3 space-y-3">
          {memberships.map((m) => {
            const meta = MEMBERSHIP_META[m.status];
            const year = membershipYear(m.date, m.dateDisplay);
            return (
              <li
                key={m.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="font-medium text-neutral-900">
                  {m.treaty.name}
                </div>
                <div className={`mt-1 text-sm ${meta.className}`}>
                  <span aria-hidden="true">{meta.symbol}</span> {meta.label}
                  {m.actionType && <> &middot; {m.actionType}</>}
                  {year && <> &middot; {m.dateDisplay ?? year}</>}
                </div>
                {m.note && (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {m.note}
                  </p>
                )}
                {m.source && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Source:{" "}
                    <a
                      href={m.source.url}
                      className="text-blue-700 hover:underline"
                    >
                      {m.source.publisher}
                    </a>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-neutral-500">
          Instruments not shown here have not been researched yet. They are not
          assumed to be absent.
        </p>
      </section>

      {country.sites.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">Sites</h2>
          <ul className="mt-2 space-y-2">
            {country.sites.map(({ site }) => (
              <li key={site.id}>
                <Link
                  href={`/sites/${site.slug}`}
                  className="text-blue-700 hover:underline"
                >
                  {site.name}
                </Link>{" "}
                <span className="text-sm text-neutral-500">
                  &mdash; {site.region}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {publishedCases.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Related cases
          </h2>
          <ul className="mt-2 space-y-2">
            {publishedCases.map(({ case: c, role }) => (
              <li key={c.id}>
                <Link
                  href={`/casebook/${c.slug}`}
                  className="text-blue-700 hover:underline"
                >
                  {c.title}
                </Link>{" "}
                <span className="text-sm text-neutral-500">
                  &mdash; {CASE_TYPE_LABELS[c.caseType]}
                  {role && <> ({role})</>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 border-t border-neutral-200 pt-6">
        <h2 className="text-lg font-semibold text-neutral-900">Sources</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {country.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} className="text-blue-700 hover:underline">
                {s.title}
              </a>{" "}
              <span className="text-neutral-500">
                &mdash; {s.publisher} &middot; {SOURCE_TIER_LABELS[s.tier]}
                {s.publishedDateDisplay && <> &middot; {s.publishedDateDisplay}</>}
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
          Last checked against the registers{" "}
          {formatDate(country.lastVerifiedDate)}
          {country.approvedBy && (
            <>
              {" "}
              &middot; Approved by {country.approvedBy}
              {country.approvedDate && <> on {formatDate(country.approvedDate)}</>}
            </>
          )}
        </p>
      </section>
    </main>
  );
}
