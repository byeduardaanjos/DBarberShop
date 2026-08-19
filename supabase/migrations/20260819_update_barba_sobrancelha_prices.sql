update public.services
set price_cents = case name
  when 'Barba' then 1000
  when 'Sobrancelha' then 500
  else price_cents
end
where name in ('Barba', 'Sobrancelha');

update public.services
set price_cents = case name
  when 'Tesoura + Barba' then 4500
  when 'Degradê + Barba' then 5000
  when 'Navalhado + Barba' then 5500
  when 'Completo Tesoura' then 5000
  when 'Degradê + Barba + Sobrancelha' then 5500
  when 'Degradê Navalhado + Barba + Sobrancelha' then 6000
  else price_cents
end
where name in (
  'Tesoura + Barba',
  'Degradê + Barba',
  'Navalhado + Barba',
  'Completo Tesoura',
  'Degradê + Barba + Sobrancelha',
  'Degradê Navalhado + Barba + Sobrancelha'
);
