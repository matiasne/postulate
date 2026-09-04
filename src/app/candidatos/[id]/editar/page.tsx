import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCandidacyDetail } from "@/lib/queries";
import { getCurrentUser, displayName } from "@/lib/auth";
import { publicUrl } from "@/lib/storage";
import ProfileEditForm from "@/components/ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function EditCandidacyPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getCandidacyDetail(params.id);
  if (!detail) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?message=auth-required&next=${encodeURIComponent(`/candidatos/${params.id}/editar`)}`);
  }

  if (detail.candidacy.user_id !== user.id) {
    // No es dueño: lo mandamos al detalle público.
    redirect(`/candidatos/${params.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/mis-candidaturas" className="text-sm text-stone-500 hover:underline">
          ← Mis candidaturas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          Perfil de candidatura · {detail.position?.title}
        </h1>
        <p className="text-sm text-stone-500">
          {displayName(detail.profile)} — completá lo que quieras, todo es opcional.
        </p>
      </div>

      <div className="card p-6">
        <ProfileEditForm
          candidacyId={detail.candidacy.id}
          photoUrl={publicUrl("avatars", detail.candidacy.photo_path)}
          cvUrl={publicUrl("cvs", detail.candidacy.cv_path)}
          cvName={detail.candidacy.cv_name}
          lat={detail.candidacy.location_lat}
          lng={detail.candidacy.location_lng}
          label={detail.candidacy.location_label}
        />
      </div>
    </div>
  );
}
