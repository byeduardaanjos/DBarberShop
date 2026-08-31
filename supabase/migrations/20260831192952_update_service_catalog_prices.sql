insert into public.services (name, duration_minutes, price_cents, active)
values
  ('Barba', 60, 3000, true),
  ('Corte', 60, 4000, true),
  ('Corte de Tesoura', 60, 4500, true),
  ('Sobrancelha', 60, 1000, true),
  ('Corte + Sobrancelha', 60, 5000, true),
  ('Corte + Sobrancelha + Barba', 60, 7000, true)
on conflict (name) do update set
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  active = true;

update public.services
set active = false
where name not in (
  'Barba',
  'Corte',
  'Corte de Tesoura',
  'Sobrancelha',
  'Corte + Sobrancelha',
  'Corte + Sobrancelha + Barba'
);
