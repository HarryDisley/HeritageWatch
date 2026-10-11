import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { membershipYear } from "@/lib/display";
import CountryTable, { type CountryRow } from "@/components/CountryTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Countries",
  description:
    "What each country's official treaty record shows for heritage protection in armed conflict, World Heritage, and the International Criminal Court.",
};

export default async function CountriesPage() {
  // Only approved countries are ever shown publicly.
  const countries = await prisma.country.findMany({
    where: { reviewStatus: "APPROVED" },
    orderBy: { name: "asc" },
    include: { memberships: { include: { treaty: true } } },
  });

  const rows: CountryRow[] = countries.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    cells: Object.fromEntries(
      c.memberships.map((m) => [
        m.treaty.slug,
        { status: m.status, year: membershipYear(m.date, m.dateDisplay) },
      ])
    ),
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        &larr; Map
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-neutral-900">Countries</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-neutral-700">
        What each country&rsquo;s official treaty record shows for five
        instruments that matter to cultural heritage. Every entry links to the
        official register it comes from.
      </p>
      <p className="mt-3 max-w-2xl rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <strong>How to read this.</strong> These tables show what the registers
        record on the date we checked. They do not show how well any state
        keeps its commitments, and the list is alphabetical on purpose: it is
        not a ranking. &ldquo;Not listed&rdquo; means the country does not
        appear among the signatories or parties on that register.
      </p>

      <div className="mt-8">
        {rows.length === 0 ? (
          <p className="text-neutral-600">No countries have been published yet.</p>
        ) : (
          <CountryTable rows={rows} />
        )}
      </div>
    </main>
  );
}
