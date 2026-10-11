import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "What Standing is, how it is built and checked, and what it does not claim.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        &larr; Map
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-neutral-900">About Standing</h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-700">
        Standing is an open-source atlas of heritage, law and state
        commitments. It connects three things that are usually scattered
        across many websites: the condition of cultural heritage sites, what
        each country&rsquo;s official treaty record shows, and the cases that
        test those commitments.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          Why &ldquo;Standing&rdquo;?
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          In law, <em>standing</em> is the right to bring a case. In
          international affairs, a state&rsquo;s <em>standing</em> is its record
          and reputation. The name points at both: who can act to protect
          heritage, and what a state has committed to.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          What you can do here
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
          <li>
            <Link href="/" className="text-blue-700 hover:underline">
              Explore sites
            </Link>{" "}
            on the map, filtered by status, threat type and region.
          </li>
          <li>
            <Link href="/countries" className="text-blue-700 hover:underline">
              Compare countries
            </Link>{" "}
            by the treaties they have joined, with a link to the official
            register behind every entry.
          </li>
          <li>
            <Link href="/casebook" className="text-blue-700 hover:underline">
              Read the casebook
            </Link>
            : plain-language summaries of cases, with facts and analysis kept
            apart.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          How it is checked
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          Every claim links to a source, and sources are tiered by how
          authoritative they are. Nothing is published automatically. Each
          entry is drafted, independently fact-checked against its sources, and
          then reviewed and approved by the author. Where a primary record
          could not be read, the entry is held back rather than filled in. The{" "}
          <Link href="/methodology" className="text-blue-700 hover:underline">
            Methodology
          </Link>{" "}
          page has the full rules.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          How AI was used
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-700">
          AI tools helped with research, drafting, fact-checking and code. They
          were not allowed to publish anything or decide any classification.
          Factual claims must be traceable to the cited sources, and the
          author makes every final decision.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">
          What Standing does not claim
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          <li>
            It is not a prediction, a ranking of governments, or legal advice.
          </li>
          <li>
            A treaty record shows what a state has joined, not how well it keeps
            its commitments.
          </li>
          <li>
            It is incomplete and still growing. If you spot a mistake, please
            report it so it can be corrected.
          </li>
          <li>
            It is an independent, non-commercial student project, not
            affiliated with, endorsed by, or part of UNESCO, the United
            Nations, the International Criminal Court, Blue Shield, or any
            other organization whose records it cites.
          </li>
        </ul>
      </section>

      <p className="mt-10 text-sm text-neutral-500">
        Built by Harry Disley. Source code:{" "}
        <a
          href="https://github.com/HarryDisley/HeritageWatch"
          className="text-blue-700 hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </main>
  );
}
