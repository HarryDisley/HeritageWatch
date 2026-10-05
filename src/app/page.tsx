import { prisma } from "@/lib/prisma";
import HomeShell from "@/components/HomeShell";

// Renders fresh on every request instead of being statically generated at
// build time. For a site-status tracker, showing a stale count because the
// page was cached would be a worse trade-off than the extra server work —
// worth revisiting once there are enough sites/visits for that to matter.
export const dynamic = "force-dynamic";

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

  return (
    <HomeShell
      sites={sites.map((site) => ({
        slug: site.slug,
        name: site.name,
        country: site.country,
        latitude: site.latitude,
        longitude: site.longitude,
        status: site.statusEntries[0]?.status ?? null,
      }))}
    />
  );
}
