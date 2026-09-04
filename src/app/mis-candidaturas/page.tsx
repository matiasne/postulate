import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMyCandidacies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MyCandidaciesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?message=auth-required&next=${encodeURIComponent("/mis-candidaturas")}`);
  }

  const candidacies = await getMyCandidacies(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Mis candidaturas</h1>

      {candidacies.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-stone-600">Todavía no te postulaste a ninguna posición.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">
            Ver el organigrama
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {candidacies.map((c) => (
            <li key={c.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-stone-900">{c.position?.title ?? "Posición"}</p>
                <p className="text-xs text-stone-500">
                  Postulado el {new Date(c.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/candidatos/${c.id}/editar`} className="btn-outline">
                  Editar
                </Link>
                <Link href={`/candidatos/${c.id}`} className="btn-ghost">
                  Ver público
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
