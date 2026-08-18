insert into public.services(name,duration_minutes,price_cents,active) values
  ('Degradê + Barba + Sobrancelha',60,6500,true),
  ('Degradê Navalhado + Barba + Sobrancelha',60,7000,true)
on conflict(name) do update set
  duration_minutes=excluded.duration_minutes,
  price_cents=excluded.price_cents,
  active=true;

update public.services
set active=false
where name in ('VIP','Supremo');
