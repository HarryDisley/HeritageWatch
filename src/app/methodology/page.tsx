import Link from "next/link";
import {
  STATUS_META,
  CONFIDENCE_META,
  DPI_TIER_META,
} from "@/lib/display";
import type { SiteStatus, ConfidenceLevel, DpiTier } from "@prisma/client";

const STATUS_ORDER: SiteStatus[] = [
  "SAFE",
  "MODERATE_CONCERN",
  "HIGH_CONCERN",
  "CRITICAL_CONCERN",
];

const CONFIDENCE_ORDER: ConfidenceLevel[] = [
  "CONFIRMED",
  "SUPPORTED",
  "DEVELOPING",
  "INSUFFICIENT_EVIDENCE",
];

const DPI_ORDER: DpiTier[] = ["EXTENSIVE", "MODERATE", "LIMITED", "MINIMAL"];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Methodology</h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-700">
        Every status on HeritageWatch is based on documented evidence from
        named sources, and every classification is reviewed and personally
        approved by a person before it&apos;s published — never generated or
        published automatically. This page explains exactly how that works.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          The four statuses
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          Every site is classified into one of four descriptive statuses —
          never a numerical risk score. A score implies a precision this kind
          of evidence can&apos;t actually support; a named category, backed by
          a written rationale you can read yourself, is more honest about
          what we do and don&apos;t know.
        </p>
        <div className="mt-4 space-y-3">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4"
            >
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_META[status].badgeClass}`}
              >
                {STATUS_META[status].label}
              </span>
              <p className="text-sm text-neutral-700">
                {STATUS_META[status].description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          Confidence, kept separate from status
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          Alongside its status, every site also carries a confidence level —
          how well the currently available evidence actually supports that
          status. Confidence never changes which status a site gets; the two
          are reported honestly side by side. A site can be{" "}
          <strong>High Concern</strong> with <strong>Developing</strong>{" "}
          confidence, meaning the situation is serious but still unfolding
          and the evidence is still coming in — rather than forcing more
          certainty than the evidence actually supports.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONFIDENCE_ORDER.map((level) => (
            <div
              key={level}
              className="rounded-lg border border-neutral-200 p-4"
            >
              <div className="font-medium text-neutral-900">
                {CONFIDENCE_META[level].label}
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {CONFIDENCE_META[level].description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          Current conditions, not a running tally of history
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          A site&apos;s full history is never hidden — every recorded event
          and every past status stays on its profile page permanently, in a
          timeline and a status history anyone can read. But a site&apos;s{" "}
          <em>current</em> status describes its condition as of the most
          recent review, not a cumulative tally of everything that has ever
          happened to it. Historical damage that has since been repaired or
          stabilized doesn&apos;t keep a site at an elevated status forever.
        </p>
        <p className="mt-3 leading-relaxed text-neutral-700">
          Historical damage is documented in the site&apos;s record, but the
          current classification is based on present conditions and the most
          recent credible evidence.
        </p>
        <div className="mt-4 space-y-3 text-sm text-neutral-700">
          <div className="rounded-lg border border-neutral-200 p-4">
            <strong>Stonehenge</strong> is a good example of this in the
            direction of improvement: a proposed road tunnel near the
            monument raised serious concern between 2020 and 2024, and
            UNESCO came close to an official &ldquo;in danger&rdquo;
            listing over it. That episode is preserved permanently in{" "}
            <Link
              href="/sites/stonehenge"
              className="text-blue-700 hover:underline"
            >
              Stonehenge&apos;s timeline
            </Link>
            , but the tunnel project was cancelled and its planning consent
            formally revoked — so the current Moderate Concern status
            reflects that the acute threat has passed, not the
            2020&ndash;2024 episode itself.
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <strong>Ancient City of Aleppo</strong> shows the other side of
            it: the site suffered severe, well-documented damage during
            2012&ndash;2016 fighting, permanently recorded in{" "}
            <Link
              href="/sites/ancient-city-of-aleppo"
              className="text-blue-700 hover:underline"
            >
              its timeline
            </Link>
            . Its current High Concern status isn&apos;t based on that old
            damage by itself — it&apos;s based on the fact that repair of the
            site remains substantially incomplete today, and the wider
            region has continued to see unrest. That&apos;s a present, not
            just historical, concern.
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          Where the information comes from
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          Sources are weighed in a rough hierarchy: primary/official sources
          (UNESCO, national heritage ministries, and organizations like
          ALIPH, Blue Shield, and UNOSAT) carry the most weight; then
          institutional and academic sources (peer-reviewed research,
          universities, museums, established heritage organizations); then
          reputable journalism (major wire services and established news
          outlets); and finally reference sources like Wikipedia, used only
          to confirm basic facts such as a site&apos;s name or coordinates —
          never as the sole support for a threat claim or a status.
        </p>
        <p className="mt-3 leading-relaxed text-neutral-700">
          Being a higher-tier source isn&apos;t an automatic guarantee of
          reliability — an individual source can still be flagged if its
          evidence doesn&apos;t hold up to scrutiny, and a flagged source can
          never, by itself, be the basis for a status. Every site profile
          lists its actual sources, so you can check the evidence yourself
          rather than take our word for it.
        </p>
        <p className="mt-3 leading-relaxed text-neutral-700">
          AI assists with researching and drafting site profiles, but it
          does not decide or publish classifications on its own — every
          status is personally reviewed and approved by a person before it
          goes live.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          Digital Preservation Index
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          Separately from threat status, HeritageWatch tracks how
          extensively each site has been documented and made publicly
          accessible online — across five categories: professional
          photography, archival/official records, 3D digital documentation
          (laser scans or photogrammetry), virtual tours, and academic
          publications. Like the status system, this is a descriptive tier,
          not a numeric score.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DPI_ORDER.map((tier) => (
            <div
              key={tier}
              className="rounded-lg border border-neutral-200 p-4"
            >
              <div className="font-medium text-neutral-900">
                {DPI_TIER_META[tier].label}
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {DPI_TIER_META[tier].description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-neutral-500">
          This measures what&apos;s publicly findable, not how important or
          well-cared-for a site is — a site with Limited documentation may
          still be carefully maintained, just without much of that work
          published online.
        </p>
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          What this methodology doesn&apos;t claim
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          <li>
            It isn&apos;t a prediction. A status describes documented present
            conditions, not a forecast of what will happen to a site.
          </li>
          <li>
            It reflects the most recent review, not a live, continuously
            updated feed — check a site&apos;s status history for exactly
            when it was last reviewed.
          </li>
          <li>
            It can be incomplete. Evidence that couldn&apos;t be adequately
            sourced is left out rather than approximated, so a profile may
            not mention every known event.
          </li>
        </ul>
      </section>

      <Link href="/" className="mt-10 inline-block text-blue-700 hover:underline">
        &larr; Back home
      </Link>
    </main>
  );
}
