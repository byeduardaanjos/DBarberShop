insert into public.services (name, duration_minutes, price_cents, active)
values
  ('Corte Tesoura', 60, 3500, true),
  ('Barba', 60, 1500, true),
  ('Sobrancelha', 60, 1000, true),
  ('Corte + Barba', 60, 4500, true),
  ('Corte + Sobrancelha', 60, 4500, true),
  ('Corte + Barba + Sobrancelha', 60, 5000, true)
on conflict (name) do update set
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  active = excluded.active;

update public.services
set active = false
where name not in (
  'Corte Tesoura',
  'Barba',
  'Sobrancelha',
  'Corte + Barba',
  'Corte + Sobrancelha',
  'Corte + Barba + Sobrancelha'
);
