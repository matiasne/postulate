import Link from "next/link";
import { getCurrentProfile, displayName } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import { LEMA } from "@/lib/constants";

export default async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tight text-brand">Portulate</span>
          <span className="hidden text-sm italic text-gold sm:inline">· {LEMA}</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {profile ? (
            <>
              <Link href="/mis-candidaturas" className="btn-ghost">
                Mis candidaturas
              </Link>
              <span className="hidden text-stone-500 sm:inline">
                Hola, <strong className="text-stone-800">{displayName(profile)}</strong>
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-primary">
                Registrarme
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
