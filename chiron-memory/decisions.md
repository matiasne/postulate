# decision

A choice made and the reasoning behind it — the path taken over the alternatives.

## Stack y auth de Portulate

**What:** Next.js 14 (App Router, no 15) + React 18, Supabase (Auth + Postgres + Storage),
Leaflet/OpenStreetMap para mapas, Anthropic SDK (`claude-opus-4-8`) para el resumen IA con
fallback determinístico. Auth = Supabase Auth (email+password); nombre/apellido reales se
guardan en `public.profiles` vía trigger `handle_new_user` sobre `auth.users`.
**Why:** El usuario pidió usar su instancia de Supabase. Next 14 + React 18 porque
react-leaflet 4 requiere React 18 (react-leaflet 5 pide React 19).
**Where:** `src/lib/supabase/*`, `supabase/migrations/0001_init.sql`, `supabase/seed.sql`.
**Learned:** 2026-09-04, al construir la plataforma desde cero.

## Cliente Supabase sin genérico `<Database>`

**What:** Los factories de cliente (`client/server/admin/middleware`) NO pasan el genérico
`<Database>` de tipos hechos a mano. Los tipos de dominio viven en `src/lib/database.types.ts`
y se usan casteando resultados en `src/lib/queries.ts`.
**Why:** El `@supabase/supabase-js` instalado (2.x nuevo) resolvía los tipos `Insert` a `never`
con un `Database` hecho a mano, rompiendo `.insert()`. Sin el genérico, las llamadas quedan
laxas (`any`) y el casteo en queries da el tipado que usamos.
**Where:** `src/lib/supabase/*.ts`, `src/lib/queries.ts`.
**Learned:** 2026-09-04.

## `next build` requiere NODE_ENV=production en este entorno

**What:** El entorno tiene `NODE_ENV=development` global. `next build` entonces prerenderiza
las páginas de error con el runtime de desarrollo y falla con
"Cannot read properties of null (reading 'useContext')" / "<Html> should not be imported".
**Why:** NODE_ENV no estándar durante el build.
**How to apply:** Compilar con `NODE_ENV=production npm run build`. `npm run dev` anda igual.
**Where:** raíz del proyecto.
**Learned:** 2026-09-04.

## Resiliencia de auth/queries sin credenciales

**What:** `getCurrentUser`/`getCurrentProfile` (auth.ts) y `getOrganigrama` (queries.ts) están
envueltos en try/catch y devuelven null/vacío ante fallos. Así la app bootea aunque Supabase
no esté configurado (muestra estado logueado-fuera / "correr seed") y no crashea el layout.
**Why:** El `Header` corre en todo render (incluye páginas 404/500 en build) y llamaba a
`auth.getUser()` contra la URL placeholder, tirando el prerender.
**Where:** `src/lib/auth.ts`, `src/lib/queries.ts`.
**Learned:** 2026-09-04.

## Se eligió Next.js 14 (App Router) + TypeScript + Supabase (Auth + Postgres + Storage) en…

What: Se eligió Next.js 14 (App Router) + TypeScript + Supabase (Auth + Postgres + Storage) en vez de la propuesta inicial de Prisma/SQLite · Why: el usuario pidió explícitamente usar una instancia de Supabase ya existente en la nube · Where: package.json, src/lib/supabase/* <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-0 -->

## El login/registro usa Supabase Auth (no una auth propia por cookie sobre Postgres)

What: El login/registro usa Supabase Auth (no una auth propia por cookie sobre Postgres) · Why: opción recomendada elegida por el usuario al cambiar a Supabase; nombre y apellido se guardan en la tabla profiles vía trigger al registrarse · Where: src/lib/auth.ts, src/app/auth/actions.ts <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-1 -->

## El layout raíz se marcó como dynamic (force-dynamic)

What: El layout raíz se marcó como dynamic (force-dynamic) · Why: la app depende de cookies/sesión en casi toda página (auth + DB), así que no tiene sentido intentar prerender estático · Where: src/app/layout.tsx <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-13 -->

## Se bajó Next.js de la versión 15 propuesta inicialmente a 14.2.33 (con React 18)

What: Se bajó Next.js de la versión 15 propuesta inicialmente a 14.2.33 (con React 18) · Why: al actualizar el SDK de Anthropic aparecieron fallos de build encadenados con Next 15; se optó por una versión 14 parcheada y estable en su lugar <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-14 -->

## El resumen IA de referencias usa Anthropic (claude-opus-4-8) con un fallback determinísti…

What: El resumen IA de referencias usa Anthropic (claude-opus-4-8) con un fallback determinístico cuando no hay ANTHROPIC_API_KEY · Why: opción 'Anthropic + fallback' aprobada explícitamente por el usuario, así la app funciona siempre aunque sin key el resumen no sea generado por IA · Where: src/lib/ai/summary.ts <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-2 -->
