"use client";

// The full-screen layout for the homepage: the map fills the viewport, and
// everything else (the intro blurb, stats, the site list, links to the
// methodology page) lives in a "drawer" - a panel that's hidden off-screen
// by default and slides in over the map when opened. This is the same
// pattern most mobile apps use for their main menu.
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMap from "./SiteMapLoader";
import type { MapSite } from "./SiteMap";
import { STATUS_META } from "@/lib/display";
import type { SiteStatus } from "@prisma/client";

const STATUS_ORDER: SiteStatus[] = [
  "SAFE",
  "MODERATE_CONCERN",
  "HIGH_CONCERN",
  "CRITICAL_CONCERN",
];

export default function HomeShell({ sites }: { sites: MapSite[] }) {
  const [open, setOpen] = useState(false);

  // Adds a class to <body> only while this component is mounted (i.e.
  // only on the homepage), and removes it on unmount. See the
  // `.map-fullscreen` rule in globals.css for what it does and why it's
  // scoped this way rather than applied to every page.
  useEffect(() => {
    document.body.classList.add("map-fullscreen");
    return () => document.body.classList.remove("map-fullscreen");
  }, []);

  // Lets the Escape key close the drawer, same as most dialogs/menus -
  // closes over `open` via the dependency array so it only listens while
  // the drawer is actually open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const counts: Record<SiteStatus, number> = {
    SAFE: 0,
    MODERATE_CONCERN: 0,
    HIGH_CONCERN: 0,
    CRITICAL_CONCERN: 0,
  };
  for (const site of sites) {
    if (site.status) counts[site.status] += 1;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <SiteMap sites={sites} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="absolute left-4 top-4 z-[1000] rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur hover:bg-white"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {/* Backdrop: dims the map and closes the drawer on click, same as a
          modal dialog. */}
      {open && (
        <div
          className="fixed inset-0 z-[1100] bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="HeritageWatch menu"
        className={`fixed left-0 top-0 z-[1200] h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <h1 className="text-xl font-bold text-neutral-900">HeritageWatch</h1>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed text-neutral-600">
            An open-source, educational platform for understanding and
            monitoring threats facing cultural heritage sites around the
            world. Every status here is based on documented evidence from
            named sources, never a prediction or a numerical risk score.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-2xl font-semibold text-neutral-900">
                {sites.length}
              </div>
              <div className="text-xs text-neutral-600">Sites Tracked</div>
            </div>
            {STATUS_ORDER.map((status) => (
              <div
                key={status}
                className={`rounded-lg border p-3 ${STATUS_META[status].badgeClass}`}
              >
                <div className="text-2xl font-semibold">{counts[status]}</div>
                <div className="text-xs">{STATUS_META[status].label}</div>
              </div>
            ))}
          </div>

          <nav className="mt-4 flex flex-col gap-2 border-y border-neutral-200 py-4 text-sm">
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

          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Sites ({sites.length})
          </h2>
          <ul className="mt-2 divide-y divide-neutral-100">
            {sites.map((site) => (
              <li key={site.slug} className="py-2">
                <Link
                  href={`/sites/${site.slug}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {site.name}
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{site.country}</span>
                  {site.status && (
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_META[site.status].badgeClass}`}
                    >
                      {STATUS_META[site.status].label}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {sites.length === 0 && (
              <li className="py-2 text-sm text-neutral-500">
                No sites in the database yet.
              </li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
