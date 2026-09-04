"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Postularse a una posición. Sin sesión -> login. Crea la candidatura (única
 * por usuario/posición) y redirige a completar el perfil.
 */
export async function applyToPosition(formData: FormData) {
  const positionId = String(formData.get("position_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!positionId) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?message=auth-required&next=${encodeURIComponent(`/postularme/${slug}`)}`);
  }

  // ¿Ya se postuló? (no puede postularse dos veces a la misma posición)
  const { data: existing } = await supabase
    .from("candidacies")
    .select("id")
    .eq("position_id", positionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/candidatos/${existing.id}/editar`);
  }

  const { data: created, error } = await supabase
    .from("candidacies")
    .insert({ position_id: positionId, user_id: user.id })
    .select("id")
    .single();

  if (error || !created) {
    // Choque con la restricción única (carrera): recuperar la existente.
    const { data: again } = await supabase
      .from("candidacies")
      .select("id")
      .eq("position_id", positionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (again) redirect(`/candidatos/${again.id}/editar`);
    throw new Error("No se pudo crear la candidatura. Intentá de nuevo.");
  }

  revalidatePath("/");
  redirect(`/candidatos/${created.id}/editar`);
}

export type ProfileState = { ok: boolean; error?: string; message?: string };

async function uploadTo(
  supabase: ReturnType<typeof createClient>,
  bucket: "avatars" | "cvs",
  userId: string,
  candidacyId: string,
  kind: string,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${candidacyId}/${kind}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`);
  return path;
}

/**
 * Actualiza el perfil de la candidatura: foto, CV y ubicación. Todo opcional.
 */
export async function updateCandidacyProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const candidacyId = String(formData.get("candidacy_id") ?? "");
  if (!candidacyId) return { ok: false, error: "Falta la candidatura." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };

  // Verificar propiedad
  const { data: candidacy } = await supabase
    .from("candidacies")
    .select("*")
    .eq("id", candidacyId)
    .maybeSingle();
  if (!candidacy) return { ok: false, error: "La candidatura no existe." };
  if (candidacy.user_id !== user.id) {
    return { ok: false, error: "No podés editar la candidatura de otra persona." };
  }

  const update: Record<string, unknown> = {};

  // Ubicación
  const latRaw = String(formData.get("location_lat") ?? "").trim();
  const lngRaw = String(formData.get("location_lng") ?? "").trim();
  const label = String(formData.get("location_label") ?? "").trim();
  if (latRaw && lngRaw) {
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      update.location_lat = lat;
      update.location_lng = lng;
    }
  }
  update.location_label = label || null;

  try {
    // Foto
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > MAX_FILE_BYTES) return { ok: false, error: "La foto supera los 8 MB." };
      if (!photo.type.startsWith("image/")) {
        return { ok: false, error: "La foto debe ser una imagen." };
      }
      update.photo_path = await uploadTo(supabase, "avatars", user.id, candidacyId, "photo", photo);
    }

    // CV
    const cv = formData.get("cv");
    if (cv instanceof File && cv.size > 0) {
      if (cv.size > MAX_FILE_BYTES) return { ok: false, error: "El CV supera los 8 MB." };
      update.cv_path = await uploadTo(supabase, "cvs", user.id, candidacyId, "cv", cv);
      update.cv_name = cv.name;
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al subir archivos." };
  }

  const { error } = await supabase.from("candidacies").update(update).eq("id", candidacyId);
  if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };

  revalidatePath(`/candidatos/${candidacyId}`);
  revalidatePath(`/candidatos/${candidacyId}/editar`);
  revalidatePath("/mis-candidaturas");

  return { ok: true, message: "Perfil actualizado." };
}
