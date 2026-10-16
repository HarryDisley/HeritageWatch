import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

// Built from the database on request, so newly approved sites, countries and
// cases appear without a code change. Only approved records are listed.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sites, countries, cases] = await Promise.all([
    prisma.site.findMany({
      where: { reviewStatus: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.country.findMany({
      where: { reviewStatus: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.case.findMany({
      where: { reviewStatus: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = ["", "/about", "/methodology", "/countries", "/casebook"].map(
    (path) => ({ url: `${SITE_URL}${path}` })
  );

  return [
    ...staticPages,
    ...sites.map((s) => ({
      url: `${SITE_URL}/sites/${s.slug}`,
      lastModified: s.updatedAt,
    })),
    ...countries.map((c) => ({
      url: `${SITE_URL}/countries/${c.slug}`,
      lastModified: c.updatedAt,
    })),
    ...cases.map((c) => ({
      url: `${SITE_URL}/casebook/${c.slug}`,
      lastModified: c.updatedAt,
    })),
  ];
}
