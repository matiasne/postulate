import { notFound } from "next/navigation";
import Link from "next/link";
import { getPositionBySlug, getCandidatesForPosition } from "@/lib/queries";
import CandidateCard from "@/components/CandidateCard";

export const dynamic = "force-dynamic";

export default async function PositionCandidatesPage({
  params,
}: {
  params: { slug: string };
}) {
  const position = await getPositionBySlug(params.slug);
  if (!position) notFound();

  const candidates = await getCandidatesForPosition(position.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-stone-500 hover:underline">
          ← Organigrama
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Candidatos a {position.title}
            </h1>
            <p className="text-sm text-stone-500">
              {candidates.length} {candidates.length === 1 ? "postulante" : "postulantes"}
            </p>
          </div>
          <Link href={`/postularme/${position.slug}`} className="btn-primary">
            Postularme
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-stone-600">
            Todavía no hay candidatos para esta posición. ¡Podés ser el primero!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidacy={c} />
          ))}
        </div>
      )}
    </div>
  );
}
