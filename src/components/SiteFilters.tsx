"use client";

// The search box and filter controls shown in the homepage drawer.
//
// This component is "controlled": it owns no state of its own. The parent
// (HomeShell) holds the current filters and passes them in, along with
// functions to change them. That way the map, the list and these controls
// can never disagree about what is selected.
import { STATUS_META, THREAT_CATEGORY_LABELS } from "@/lib/display";
import { REGION_GROUPS } from "@/lib/regions";
import type { SiteStatus, ThreatCategoryType } from "@prisma/client";

export type Filters = {
  query: string;
  statuses: SiteStatus[];
  threats: ThreatCategoryType[];
  region: string; // "" means all regions
};

export const EMPTY_FILTERS: Filters = {
  query: "",
  statuses: [],
  threats: [],
  region: "",
};

const STATUS_ORDER: SiteStatus[] = [
  "SAFE",
  "MODERATE_CONCERN",
  "HIGH_CONCERN",
  "CRITICAL_CONCERN",
];

const THREAT_ORDER: ThreatCategoryType[] = [
  "ARMED_CONFLICT",
  "NATURAL_DISASTER",
  "ENVIRONMENTAL_CLIMATE",
  "CONSERVATION_STRUCTURAL",
];

// Adds the value if it isn't in the list, removes it if it is.
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.query.trim() !== "" ||
    f.statuses.length > 0 ||
    f.threats.length > 0 ||
    f.region !== ""
  );
}

export default function SiteFilters({
  filters,
  onChange,
  shown,
  total,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  shown: number;
  total: number;
}) {
  return (
    <section aria-label="Search and filter sites" className="mt-4">
      <label htmlFor="site-search" className="sr-only">
        Search sites by name or country
      </label>
      <input
        id="site-search"
        type="search"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        placeholder="Search by site or country"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />

      <fieldset className="mt-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((status) => {
            const on = filters.statuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  onChange({ ...filters, statuses: toggle(filters.statuses, status) })
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  on
                    ? `${STATUS_META[status].badgeClass} ring-2 ring-neutral-800`
                    : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {STATUS_META[status].label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Threat type
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {THREAT_ORDER.map((threat) => {
            const on = filters.threats.includes(threat);
            return (
              <button
                key={threat}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  onChange({ ...filters, threats: toggle(filters.threats, threat) })
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  on
                    ? "border-neutral-800 bg-neutral-800 text-white"
                    : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {THREAT_CATEGORY_LABELS[threat]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-3">
        <label
          htmlFor="region-filter"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Region
        </label>
        <select
          id="region-filter"
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        >
          <option value="">All regions</option>
          {REGION_GROUPS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
        {/* aria-live makes screen readers announce the new count when the
            filters change, so the result isn't only visible on screen. */}
        <span aria-live="polite">
          Showing {shown} of {total} sites
        </span>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="font-medium text-blue-700 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
