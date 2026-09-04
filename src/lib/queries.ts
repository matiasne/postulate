import { createClient } from "@/lib/supabase/server";
import type { Database, Stance } from "@/lib/database.types";

type Position = Database["public"]["Tables"]["positions"]["Row"];
type Candidacy = Database["public"]["Tables"]["candidacies"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type PositionWithCount = Position & { candidateCount: number };

export type Organigrama = {
  root: PositionWithCount | null;
  children: PositionWithCount[];
  /** posiciones sin padre distintas de la raíz (por robustez) */
  orphans: PositionWithCount[];
};

/** Todas las posiciones con su cantidad de candidatos, agrupadas por jerarquía. */
export async function getOrganigrama(): Promise<Organigrama> {
  const supabase = createClient();

  let positions: Position[] | null = null;
  let candidacies: { id: string; position_id: string }[] | null = null;
  try {
    const [posRes, candRes] = await Promise.all([
      supabase.from("positions").select("*").order("sort_order", { ascending: true }),
      supabase.from("candidacies").select("id, position_id"),
    ]);
    positions = posRes.data as Position[] | null;
    candidacies = candRes.data as { id: string; position_id: string }[] | null;
  } catch {
    // Supabase no configurado / inaccesible: mostramos estado vacío.
    return { root: null, children: [], orphans: [] };
  }

  const counts = new Map<string, number>();
  for (const c of candidacies ?? []) {
    counts.set(c.position_id, (counts.get(c.position_id) ?? 0) + 1);
  }

  const withCounts: PositionWithCount[] = (positions ?? []).map((p) => ({
    ...p,
    candidateCount: counts.get(p.id) ?? 0,
  }));

  const root = withCounts.find((p) => p.parent_id === null) ?? null;
  const children = withCounts.filter((p) => p.parent_id && p.parent_id === root?.id);
  const orphans = withCounts.filter(
    (p) => p.parent_id !== null && p.parent_id !== root?.id,
  );

  return { root, children, orphans };
}

export async function getPositionBySlug(slug: string): Promise<Position | null> {
  const supabase = createClient();
  const { data } = await supabase.from("positions").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export type CandidacyWithProfile = Candidacy & { profile: Profile | null };

/** Candidatos de una posición (público). */
export async function getCandidatesForPosition(
  positionId: string,
): Promise<CandidacyWithProfile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("candidacies")
    .select("*, profile:profiles(*)")
    .eq("position_id", positionId)
    .order("created_at", { ascending: true });
  return (data as unknown as CandidacyWithProfile[]) ?? [];
}

export type ReferenceWithAuthor =
  Database["public"]["Tables"]["candidate_references"]["Row"] & {
    author: Pick<Profile, "first_name" | "last_name"> | null;
  };

export type CandidacyDetail = {
  candidacy: Candidacy;
  profile: Profile | null;
  position: Position | null;
  references: ReferenceWithAuthor[];
  summary: Database["public"]["Tables"]["ai_summaries"]["Row"] | null;
};

/** Detalle público de un candidato: perfil, posición, referencias visibles, resumen. */
export async function getCandidacyDetail(id: string): Promise<CandidacyDetail | null> {
  const supabase = createClient();

  const { data: candidacy } = await supabase
    .from("candidacies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!candidacy) return null;

  const [{ data: profile }, { data: position }, { data: references }, { data: summary }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", candidacy.user_id).maybeSingle(),
      supabase.from("positions").select("*").eq("id", candidacy.position_id).maybeSingle(),
      supabase
        .from("candidate_references")
        .select("*, author:profiles(first_name, last_name)")
        .eq("candidacy_id", id)
        .eq("hidden", false)
        .order("created_at", { ascending: false }),
      supabase.from("ai_summaries").select("*").eq("candidacy_id", id).maybeSingle(),
    ]);

  return {
    candidacy,
    profile,
    position,
    references: (references as unknown as ReferenceWithAuthor[]) ?? [],
    summary: summary ?? null,
  };
}

/** Candidatura del usuario para una posición dada (o null). */
export async function getUserCandidacy(
  positionId: string,
  userId: string,
): Promise<Candidacy | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("candidacies")
    .select("*")
    .eq("position_id", positionId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/** Candidaturas del usuario (para "Mis candidaturas"). */
export async function getMyCandidacies(userId: string): Promise<(Candidacy & { position: Position | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("candidacies")
    .select("*, position:positions(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as unknown as (Candidacy & { position: Position | null })[]) ?? [];
}

export type { Position, Candidacy, Profile, Stance };
