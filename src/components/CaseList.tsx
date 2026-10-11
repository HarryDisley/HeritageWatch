"use client";

// Searchable, filterable list of casebook entries.
// Same filtering pattern as the site filters: OR within the type chips,
// AND with the search text.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CASE_TYPE_LABELS } from "@/lib/display";
import type { CaseType } from "@prisma/client";

export type CaseRow = {
  slug: string;
  title: string;
  caseType: CaseType;
  body: string;
  years: string | null;
  countries: string[];
  summary: string;
};

export default function CaseList({ rows }: { rows: CaseRow[] }) {
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<CaseType[]>([]);

  const presentTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.caseType))),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (types.length > 0 && !types.includes(r.caseType)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.countries.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [rows, query, types]);

  function toggle(t: CaseType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  return (
    <div>
      <label htmlFor="case-search" className="sr-only">
        Search the casebook
      </label>
      <input
        id="case-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, court, country or topic"
        className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:border-blue-700 focus:outline-none sm:max-w-md"
      />

      {presentTypes.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by case type">
          {presentTypes.map((t) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  on
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                }`}
              >
                {CASE_TYPE_LABELS[t]}
              </button>
            );
          })}
          {(types.length > 0 || query) && (
            <button
              type="button"
              onClick={() => {
                setTypes([]);
                setQuery("");
              }}
              className="px-2 py-1 text-sm text-blue-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-sm text-neutral-500" aria-live="polite">
        Showing {visible.length} of {rows.length} entries
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 text-neutral-600">No entries match these filters.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((r) => (
            <li key={r.slug} className="rounded-lg border border-neutral-200 p-4">
              <Link
                href={`/casebook/${r.slug}`}
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                {r.title}
              </Link>
              <p className="mt-1 text-sm text-neutral-600">
                {CASE_TYPE_LABELS[r.caseType]} &middot; {r.body}
                {r.years && <> &middot; {r.years}</>}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {r.summary.length > 260
                  ? r.summary.slice(0, 260).replace(/\s+\S*$/, "") + "…"
                  : r.summary}
              </p>
              {r.countries.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">
                  Countries: {r.countries.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
