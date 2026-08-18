create extension if not exists btree_gist with schema extensions;

create table if not exists public.availability_blocks(id uuid primary key default gen_random_uuid(),block_date date not null,block_time time without time zone,reason text not null default '' check(char_length(reason)<=120),created_at timestamptz not null default now());
alter table public.availability_blocks enable row level security;
revoke all on public.availability_blocks from anon;
grant select,insert,delete on public.availability_blocks to authenticated;
drop policy if exists barber_can_read_availability_blocks on public.availability_blocks;
create policy barber_can_read_availability_blocks on public.availability_blocks for select to authenticated using(((select auth.jwt())->'app_metadata'->>'role')='barber');
drop policy if exists barber_can_insert_availability_blocks on public.availability_blocks;
create policy barber_can_insert_availability_blocks on public.availability_blocks for insert to authenticated with check(((select auth.jwt())->'app_metadata'->>'role')='barber');
drop policy if exists barber_can_delete_availability_blocks on public.availability_blocks;
create policy barber_can_delete_availability_blocks on public.availability_blocks for delete to authenticated using(((select auth.jwt())->'app_metadata'->>'role')='barber');
create unique index if not exists availability_blocks_full_day_unique on public.availability_blocks(block_date) where block_time is null;
create unique index if not exists availability_blocks_slot_unique on public.availability_blocks(block_date,block_time) where block_time is not null;

alter table public.bookings add column if not exists manage_token_hash text;
alter table public.bookings drop constraint if exists bookings_manage_token_hash_check;
alter table public.bookings add constraint bookings_manage_token_hash_check check(manage_token_hash is null or manage_token_hash ~ '^[0-9a-f]{64}$');
alter table public.bookings add column if not exists duration_minutes integer;
update public.bookings b set duration_minutes=s.duration_minutes from public.services s where b.service_id=s.id and b.duration_minutes is null;
alter table public.bookings alter column duration_minutes set not null;
alter table public.bookings drop constraint if exists bookings_duration_minutes_check;
alter table public.bookings add constraint bookings_duration_minutes_check check(duration_minutes between 5 and 240);
alter table public.bookings add column if not exists booking_start_minutes integer generated always as((extract(hour from booking_time)::integer*60)+extract(minute from booking_time)::integer) stored;
create index if not exists bookings_manage_token_hash_idx on public.bookings(id,manage_token_hash) where manage_token_hash is not null;
drop index if exists public.bookings_one_active_slot;
alter table public.bookings drop constraint if exists bookings_no_confirmed_overlap;
alter table public.bookings add constraint bookings_no_confirmed_overlap exclude using gist(booking_date with =,int4range(booking_start_minutes,booking_start_minutes+duration_minutes,'[)') with &&) where(status='confirmed');

create or replace function public.booking_slot_is_valid(p_date date,p_time time without time zone,p_duration integer) returns boolean language sql stable set search_path='' as $function$
select p_date between (now() at time zone 'America/Sao_Paulo')::date and ((now() at time zone 'America/Sao_Paulo')::date+90)
and extract(dow from p_date)<>0
and p_time in('08:00'::time,'09:00'::time,'10:00'::time,'11:00'::time,'12:00'::time,'13:00'::time,'14:00'::time,'15:00'::time,'16:00'::time,'17:00'::time)
and ((extract(hour from p_time)::integer*60)+extract(minute from p_time)::integer+p_duration)<=1050
and (p_date+p_time)>=((now() at time zone 'America/Sao_Paulo')+interval '1 hour');
$function$;

