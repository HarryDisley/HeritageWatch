"use client";

// The navigation bar shown at the top of every page EXCEPT the map
// homepage (which is full-screen and has its own menu drawer).
// usePathname() tells us which page we are on, so the bar can hide itself
// on "/" and mark the current section with aria-current for screen readers.
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Heritage sites" },
  { href: "/countries", label: "Countries" },
  { href: "/casebook", label: "Casebook" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-3">
        <Link href="/" className="leading-tight">
          <span className="block text-lg font-bold text-neutral-900">
            Standing
          </span>
          <span className="block text-xs text-neutral-500">
            Heritage sites, treaties and cases
          </span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {LINKS.map(({ href, label }) => {
            const current =
              href !== "/" &&
              (pathname === href || pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={
                  current
                    ? "font-semibold text-neutral-900 underline underline-offset-4"
                    : "text-blue-700 hover:underline"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
