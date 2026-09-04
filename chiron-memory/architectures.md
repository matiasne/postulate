# architecture

How the system is put together — layers, boundaries, and how data flows.

## Esquema de datos: tablas profiles, positions, candidacies, candidate_references, referenc…

What: Esquema de datos: tablas profiles, positions, candidacies, candidate_references, reference_reports y ai_summaries, todas con RLS habilitado · Why: — · Where: supabase/migrations/0001_init.sql <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-3 -->

## El organigrama semilla es Intendente (raíz) + 7 secretarías: Gobierno, Economía y Finanza…

What: El organigrama semilla es Intendente (raíz) + 7 secretarías: Gobierno, Economía y Finanzas, Obras y Servicios Públicos, Salud, Desarrollo Social, Seguridad Ciudadana, y Cultura/Educación/Deporte · Why: — · Where: supabase/seed.sql <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-4 -->

## La ubicación del candidato se elige y muestra con Leaflet + tiles de OpenStreetMap, usand…

What: La ubicación del candidato se elige y muestra con Leaflet + tiles de OpenStreetMap, usando Nominatim para el buscador de direcciones, sin requerir API key · Why: — · Where: src/components/map/* <!-- id: 5d48b832-6c47-44df-8a0a-aedfec1be617-5 -->
