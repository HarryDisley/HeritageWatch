"use client";

// This module is only ever loaded in the browser in the first place - see
// SiteMapLoader.tsx, which uses next/dynamic with ssr:false specifically
// because leaflet touches `window` at import time, not just render time.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
  AttributionControl,
  ZoomControl,
} from "react-leaflet";
import type { GeoJSON as LeafletGeoJSON, Layer, PathOptions, StyleFunction } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
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

type CountryProperties = { name: string; iso_a2: string };

// A site's current status is always shown with this same color, wherever it
// appears - the marker fill below, and (via STATUS_META.badgeClass) the
// colored pill inside each marker's popup. Keeping one mapping here is what
// keeps "red means Critical Concern" true everywhere on the site, map
// included.
const CIRCLE_COLOR: Record<SiteStatus, string> = {
  SAFE: "#059669",
  MODERATE_CONCERN: "#d97706",
  HIGH_CONCERN: "#ea580c",
  CRITICAL_CONCERN: "#dc2626",
};

// The country shapes stay nearly invisible by default - they exist so we
// can detect which country the mouse is over and darken it, while the
// visible terrain "look" comes from the Esri tile layers below. A visible
// (if subtle) stroke is drawn here rather than relying only on the Esri
// reference layer's own borders, so the outlines stay crisp at every zoom
// level instead of depending on how that raster tile happens to render.
const DEFAULT_COUNTRY_STYLE: PathOptions = {
  fillOpacity: 0.02,
  fillColor: "#000000",
  color: "#1f2937",
  weight: 0.9,
  opacity: 0.55,
};

const HOVER_COUNTRY_STYLE: PathOptions = {
  fillColor: "#111827",
  fillOpacity: 0.3,
  color: "#f8fafc",
  weight: 1.3,
  opacity: 0.85,
};

// Defined outside the component (never recreated) so react-leaflet's
// GeoJSON layer sees a stable function reference - otherwise every render
// would hand it a "new" style function and it would re-style all ~177
// country polygons instead of just the one being hovered.
const countryStyle: StyleFunction<CountryProperties> = () => DEFAULT_COUNTRY_STYLE;

export default function SiteMap({ sites }: { sites: MapSite[] }) {
  const [countries, setCountries] = useState<FeatureCollection | null>(null);
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    fetch("/data/world-countries.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setCountries(data))
      .catch((err) => console.error("Failed to load country boundaries:", err));
  }, []);

  // The hover darken effect is applied directly to the Leaflet layer here,
  // not through React state - there's no info card to show anymore, so
  // nothing about this needs to trigger a React re-render. That also keeps
  // hovering cheap: moving the mouse across the map no longer re-renders
  // this component at all.
  const onEachFeature = useCallback(
    (_feature: Feature<Geometry, CountryProperties>, layer: Layer) => {
      layer.on({
        mouseover: () => (layer as LeafletGeoJSON).setStyle(HOVER_COUNTRY_STYLE),
        mouseout: () => geoJsonRef.current?.resetStyle(layer as never),
      });
    },
    [],
  );

  return (
    <MapContainer
      center={[20, 10]}
      zoom={3}
      minZoom={3}
      scrollWheelZoom={false}
      inertia={false}
      attributionControl={false}
      zoomControl={false}
      // Web Mercator (the projection Leaflet/most web maps use) has no
      // tiles above ~85.06N or below ~85.06S - the projection stretches
      // toward infinity near the poles, so mapmakers cut it off there. At
      // zoom 2 the whole world is only ~1024px tall, which is shorter than
      // most monitors, so grey space was always going to show above/below
      // it no matter what - not a bug, just geometry. zoom 3 roughly
      // doubles that to ~2048px, comfortably covering ordinary screens,
      // and maxBounds/maxBoundsViscosity stop you from ever dragging past
      // the edge into empty space in the first place.
      // Only latitude (north/south) is capped here now - longitude is left
      // unrestricted (Infinity in both directions) so panning east/west
      // keeps scrolling the world continuously instead of stopping at the
      // antimeridian.
      maxBounds={[
        [-85.06, -Infinity],
        [85.06, Infinity],
      ]}
      maxBoundsViscosity={1}
      // The tile images repeat infinitely on their own as you pan east/west
      // (that's just how map tiles work), but the country shapes and site
      // markers are real data anchored to one specific set of coordinates -
      // they don't automatically have copies at every repeat of the world.
      // worldCopyJump makes Leaflet silently snap the view back by exactly
      // one world-width whenever you pan past the edge of that single copy,
      // landing you back where the real data is - so it still feels like
      // continuous scrolling, but you're always looking at the one place
      // the countries/markers actually exist.
      worldCopyJump
      className="h-full w-full bg-[#7fa08f]"
    >
      {/* Moved off the top-left corner, which is where the drawer's menu
          button sits and was blocking the default zoom control. */}
      <ZoomControl position="bottomright" />
      {/* World_Physical_Map is Esri's colored relief map on its own - no
          API key needed. An earlier version of this tried to build the
          look by blending a separate grayscale shaded-relief layer
          underneath a terrain color layer, but multiplying a mid-gray
          layer over the colors mutes them - that's why it looked washed
          out rather than vivid. This single layer already has the
          elevation coloring and relief baked in. Its native resolution
          tops out at zoom 8 (maxNativeZoom) - Leaflet just upscales it
          for closer zooms rather than fetching non-existent tiles. */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="Esri"
        maxNativeZoom={8}
        maxZoom={13}
      />
      {/* Borders and place-name labels on top of the physical map. */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={8}
        maxZoom={13}
      />
      {/* Attribution is required by Esri's and Leaflet's free-tile terms,
          but kept short and without the default "Leaflet" branding link. */}
      <AttributionControl position="bottomright" prefix={false} />
      {countries && (
        <GeoJSON
          ref={geoJsonRef}
          data={countries}
          style={countryStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {sites.map((site) => (
        <CircleMarker
          key={site.slug}
          center={[site.latitude, site.longitude]}
          radius={7}
          // A dedicated pane keeps markers painted above the country
          // layer no matter which one finishes loading first - without
          // this, the country shapes (which load a moment after the page
          // first renders) ended up stacked on top of the markers in the
          // browser's draw order, which is why clicks kept landing on the
          // invisible country hover area instead of the dot underneath it.
          pane="markerPane"
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: site.status ? CIRCLE_COLOR[site.status] : "#9ca3af",
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{site.name}</div>
              <div className="text-neutral-600">{site.country}</div>
              {site.status && (
                <div
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_META[site.status].badgeClass}`}
                >
                  {STATUS_META[site.status].label}
                </div>
              )}
              <div>
                <Link
                  href={`/sites/${site.slug}`}
                  className="mt-1 inline-block text-blue-700 hover:underline"
                >
                  View profile &rarr;
                </Link>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