create or replace function public.create_public_booking(p_service_name text,p_booking_date date,p_booking_time time without time zone,p_customer_name text,p_customer_phone text,p_manage_token_hash text) returns uuid language plpgsql security definer set search_path='' as $function$
declare v_service_id uuid;v_duration integer;v_booking_id uuid;v_customer_id uuid;v_phone_normalized text;
begin
 perform pg_advisory_xact_lock(hashtext(p_booking_date::text));
 if char_length(trim(p_customer_name)) not between 2 and 100 or char_length(trim(p_customer_phone)) not between 10 and 30 then raise exception 'invalid_customer';end if;
 if p_manage_token_hash!~'^[0-9a-f]{64}$' then raise exception 'invalid_token';end if;
 v_phone_normalized:=regexp_replace(p_customer_phone,'[^0-9]','','g');
 if char_length(v_phone_normalized) not between 10 and 15 then raise exception 'invalid_customer';end if;
 select id,duration_minutes into v_service_id,v_duration from public.services where name=p_service_name and active=true;
 if v_service_id is null then raise exception 'invalid_service';end if;
 if not public.booking_slot_is_valid(p_booking_date,p_booking_time,v_duration) then raise exception 'invalid_slot';end if;
 if(select count(*) from public.bookings b where regexp_replace(b.customer_phone,'[^0-9]','','g')=v_phone_normalized and b.status='confirmed' and b.booking_date>=(now() at time zone 'America/Sao_Paulo')::date)>=3 then raise exception 'too_many_active_bookings';end if;
 if exists(select 1 from public.bookings b where regexp_replace(b.customer_phone,'[^0-9]','','g')=v_phone_normalized and b.created_at>now()-interval '2 minutes') then raise exception 'too_many_requests';end if;
 if exists(select 1 from public.availability_blocks ab where ab.block_date=p_booking_date and(ab.block_time is null or int4range((extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer,(extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer+60,'[)')&&int4range((extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer,(extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer+v_duration,'[)'))) then raise exception 'slot_unavailable';end if;
 insert into public.customers(name,phone,phone_normalized) values(trim(p_customer_name),trim(p_customer_phone),v_phone_normalized) on conflict(phone_normalized) do update set name=excluded.name,phone=excluded.phone,updated_at=now() returning id into v_customer_id;
 begin insert into public.bookings(service_id,customer_id,customer_name,customer_phone,booking_date,booking_time,duration_minutes,manage_token_hash) values(v_service_id,v_customer_id,trim(p_customer_name),trim(p_customer_phone),p_booking_date,p_booking_time,v_duration,p_manage_token_hash) returning id into v_booking_id;
 exception when unique_violation or exclusion_violation then raise exception 'slot_unavailable';end;
 return v_booking_id;
end;$function$;
revoke all on function public.create_public_booking(text,date,time without time zone,text,text,text) from public,authenticated;
grant execute on function public.create_public_booking(text,date,time without time zone,text,text,text) to anon;

create or replace function public.create_public_booking(p_service_name text,p_booking_date date,p_booking_time time without time zone,p_customer_name text,p_customer_phone text) returns uuid language sql security definer set search_path='' as $function$
select public.create_public_booking(p_service_name,p_booking_date,p_booking_time,p_customer_name,p_customer_phone,encode(sha256((gen_random_uuid()::text||gen_random_uuid()::text)::bytea),'hex'));
$function$;
revoke all on function public.create_public_booking(text,date,time without time zone,text,text) from public,authenticated;
grant execute on function public.create_public_booking(text,date,time without time zone,text,text) to anon;

drop function if exists public.get_available_booking_times(date);
create function public.get_available_booking_times(p_date date,p_service_name text) returns table(booking_time time without time zone) language sql stable security definer set search_path='' as $function$
with service as(select duration_minutes from public.services where name=p_service_name and active=true),slots(booking_time) as(values('08:00'::time),('09:00'::time),('10:00'::time),('11:00'::time),('12:00'::time),('13:00'::time),('14:00'::time),('15:00'::time),('16:00'::time),('17:00'::time))
select slots.booking_time from slots cross join service s where public.booking_slot_is_valid(p_date,slots.booking_time,s.duration_minutes)
and not exists(select 1 from public.bookings b where b.booking_date=p_date and b.status='confirmed' and int4range(b.booking_start_minutes,b.booking_start_minutes+b.duration_minutes,'[)')&&int4range((extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer,(extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer+s.duration_minutes,'[)'))
and not exists(select 1 from public.availability_blocks ab where ab.block_date=p_date and(ab.block_time is null or int4range((extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer,(extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer+60,'[)')&&int4range((extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer,(extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer+s.duration_minutes,'[)'))) order by slots.booking_time;
$function$;
revoke all on function public.get_available_booking_times(date,text) from public,authenticated;
grant execute on function public.get_available_booking_times(date,text) to anon;
create function public.get_available_booking_times(p_date date) returns table(booking_time time without time zone) language sql stable security definer set search_path='' as $function$
select * from public.get_available_booking_times(p_date,'Corte masculino');
$function$;
revoke all on function public.get_available_booking_times(date) from public,authenticated;
grant execute on function public.get_available_booking_times(date) to anon;

create or replace function public.get_public_booking(p_booking_id uuid,p_manage_token_hash text) returns table(id uuid,customer_name text,service_name text,duration_minutes integer,booking_date date,booking_time time without time zone,status text) language sql stable security definer set search_path='' as $function$
select b.id,b.customer_name,s.name,b.duration_minutes,b.booking_date,b.booking_time,b.status from public.bookings b join public.services s on s.id=b.service_id where b.id=p_booking_id and b.manage_token_hash=p_manage_token_hash;
$function$;
revoke all on function public.get_public_booking(uuid,text) from public,authenticated;
grant execute on function public.get_public_booking(uuid,text) to anon;

create or replace function public.manage_public_booking(p_booking_id uuid,p_manage_token_hash text,p_action text,p_booking_date date,p_booking_time time without time zone) returns uuid language plpgsql security definer set search_path='' as $function$
declare v_booking public.bookings%rowtype;
begin
 select * into v_booking from public.bookings b where b.id=p_booking_id and b.manage_token_hash=p_manage_token_hash for update;
 if v_booking.id is null then raise exception 'unauthorized_booking';end if;
 if v_booking.status not in('confirmed','cancelled') then raise exception 'booking_locked';end if;
 if v_booking.booking_date+v_booking.booking_time<((now() at time zone 'America/Sao_Paulo')+interval '1 hour') then raise exception 'booking_locked';end if;
 if p_action='cancel' then if v_booking.status<>'confirmed' then raise exception 'booking_locked';end if;update public.bookings set status='cancelled' where id=p_booking_id;return p_booking_id;end if;
 if p_action<>'reschedule' then raise exception 'invalid_action';end if;
 perform pg_advisory_xact_lock(hashtext(p_booking_date::text));
 if not public.booking_slot_is_valid(p_booking_date,p_booking_time,v_booking.duration_minutes) then raise exception 'invalid_slot';end if;
 if exists(select 1 from public.availability_blocks ab where ab.block_date=p_booking_date and(ab.block_time is null or int4range((extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer,(extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer+60,'[)')&&int4range((extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer,(extract(hour from p_booking_time)::integer*60)+extract(minute from p_booking_time)::integer+v_booking.duration_minutes,'[)'))) then raise exception 'slot_unavailable';end if;
 begin update public.bookings set booking_date=p_booking_date,booking_time=p_booking_time,status='confirmed' where id=p_booking_id;exception when unique_violation or exclusion_violation then raise exception 'slot_unavailable';end;
 return p_booking_id;
end;$function$;
revoke all on function public.manage_public_booking(uuid,text,text,date,time without time zone) from public,authenticated;
grant execute on function public.manage_public_booking(uuid,text,text,date,time without time zone) to anon;

create or replace function public.reject_conflicting_availability_block() returns trigger language plpgsql set search_path='' as $function$
begin
 perform pg_advisory_xact_lock(hashtext(new.block_date::text));
 if exists(select 1 from public.bookings b where b.booking_date=new.block_date and b.status='confirmed' and(new.block_time is null or int4range(b.booking_start_minutes,b.booking_start_minutes+b.duration_minutes,'[)')&&int4range((extract(hour from new.block_time)::integer*60)+extract(minute from new.block_time)::integer,(extract(hour from new.block_time)::integer*60)+extract(minute from new.block_time)::integer+60,'[)'))) then raise exception 'confirmed_booking_conflict';end if;
 return new;
end;$function$;
drop trigger if exists availability_blocks_prevent_conflict on public.availability_blocks;
create trigger availability_blocks_prevent_conflict before insert or update on public.availability_blocks for each row execute function public.reject_conflicting_availability_block();
