insert into public.services(name,duration_minutes,price_cents,active) values
  ('Degradê',60,3500,true),
  ('Degradê Navalhado',60,4000,true),
  ('Sobrancelha',60,1000,true),
  ('Barba',60,1500,true),
  ('Corte na Tesoura',60,3500,true)
on conflict(name) do update set duration_minutes=60,price_cents=excluded.price_cents,active=true;

update public.services set active=false where name not in('Degradê','Degradê Navalhado','Sobrancelha','Barba','Corte na Tesoura');

alter table public.bookings add column if not exists selected_services text[];
alter table public.bookings add column if not exists total_price_cents integer;
update public.bookings b set selected_services=array[s.name],total_price_cents=s.price_cents from public.services s where b.service_id=s.id and (b.selected_services is null or b.total_price_cents is null);
alter table public.bookings alter column selected_services set not null;
alter table public.bookings alter column total_price_cents set not null;
alter table public.bookings drop constraint if exists bookings_selected_services_check;
alter table public.bookings add constraint bookings_selected_services_check check(cardinality(selected_services) between 1 and 5);
alter table public.bookings drop constraint if exists bookings_total_price_cents_check;
alter table public.bookings add constraint bookings_total_price_cents_check check(total_price_cents>=0);

create or replace function public.create_public_booking(p_service_names text[],p_booking_date date,p_booking_time time without time zone,p_customer_name text,p_customer_phone text,p_manage_token_hash text) returns uuid language plpgsql security definer set search_path='' as $function$
declare v_service_ids uuid[];v_service_names text[];v_total integer;v_booking_id uuid;v_customer_id uuid;v_phone_normalized text;
begin
 perform pg_advisory_xact_lock(hashtext(p_booking_date::text));
 if cardinality(p_service_names) not between 1 and 5 or cardinality(p_service_names)<>(select count(distinct value) from unnest(p_service_names) value) then raise exception 'invalid_service';end if;
 if char_length(trim(p_customer_name)) not between 2 and 100 or char_length(trim(p_customer_phone)) not between 10 and 30 then raise exception 'invalid_customer';end if;
 if p_manage_token_hash!~'^[0-9a-f]{64}$' then raise exception 'invalid_token';end if;
 v_phone_normalized:=regexp_replace(p_customer_phone,'[^0-9]','','g');
 if char_length(v_phone_normalized) not between 10 and 15 then raise exception 'invalid_customer';end if;
 select array_agg(s.id order by chosen.position),array_agg(s.name order by chosen.position),sum(s.price_cents)::integer into v_service_ids,v_service_names,v_total from unnest(p_service_names) with ordinality chosen(name,position) join public.services s on s.name=chosen.name and s.active=true;
 if cardinality(v_service_ids)<>cardinality(p_service_names) then raise exception 'invalid_service';end if;
 if not public.booking_slot_is_valid(p_booking_date,p_booking_time,60) then raise exception 'invalid_slot';end if;
 if(select count(*) from public.bookings b where regexp_replace(b.customer_phone,'[^0-9]','','g')=v_phone_normalized and b.status='confirmed' and b.booking_date>=(now() at time zone 'America/Sao_Paulo')::date)>=3 then raise exception 'too_many_active_bookings';end if;
 if exists(select 1 from public.bookings b where regexp_replace(b.customer_phone,'[^0-9]','','g')=v_phone_normalized and b.created_at>now()-interval '2 minutes') then raise exception 'too_many_requests';end if;
 if exists(select 1 from public.availability_blocks ab where ab.block_date=p_booking_date and(ab.block_time is null or int4range((extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer,(extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer+60,'[)')&&int4range((extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer,(extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer+60,'[)'))) then raise exception 'slot_unavailable';end if;
 insert into public.customers(name,phone,phone_normalized) values(trim(p_customer_name),trim(p_customer_phone),v_phone_normalized) on conflict(phone_normalized) do update set name=excluded.name,phone=excluded.phone,updated_at=now() returning id into v_customer_id;
 begin insert into public.bookings(service_id,customer_id,customer_name,customer_phone,booking_date,booking_time,duration_minutes,manage_token_hash,selected_services,total_price_cents) values(v_service_ids[1],v_customer_id,trim(p_customer_name),trim(p_customer_phone),p_booking_date,p_booking_time,60,p_manage_token_hash,v_service_names,v_total) returning id into v_booking_id;
 exception when unique_violation or exclusion_violation then raise exception 'slot_unavailable';end;
 return v_booking_id;
end;$function$;
revoke all on function public.create_public_booking(text[],date,time without time zone,text,text,text) from public,authenticated;
grant execute on function public.create_public_booking(text[],date,time without time zone,text,text,text) to anon;

drop function if exists public.get_public_booking(uuid,text);
create function public.get_public_booking(p_booking_id uuid,p_manage_token_hash text) returns table(id uuid,customer_name text,service_name text,selected_services text[],total_price_cents integer,duration_minutes integer,booking_date date,booking_time time without time zone,status text) language sql stable security definer set search_path='' as $function$
select b.id,b.customer_name,s.name,b.selected_services,b.total_price_cents,b.duration_minutes,b.booking_date,b.booking_time,b.status from public.bookings b join public.services s on s.id=b.service_id where b.id=p_booking_id and b.manage_token_hash=p_manage_token_hash;
$function$;
revoke all on function public.get_public_booking(uuid,text) from public,authenticated;
grant execute on function public.get_public_booking(uuid,text) to anon;
