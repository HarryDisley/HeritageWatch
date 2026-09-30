"use client";

// This is a Client Component ("use client" above) rather than a Server
// Component like most of the app, because Leaflet has to attach itself to
// a real DOM element in the browser and respond to drag/zoom/click events —
// none of that can happen on the server. The homepage (a Server Component)
// fetches the site data with Prisma and passes it in as a prop, so this
// component only has to worry about rendering, not querying the database.
import { useSyncExternalStore } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { STATUS_META } from "@/lib/display";
import type { SiteStatus } from "@prisma/client";

export type MapSite = {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  status: SiteStatus | null;
};

// Leaflet's default marker icon is an image file that's notoriously fiddly
// to get working through a bundler (a very common "why is my marker
// invisible" issue). Plain colored circles sidestep that entirely, need no
// image assets, and let us reuse the exact same status colors as the rest
// of the site.
const CIRCLE_COLOR: Record<SiteStatus, string> = {
  SAFE: "#059669", // emerald-600
  MODERATE_CONCERN: "#d97706", // amber-600
  HIGH_CONCERN: "#ea580c", // orange-600
  CRITICAL_CONCERN: "#dc2626", // red-600
};

// Leaflet reads `window` as soon as MapContainer renders, which breaks on
// the server (no window there). useSyncExternalStore is React's built-in way
// to ask "has this actually mounted in the browser yet" - it returns false
// during the server render (and React's first client pass, to keep the two
// in sync) and true after, with no state/effect plumbing of our own needed.
function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // nothing external ever changes, so no-op subscribe/unsubscribe
    () => true, // snapshot once actually running in the browser
    () => false // snapshot during server rendering
  );
}

export default function SiteMap({ sites }: { sites: MapSite[] }) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      scrollWheelZoom={false}
      className="h-[400px] w-full rounded-lg border border-neutral-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map((site) => (
        <CircleMarker
          key={site.slug}
          center={[site.latitude, site.longitude]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: site.status ? CIRCLE_COLOR[site.status] : "#9ca3af",
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{site.name}</div>
              <div className="text-neutral-600">{site.country}</div>
              {site.status && (
                <div className="mt-1">{STATUS_META[site.status].label}</div>
              )}
              <Link
                href={`/sites/${site.slug}`}
                className="mt-1 inline-block text-blue-700 hover:underline"
              >
                View profile &rarr;
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
