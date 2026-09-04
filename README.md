# Portulate — candidaturas cívicas de Río Tercero

Plataforma abierta donde cualquiera puede **candidatearse** a un cargo de gobierno de
Río Tercero (Intendente y su equipo), cargar su perfil (foto, CV, ubicación en mapa),
recibir **referencias públicas** de otros usuarios y ver un **resumen de IA** de lo bueno
y lo malo. Lema: **mérito y valor**.

Stack: **Next.js 14 (App Router) + TypeScript**, **Supabase** (Postgres + Auth + Storage),
**Leaflet/OpenStreetMap** para el mapa, y **Anthropic (Claude)** para el resumen IA (con
fallback determinístico si no hay API key).

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

En tu proyecto de [supabase.com](https://supabase.com) → **Project Settings → API**, copiá
las claves a `.env.local` (basado en `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=              # opcional; sin ella se usa el fallback
```

En **Authentication → Providers → Email**, desactivá **"Confirm email"** para que el flujo
registro → entrar funcione al toque (si lo dejás activado, el usuario debe confirmar por
mail antes de iniciar sesión).

### 3. Correr las migraciones y el seed

En el **SQL Editor** de Supabase, ejecutá en orden:

1. `supabase/migrations/0001_init.sql` — tablas, RLS, buckets de Storage.
2. `supabase/seed.sql` — organigrama fijo (Intendente + secretarías).

Crea los buckets `avatars` y `cvs` (públicos) automáticamente.

### 4. Levantar la app

```bash
npm run dev
```

Abrí http://localhost:3000.

> **Nota sobre `next build`:** este entorno tiene `NODE_ENV=development` global, lo que
> hace que `next build` falle al prerenderizar las páginas de error. Para compilar en
> producción, forzá el entorno: `NODE_ENV=production npm run build`. El servidor de
> desarrollo (`npm run dev`) funciona sin cambios.

## Cómo está organizado

- **Organigrama (home)** — `src/app/page.tsx`: posiciones fijas jerárquicas; cada placeholder
  siempre muestra avatar vacío + "Postularme", y "Ver candidatos (N)" si hay postulantes.
- **Auth** — Supabase Auth (email + password); nombre y apellido reales van a `profiles`
  vía trigger `handle_new_user`.
- **Postularse / perfil** — `src/app/postularme/[slug]` y `src/app/candidatos/[id]/editar`:
  única postulación por usuario/posición; foto y CV a Storage; ubicación con mapa.
- **Detalle público** — `src/app/candidatos/[id]`: foto, CV, mapa, referencias, resumen IA.
- **Referencias + moderación** — texto + valoración a favor/en contra, atribuidas con nombre
  y apellido; límite por usuario/candidato; reportar → oculta la referencia.
- **Resumen IA** — `src/lib/ai/summary.ts`: pros/contras solo de referencias visibles;
  se regenera al agregar/ocultar referencias; no inventa nada si no hay referencias.

## Seguridad (RLS)

Todas las tablas tienen Row Level Security: lectura pública donde corresponde
(organigrama, candidatos, referencias visibles, resúmenes), escritura acotada al dueño
(candidaturas, referencias por autor). La moderación (ocultar una referencia) se hace del
lado servidor con la `service_role`.
