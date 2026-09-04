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
