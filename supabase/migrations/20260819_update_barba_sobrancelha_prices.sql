update public.services
set price_cents = case name
  when 'Barba' then 1000
  when 'Sobrancelha' then 500
  else price_cents
end
where name in ('Barba', 'Sobrancelha');
