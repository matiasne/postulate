import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Usuario autenticado actual (o null). Verifica contra el servidor de Auth. */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Sin credenciales válidas / red caída / sesión expirada -> tratamos como no logueado.
    return null;
  }
}

/** Usuario + su profile (nombre/apellido). Null si no hay sesión. */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return data as Profile | null;
  } catch {
    return null;
  }
}

export function displayName(p: { first_name: string; last_name: string } | null | undefined) {
  if (!p) return "Usuario";
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name.length > 0 ? name : "Usuario";
}
