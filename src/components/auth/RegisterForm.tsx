"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/authErrors";

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Ingresá tu nombre y apellido reales (se muestran en tus referencias).");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
      },
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    // Con confirmación de email desactivada, signUp deja al usuario logueado.
    // Si el email ya existía, Supabase devuelve un usuario sin identidades nuevas.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Ese email ya está registrado. Probá iniciar sesión.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Confirmación de email activada: no hay sesión todavía.
      setInfo("Te enviamos un email para confirmar tu cuenta. Confirmala y luego iniciá sesión.");
      setLoading(false);
      return;
    }

    router.push(next || "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert-error">{error}</div>}
      {info && <div className="alert-info">{info}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="firstName">
            Nombre
          </label>
          <input
            id="firstName"
            required
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="label" htmlFor="lastName">
            Apellido
          </label>
          <input
            id="lastName"
            required
            className="input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-stone-500">Mínimo 6 caracteres.</p>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-brand hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
