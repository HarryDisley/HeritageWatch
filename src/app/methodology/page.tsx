import Link from "next/link";

// Placeholder for now, per the approved Phase 1 scope. The real methodology
// already exists in full as a project document (research-methodology-workflow.md)
// — this page will publish a readable version of it in a later milestone.
export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Methodology</h1>
      <p className="mt-4 leading-relaxed text-neutral-700">
        HeritageWatch classifies every site using four descriptive statuses —
        Safe, Moderate Concern, High Concern, and Critical Concern — based on
        documented evidence from named sources, never a numerical risk score
        or a prediction. Each status has a separate, transparent confidence
        rating reflecting how well-supported it is by current evidence.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-700">
        This page is a placeholder. The full methodology — including the
        source-reliability tiering system and the Digital Preservation Index
        — is already written up as a project document and will be published
        here in a future milestone.
      </p>
      <Link href="/" className="mt-8 inline-block text-blue-700 hover:underline">
        &larr; Back home
      </Link>
    </main>
  );
}
