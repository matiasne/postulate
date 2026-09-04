import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCandidacyDetail } from "@/lib/queries";
import { getCurrentUser, displayName } from "@/lib/auth";
import { publicUrl } from "@/lib/storage";
import EmptyAvatar from "@/components/EmptyAvatar";
import MapView from "@/components/map/MapView";
import SummaryPanel from "@/components/SummaryPanel";
import ReferenceForm from "@/components/references/ReferenceForm";
import ReportButton from "@/components/references/ReportButton";

export const dynamic = "force-dynamic";

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getCandidacyDetail(params.id);
  if (!detail) notFound();

  const { candidacy, profile, position, references, summary } = detail;
  const user = await getCurrentUser();
  const isOwner = user?.id === candidacy.user_id;

  const photo = publicUrl("avatars", candidacy.photo_path);
  const cv = publicUrl("cvs", candidacy.cv_path);
  const hasLocation = candidacy.location_lat != null && candidacy.location_lng != null;

  return (
    <div className="space-y-6">
      <div>
        {position && (
          <Link href={`/cargos/${position.slug}`} className="text-sm text-stone-500 hover:underline">
            ← Candidatos a {position.title}
          </Link>
        )}
      </div>

      {/* Encabezado */}
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
        {photo ? (
          <Image
            src={photo}
            alt={displayName(profile)}
            width={96}
            height={96}
            className="rounded-full object-cover"
            style={{ height: 96, width: 96 }}
            unoptimized
          />
        ) : (
          <EmptyAvatar size={96} />
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-stone-900">{displayName(profile)}</h1>
          {position && <p className="text-brand">Candidato a {position.title}</p>}
          <p className="mt-1 text-sm text-stone-500">
            {candidacy.location_label || "Ubicación no declarada"}
          </p>
          {isOwner && (
            <Link href={`/candidatos/${candidacy.id}/editar`} className="btn-outline mt-3 inline-flex">
              Editar mi perfil
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CV */}
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-stone-900">Currículum</h3>
          {cv ? (
            <a href={cv} target="_blank" rel="noreferrer" className="btn-primary inline-flex">
              Ver / descargar CV{candidacy.cv_name ? ` (${candidacy.cv_name})` : ""}
            </a>
          ) : (
            <div className="alert-info">Este candidato todavía no cargó su CV.</div>
          )}
        </div>

        {/* Mapa */}
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-stone-900">¿Dónde vive?</h3>
          {hasLocation ? (
            <MapView
              lat={candidacy.location_lat as number}
              lng={candidacy.location_lng as number}
              label={candidacy.location_label}
              height={260}
            />
          ) : (
            <div className="alert-info">Este candidato todavía no indicó dónde vive.</div>
          )}
        </div>
      </div>

      {/* Resumen IA */}
      <SummaryPanel
        candidacyId={candidacy.id}
        summary={summary}
        referenceCount={references.length}
        isLoggedIn={!!user}
      />

      {/* Referencias */}
      <div className="card p-5">
        <h3 className="mb-4 font-bold text-stone-900">
          Referencias ({references.length})
        </h3>

        {references.length === 0 ? (
          <div className="alert-info mb-4">
            Este candidato todavía no tiene referencias. ¡Sé el primero en dejar una!
          </div>
        ) : (
          <ul className="mb-6 space-y-3">
            {references.map((ref) => (
              <li key={ref.id} className="rounded-lg border border-stone-200 p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800">
                      {displayName(ref.author)}
                    </span>
                    <span
                      className={`badge ${
                        ref.stance === "favor"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ref.stance === "favor" ? "A favor" : "En contra"}
                    </span>
                  </div>
                  {user && <ReportButton referenceId={ref.id} candidacyId={candidacy.id} />}
                </div>
                <p className="text-sm text-stone-700">{ref.body}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {new Date(ref.created_at).toLocaleDateString("es-AR")}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Dejar una referencia */}
        <div className="border-t border-stone-200 pt-4">
          <h4 className="mb-3 font-semibold text-stone-800">Dejar una referencia</h4>
          {user ? (
            <ReferenceForm candidacyId={candidacy.id} />
          ) : (
            <div className="alert-info">
              Para dejar una referencia,{" "}
              <Link
                href={`/login?message=auth-required&next=${encodeURIComponent(`/candidatos/${candidacy.id}`)}`}
                className="font-semibold text-brand underline"
              >
                iniciá sesión
              </Link>
              . Tu nombre y apellido reales se mostrarán junto a la referencia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
