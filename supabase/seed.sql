-- Portulate — organigrama fijo de Río Tercero.
-- Idempotente: reejecutar no duplica (on conflict por slug).

-- Raíz: Intendente
insert into public.positions (slug, title, description, parent_id, sort_order)
values (
  'intendente',
  'Intendente',
  'Máxima autoridad ejecutiva del municipio de Río Tercero. Conduce el gobierno y su equipo.',
  null,
  0
)
on conflict (slug) do nothing;

-- Equipo del Intendente (segundo nivel)
insert into public.positions (slug, title, description, parent_id, sort_order)
select v.slug, v.title, v.description, p.id, v.sort_order
from (values
  ('sec-gobierno',        'Secretaría de Gobierno',                     'Coordinación política, legal y administrativa del municipio.',        1),
  ('sec-economia',        'Secretaría de Economía y Finanzas',          'Presupuesto, recaudación y administración de los recursos públicos.', 2),
  ('sec-obras',           'Secretaría de Obras y Servicios Públicos',   'Infraestructura, obra pública y servicios a la comunidad.',           3),
  ('sec-salud',           'Secretaría de Salud',                        'Salud pública, hospitales y centros de atención primaria.',           4),
  ('sec-desarrollo',      'Secretaría de Desarrollo Social',            'Políticas sociales, inclusión y asistencia a la comunidad.',          5),
  ('sec-seguridad',       'Secretaría de Seguridad Ciudadana',          'Prevención, protección civil y convivencia ciudadana.',               6),
  ('sec-cultura',         'Secretaría de Cultura, Educación y Deporte', 'Cultura, educación municipal, deporte y juventud.',                   7)
) as v(slug, title, description, sort_order)
cross join (select id from public.positions where slug = 'intendente') p
on conflict (slug) do nothing;
