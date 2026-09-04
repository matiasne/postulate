"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import MapPicker from "@/components/map/MapPicker";
import { updateCandidacyProfile, type ProfileState } from "@/app/actions/candidacy";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Guardando…" : "Guardar perfil"}
    </button>
  );
}

export default function ProfileEditForm({
  candidacyId,
  photoUrl,
  cvUrl,
  cvName,
  lat,
  lng,
  label,
}: {
  candidacyId: string;
  photoUrl: string | null;
  cvUrl: string | null;
  cvName: string | null;
  lat: number | null;
  lng: number | null;
  label: string | null;
}) {
  const [state, formAction] = useFormState<ProfileState, FormData>(updateCandidacyProfile, {
    ok: false,
  });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="candidacy_id" value={candidacyId} />

      {state.error && <div className="alert-error">{state.error}</div>}
      {state.ok && state.message && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.message}{" "}
          <Link href={`/candidatos/${candidacyId}`} className="font-semibold underline">
            Ver mi perfil público
          </Link>
        </div>
      )}

      {/* Foto */}
      <div>
        <label className="label">Foto</label>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="Foto actual"
              width={72}
              height={72}
              className="h-18 w-18 rounded-full object-cover"
              style={{ height: 72, width: 72 }}
              unoptimized
            />
          ) : (
            <span className="text-sm text-stone-400">Sin foto todavía.</span>
          )}
          <input type="file" name="photo" accept="image/*" className="text-sm" />
        </div>
      </div>

      {/* CV */}
      <div>
        <label className="label">CV (archivo)</label>
        <div className="flex items-center gap-4">
          {cvUrl ? (
            <a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
              {cvName || "CV actual"}
            </a>
          ) : (
            <span className="text-sm text-stone-400">Sin CV todavía.</span>
          )}
          <input type="file" name="cv" accept=".pdf,.doc,.docx,application/pdf" className="text-sm" />
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className="label">¿Dónde vivís? (para el mapa)</label>
        <MapPicker initialLat={lat} initialLng={lng} initialLabel={label} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link href={`/candidatos/${candidacyId}`} className="btn-ghost">
          Ver perfil público
        </Link>
      </div>
    </form>
  );
}
