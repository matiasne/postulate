/** Traduce errores de Supabase Auth a mensajes claros en español. */
export function translateAuthError(message: string | undefined | null): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Credenciales inválidas. Revisá tu email y contraseña.";
  }
  if (m.includes("email not confirmed")) {
    return "Tu email todavía no está confirmado. Revisá tu casilla.";
  }
  if (
    m.includes("user already registered") ||
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("duplicate key") ||
    m.includes("already exists")
  ) {
    return "Ese email ya está registrado. Probá iniciar sesión.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña es demasiado corta (mínimo 6 caracteres).";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "El email no es válido.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Demasiados intentos. Esperá un momento y volvé a probar.";
  }
  return message || "Ocurrió un error. Intentá de nuevo.";
}
