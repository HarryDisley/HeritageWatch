"use client";

// SiteMap.tsx can't even be *loaded* on the server - the leaflet library
// checks for `window` as soon as its code runs, not just when the map
// actually renders, so merely importing it server-side crashes. `dynamic`
// with `ssr: false` tells Next.js to skip loading that module on the
// server entirely and only fetch it in the browser. `ssr: false` is only
// allowed inside a Client Component, which is why this one-line wrapper
// exists separately from the page itself (a Server Component).
import dynamic from "next/dynamic";
import type { MapSite } from "./SiteMap";

const SiteMap = dynamic(() => import("./SiteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
      Loading map...
    </div>
  ),
});

export default function SiteMapLoader({ sites }: { sites: MapSite[] }) {
  return <SiteMap sites={sites} />;
}
