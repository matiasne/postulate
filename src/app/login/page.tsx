import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; message?: string };
}) {
  const next = searchParams.next ?? "";
  const user = await getCurrentUser();
  if (user && !next) redirect("/");

  const message =
    searchParams.message === "expired"
      ? "Tu sesión expiró. Volvé a iniciar sesión para continuar."
      : searchParams.message === "auth-required"
        ? "Necesitás iniciar sesión para continuar."
        : null;

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="mb-1 text-2xl font-bold text-stone-900">Iniciar sesión</h1>
        <p className="mb-4 text-sm text-stone-500">Ingresá para postularte o dejar referencias.</p>
        {message && <div className="alert-info mb-4">{message}</div>}
        <LoginForm next={next} />
      </div>
    </div>
  );
}
