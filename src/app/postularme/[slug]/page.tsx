import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getPositionBySlug, getUserCandidacy } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { applyToPosition } from "@/app/actions/candidacy";
import EmptyAvatar from "@/components/EmptyAvatar";

export const dynamic = "force-dynamic";

export default async function PostularmePage({
  params,
}: {
  params: { slug: string };
}) {
  const position = await getPositionBySlug(params.slug);
  if (!position) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?message=auth-required&next=${encodeURIComponent(`/postularme/${params.slug}`)}`);
  }

  // Si ya se postuló, va directo a editar su perfil.
  const existing = await getUserCandidacy(position.id, user.id);
  if (existing) {
    redirect(`/candidatos/${existing.id}/editar`);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card flex flex-col items-center p-6 text-center">
        <EmptyAvatar size={72} />
        <h1 className="mt-4 text-xl font-bold text-stone-900">
          Postularme a {position.title}
        </h1>
        {position.description && (
          <p className="mt-2 text-sm text-stone-500">{position.description}</p>
        )}
        <p className="mt-4 text-sm text-stone-600">
          Vas a sumarte como candidato a esta posición. Después podrás cargar tu foto, CV y
          ubicación (todo opcional).
        </p>

        <form action={applyToPosition} className="mt-6 w-full">
          <input type="hidden" name="position_id" value={position.id} />
          <input type="hidden" name="slug" value={position.slug} />
          <button type="submit" className="btn-primary w-full">
            Confirmar postulación
          </button>
        </form>

        <Link href="/" className="mt-3 text-sm text-stone-500 hover:underline">
          Volver al organigrama
        </Link>
      </div>
    </div>
  );
}
