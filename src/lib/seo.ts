// The one official address of the site. Search engines treat this as the
// "canonical" host, so www and non-www versions are not counted as two sites.
export const SITE_URL = "https://www.standingatlas.org";

// Search results show roughly 155 characters of description. This trims text
// to a whole word and adds an ellipsis, so it never cuts a word in half.
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}
