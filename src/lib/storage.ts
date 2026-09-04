const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** URL pública de un objeto en un bucket público de Supabase Storage. */
export function publicUrl(bucket: "avatars" | "cvs", path: string | null | undefined): string | null {
  if (!path) return null;
  return `${BASE}/storage/v1/object/public/${bucket}/${path}`;
}
