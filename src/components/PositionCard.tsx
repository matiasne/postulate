import Link from "next/link";
import EmptyAvatar from "@/components/EmptyAvatar";
import type { PositionWithCount } from "@/lib/queries";

export default function PositionCard({
  position,
  featured = false,
}: {
  position: PositionWithCount;
  featured?: boolean;
}) {
  const { slug, title, description, candidateCount } = position;
  const hasCandidates = candidateCount > 0;

  return (
    <div
      className={`card flex flex-col items-center p-5 text-center ${
        featured ? "border-brand/40 ring-1 ring-brand/20" : ""
      }`}
    >
      <EmptyAvatar size={featured ? 80 : 64} />
      <h3 className={`mt-3 font-bold text-stone-900 ${featured ? "text-lg" : "text-base"}`}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 line-clamp-3 text-xs text-stone-500">{description}</p>
      )}

      <span className="badge mt-3 bg-stone-100 text-stone-500">Posición vacante</span>

      <div className="mt-4 flex w-full flex-col gap-2">
        {/* "Postularme" siempre disponible */}
        <Link href={`/postularme/${slug}`} className="btn-primary w-full">
          Postularme
        </Link>

        {/* "Ver candidatos" solo si hay al menos uno */}
        {hasCandidates && (
          <Link href={`/cargos/${slug}`} className="btn-outline w-full">
            Ver candidatos ({candidateCount})
          </Link>
        )}
      </div>
    </div>
  );
}
