"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_REFERENCES_PER_CANDIDATE } from "@/lib/constants";
import { generateSummary } from "@/lib/ai/summary";
import type { Stance } from "@/lib/database.types";

export type ReferenceState = { ok: boolean; error?: string; message?: string };

/** Dejar una referencia (texto + valoración a favor/en contra). */
export async function addReference(
  _prev: ReferenceState,
  formData: FormData,
): Promise<ReferenceState> {
  const candidacyId = String(formData.get("candidacy_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const stanceRaw = String(formData.get("stance") ?? "");

  if (!candidacyId) return { ok: false, error: "Falta la candidatura." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Necesitás iniciar sesión para dejar una referencia." };
  }

  // Validaciones de estado visibles
  if (!body) return { ok: false, error: "La referencia no puede estar vacía." };
  if (stanceRaw !== "favor" && stanceRaw !== "contra") {
    return { ok: false, error: "Elegí una valoración: a favor o en contra." };
  }
  const stance = stanceRaw as Stance;

  // Verificar que la candidatura existe
  const { data: candidacy } = await supabase
    .from("candidacies")
    .select("id")
    .eq("id", candidacyId)
    .maybeSingle();
  if (!candidacy) return { ok: false, error: "La candidatura no existe." };

  // Límite por usuario/candidato (anti inundación)
  const { count } = await supabase
    .from("candidate_references")
    .select("id", { count: "exact", head: true })
    .eq("candidacy_id", candidacyId)
    .eq("author_id", user.id);

  if ((count ?? 0) >= MAX_REFERENCES_PER_CANDIDATE) {
    return {
      ok: false,
      error: `Ya dejaste ${MAX_REFERENCES_PER_CANDIDATE} referencias a este candidato (el máximo permitido).`,
    };
  }

  const { error } = await supabase.from("candidate_references").insert({
    candidacy_id: candidacyId,
    author_id: user.id,
    body,
    stance,
  });
  if (error) return { ok: false, error: `No se pudo guardar la referencia: ${error.message}` };

  // Regenerar el resumen IA con la nueva referencia visible.
  try {
    await generateSummary(candidacyId);
  } catch {
    // El resumen es best-effort; no bloquea la referencia.
  }

  revalidatePath(`/candidatos/${candidacyId}`);
  return { ok: true, message: "¡Gracias! Tu referencia se publicó." };
}

/**
 * Reportar una referencia. Moderación desde el inicio: al reportarla se oculta
 * de la vista pública (con service role, ya que el usuario no es el autor).
 */
export async function reportReference(formData: FormData) {
  const referenceId = String(formData.get("reference_id") ?? "");
  const candidacyId = String(formData.get("candidacy_id") ?? "");
  if (!referenceId) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Registrar el reporte (único por usuario/referencia; ignora duplicados).
  await supabase
    .from("reference_reports")
    .insert({ reference_id: referenceId, reporter_id: user.id });

  // Ocultar la referencia (moderación) con privilegios de servicio.
  const admin = createAdminClient();
  await admin.from("candidate_references").update({ hidden: true }).eq("id", referenceId);

  // El conjunto visible cambió: regenerar el resumen.
  if (candidacyId) {
    try {
      await generateSummary(candidacyId);
    } catch {
      /* best-effort */
    }
    revalidatePath(`/candidatos/${candidacyId}`);
  }
}

/** Regenerar manualmente el resumen IA (requiere sesión). */
export async function regenerateSummaryAction(formData: FormData) {
  const candidacyId = String(formData.get("candidacy_id") ?? "");
  if (!candidacyId) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await generateSummary(candidacyId);
  } catch {
    /* best-effort */
  }
  revalidatePath(`/candidatos/${candidacyId}`);
}
