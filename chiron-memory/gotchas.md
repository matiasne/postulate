# gotcha

A non-obvious pitfall or trap, learned the hard way.

## La versión de @anthropic-ai/sdk que quedó instalada por defecto (0.32.1) es vieja y no so…

What: La versión de @anthropic-ai/sdk que quedó instalada por defecto (0.32.1) es vieja y no soporta `output_config` (salida estructurada) · Why: — · Learned: hay que instalar @anthropic-ai/sdk@latest (terminó en 0.123.x) para poder usar salida estructurada y `effort` <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-10 -->

## `next build` falla al prerenderizar estáticamente /404 y /500 con un error engañoso ('<Ht…

What: `next build` falla al prerenderizar estáticamente /404 y /500 con un error engañoso ('<Html> should not be imported' / 'useContext null') cuando NODE_ENV no está explícitamente en 'production' en el shell · Why: — · Learned: correr siempre `NODE_ENV=production npm run build` en este proyecto <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-11 -->

## El layout raíz renderiza Header→getUser() en toda ruta, incluidas las páginas de error (4…

What: El layout raíz renderiza Header→getUser() en toda ruta, incluidas las páginas de error (404/500) que se prerenderizan estáticamente · Why: — · Learned: los helpers de auth (src/lib/auth.ts) deben capturar errores y devolver null en vez de lanzar cuando Supabase no responde (URL placeholder, red caída, sesión inválida), si no el build entero falla <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-12 -->

## Tipar el cliente de Supabase con el generic `Database` escrito a mano hace que TypeScript…

What: Tipar el cliente de Supabase con el generic `Database` escrito a mano hace que TypeScript infiera `never` en selects/inserts acotados y rompe el build · Why: — · Where: src/lib/supabase/client.ts, server.ts, admin.ts, middleware.ts · Learned: dejar los cuatro factories de cliente (client/server/admin/middleware) sin el generic y castear manualmente en las queries <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-9 -->
