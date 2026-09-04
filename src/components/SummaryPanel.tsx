import { regenerateSummaryAction } from "@/app/actions/references";
import type { Database } from "@/lib/database.types";

type Summary = Database["public"]["Tables"]["ai_summaries"]["Row"];

export default function SummaryPanel({
  candidacyId,
  summary,
  referenceCount,
  isLoggedIn,
}: {
  candidacyId: string;
  summary: Summary | null;
  referenceCount: number;
  isLoggedIn: boolean;
}) {
  const hasContent = summary && (summary.positive || summary.negative);

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-stone-900">
          <span>Resumen de referencias por IA</span>
          {summary?.source === "anthropic" && (
            <span className="badge bg-brand-light text-brand">IA</span>
          )}
          {summary?.source === "fallback" && (
            <span className="badge bg-stone-100 text-stone-500">automático</span>
          )}
        </h3>
        {isLoggedIn && referenceCount > 0 && (
          <form action={regenerateSummaryAction}>
            <input type="hidden" name="candidacy_id" value={candidacyId} />
            <button type="submit" className="text-xs text-brand hover:underline">
              Actualizar
            </button>
          </form>
        )}
      </div>

      {referenceCount === 0 || !hasContent ? (
        <div className="alert-info">
          Todavía no hay suficientes referencias para generar un resumen. Cuando este candidato
          reciba referencias, acá aparecerá un resumen de lo bueno y lo malo.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-800">
              <span aria-hidden>▲</span> Lo positivo
            </h4>
            <p className="text-sm text-green-900">
              {summary?.positive || "Sin aspectos positivos destacados en las referencias."}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
              <span aria-hidden>▼</span> Lo negativo
            </h4>
            <p className="text-sm text-red-900">
              {summary?.negative || "Sin aspectos negativos destacados en las referencias."}
            </p>
          </div>
        </div>
      )}
      {hasContent && (
        <p className="mt-3 text-xs text-stone-400">
          Generado a partir de {summary?.based_on_count} referencia
          {summary?.based_on_count === 1 ? "" : "s"} visible
          {summary?.based_on_count === 1 ? "" : "s"}. Las referencias ocultadas no se incluyen.
        </p>
      )}
    </div>
  );
}
