import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_META } from "@/lib/display";
import type { SiteStatus } from "@prisma/client";

// Renders fresh on every request instead of being statically generated at
// build time. For a site-status tracker, showing a stale count because the
// page was cached would be a worse trade-off than the extra server work —
// worth revisiting once there are enough sites/visits for that to matter.
export const dynamic = "force-dynamic";

const STATUS_ORDER: SiteStatus[] = [
  "SAFE",
  "MODERATE_CONCERN",
  "HIGH_CONCERN",
  "CRITICAL_CONCERN",
];

export default async function HomePage() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    include: {
      statusEntries: {
        orderBy: { effectiveDate: "desc" },
        take: 1,
      },
    },
  });

  const counts: Record<SiteStatus, number> = {
    SAFE: 0,
    MODERATE_CONCERN: 0,
    HIGH_CONCERN: 0,
    CRITICAL_CONCERN: 0,
  };
  for (const site of sites) {
    const current = site.statusEntries[0];
    if (current) counts[current.status] += 1;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          HeritageWatch
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-700">
          HeritageWatch is an open-source, educational platform for
          understanding and monitoring threats facing cultural heritage
          sites around the world — armed conflict, natural disasters,
          environmental change, and conservation challenges. Every status
          on this site is based on documented evidence from named sources,
          never a prediction or a numerical risk score.
        </p>
      </header>

      <section className="mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
            <div className="text-3xl font-semibold text-neutral-900">
              {sites.length}
            </div>
            <div className="text-sm text-neutral-600">Sites Tracked</div>
          </div>
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className={`rounded-lg border p-4 ${STATUS_META[status].badgeClass}`}
            >
              <div className="text-3xl font-semibold">{counts[status]}</div>
              <div className="text-sm">{STATUS_META[status].label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">Sites</h2>
        <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {sites.map((site) => {
            const current = site.statusEntries[0];
            return (
              <li
                key={site.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <Link
                    href={`/sites/${site.slug}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {site.name}
                  </Link>
                  <div className="text-sm text-neutral-500">
                    {site.country}
                  </div>
                </div>
                {current ? (
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${STATUS_META[current.status].badgeClass}`}
                  >
                    {STATUS_META[current.status].label}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm text-neutral-500">
                    No status recorded
                  </span>
                )}
              </li>
            );
          })}
          {sites.length === 0 && (
            <li className="p-4 text-neutral-500">
              No sites in the database yet. Run{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5">
                npm run import:dossiers
              </code>{" "}
              after setting up the database.
            </li>
          )}
        </ul>
      </section>

      <nav className="mt-10 flex gap-6 border-t border-neutral-200 pt-6 text-sm">
        <Link href="/methodology" className="text-blue-700 hover:underline">
          Methodology
        </Link>
        <a
          href="https://github.com/HarryDisley/HeritageWatch"
          className="text-blue-700 hover:underline"
        >
          Source on GitHub
        </a>
      </nav>
    </main>
  );
}
