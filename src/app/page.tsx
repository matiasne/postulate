import PositionCard from "@/components/PositionCard";
import { getOrganigrama } from "@/lib/queries";
import { LEMA } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { root, children, orphans } = await getOrganigrama();

  const noSeed = !root && children.length === 0 && orphans.length === 0;

  return (
    <div className="space-y-8">
      {/* Hero + lema */}
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 py-10 text-center text-white">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Candidaturas cívicas de Río Tercero
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/90">
          Cualquiera puede postularse a un cargo de gobierno. Conocé a quienes se animan,
          leé sus referencias y sumá la tuya.
        </p>
        <p className="mt-4">
          <span className="rounded-full bg-white/10 px-4 py-1 text-lg font-semibold uppercase tracking-widest text-white">
            {LEMA}
          </span>
        </p>
      </section>

      {noSeed ? (
        <div className="alert-info">
          Todavía no se cargó el organigrama. Ejecutá <code>supabase/seed.sql</code> en tu
          proyecto de Supabase.
        </div>
      ) : (
        <>
          {/* Intendente (raíz) */}
          {root && (
            <section className="space-y-3">
              <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-stone-400">
                Conducción
              </h2>
              <div className="mx-auto max-w-sm">
                <PositionCard position={root} featured />
              </div>
              <div className="mx-auto h-6 w-px bg-stone-300" aria-hidden />
            </section>
          )}

          {/* Equipo (segundo nivel) */}
          {children.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-stone-400">
                Equipo de gobierno
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((p) => (
                  <PositionCard key={p.id} position={p} />
                ))}
              </div>
            </section>
          )}

          {orphans.length > 0 && (
            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {orphans.map((p) => (
                  <PositionCard key={p.id} position={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
