import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next ?? "";
  const user = await getCurrentUser();
  if (user && !next) redirect("/");

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="mb-1 text-2xl font-bold text-stone-900">Crear cuenta</h1>
        <p className="mb-4 text-sm text-stone-500">
          Usamos tu nombre y apellido reales: aparecen en las referencias que dejes.
        </p>
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
