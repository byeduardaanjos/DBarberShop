insert into public.services(name,duration_minutes,price_cents,active) values
  ('Corte Tesoura',60,3500,true),
  ('Degradê',60,4000,true),
  ('Degradê Navalhado',60,4500,true),
  ('Barba',60,1500,true),
  ('Sobrancelha',60,1000,true),
  ('Tesoura + Barba',60,5000,true),
  ('Degradê + Barba',60,5500,true),
  ('Navalhado + Barba',60,6000,true),
  ('Completo Tesoura',60,6000,true),
  ('VIP',60,6500,true),
  ('Supremo',60,7000,true)
on conflict(name) do update set duration_minutes=60,price_cents=excluded.price_cents,active=true;

update public.services set active=false where name not in(
  'Corte Tesoura','Degradê','Degradê Navalhado','Barba','Sobrancelha','Tesoura + Barba',
  'Degradê + Barba','Navalhado + Barba','Completo Tesoura','VIP','Supremo'
);
