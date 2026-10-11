"use client";

// Searchable list of countries. A table on wide screens, cards on phones.
// Rows are always alphabetical: this page must never read as a ranking.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_META,
  TREATY_ORDER,
  TREATY_SHORT_LABELS,
} from "@/lib/display";
import type { MembershipStatus } from "@prisma/client";

export type CountryRow = {
  slug: string;
  name: string;
  region: string;
  cells: Record<string, { status: MembershipStatus; year: string | null }>;
};

function Cell({
  cell,
}: {
  cell: { status: MembershipStatus; year: string | null } | undefined;
}) {
  if (!cell) {
    return <span className="text-neutral-400">Not yet researched</span>;
  }
  const meta = MEMBERSHIP_META[cell.status];
  return (
    <span className={meta.className}>
      <span aria-hidden="true">{meta.symbol}</span> {meta.label}
      {cell.year && (
        <span className="text-neutral-500 font-normal"> ({cell.year})</span>
      )}
    </span>
  );
}

export default function CountryTable({ rows }: { rows: CountryRow[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      <label htmlFor="country-search" className="sr-only">
        Search countries
      </label>
      <input
        id="country-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by country or region"
        className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:border-blue-700 focus:outline-none sm:max-w-sm"
      />
      <p className="mt-2 text-sm text-neutral-500" aria-live="polite">
        Showing {visible.length} of {rows.length} countries
      </p>

      {visible.length === 0 && (
        <p className="mt-6 text-neutral-600">No countries match your search.</p>
      )}

      {/* Wide screens: comparison table */}
      {visible.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Treaty status by country, as shown on the official registers
            </caption>
            <thead>
              <tr className="border-b border-neutral-300 text-neutral-600">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Country
                </th>
                {TREATY_ORDER.map((t) => (
                  <th
                    key={t}
                    scope="col"
                    className="px-2 py-2 font-semibold align-bottom"
                  >
                    {TREATY_SHORT_LABELS[t]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-200">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    <Link
                      href={`/countries/${r.slug}`}
                      className="text-blue-700 hover:underline"
                    >
                      {r.name}
                    </Link>
                    <div className="text-xs font-normal text-neutral-500">
                      {r.region}
                    </div>
                  </th>
                  {TREATY_ORDER.map((t) => (
                    <td key={t} className="px-2 py-3">
                      <Cell cell={r.cells[t]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phones: one card per country */}
      <ul className="mt-4 space-y-3 md:hidden">
        {visible.map((r) => (
          <li key={r.slug} className="rounded-lg border border-neutral-200 p-4">
            <Link
              href={`/countries/${r.slug}`}
              className="font-medium text-blue-700 hover:underline"
            >
              {r.name}
            </Link>
            <div className="text-xs text-neutral-500">{r.region}</div>
            <dl className="mt-3 space-y-1 text-sm">
              {TREATY_ORDER.map((t) => (
                <div key={t} className="flex flex-wrap justify-between gap-x-3">
                  <dt className="text-neutral-600">{TREATY_SHORT_LABELS[t]}</dt>
                  <dd>
                    <Cell cell={r.cells[t]} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
