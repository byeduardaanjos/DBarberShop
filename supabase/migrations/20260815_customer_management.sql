create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 10 and 30),
  phone_normalized text not null unique check (char_length(phone_normalized) between 10 and 15),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

create policy barber_can_read_customers on public.customers
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

create policy barber_can_update_customers on public.customers
for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

revoke all on public.customers from anon;
grant select, update on public.customers to authenticated;

alter table public.bookings add column if not exists customer_id uuid references public.customers(id);

insert into public.customers (name, phone, phone_normalized)
select distinct on (regexp_replace(customer_phone, '[^0-9]', '', 'g'))
  customer_name, customer_phone, regexp_replace(customer_phone, '[^0-9]', '', 'g')
from public.bookings
where char_length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) between 10 and 15
order by regexp_replace(customer_phone, '[^0-9]', '', 'g'), created_at desc
on conflict (phone_normalized) do update
set name = excluded.name, phone = excluded.phone, updated_at = now();

update public.bookings b set customer_id = c.id
from public.customers c
where b.customer_id is null
and c.phone_normalized = regexp_replace(b.customer_phone, '[^0-9]', '', 'g');

create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists customers_name_search_idx on public.customers(lower(name));
create index if not exists customers_updated_at_idx on public.customers(updated_at desc);

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
check (status = any(array['confirmed'::text,'cancelled'::text,'completed'::text,'no_show'::text]));

create or replace function public.create_public_booking(
  p_service_name text, p_booking_date date, p_booking_time time without time zone,
  p_customer_name text, p_customer_phone text
) returns uuid language plpgsql security definer set search_path = '' as $function$
declare
  v_service_id uuid; v_booking_id uuid; v_customer_id uuid; v_phone_normalized text;
begin
  if p_booking_date < current_date or extract(dow from p_booking_date) = 0 then raise exception 'invalid_date'; end if;
  if p_booking_time not in ('08:00'::time,'09:00'::time,'10:00'::time,'11:00'::time,'12:00'::time,'13:00'::time,'14:00'::time,'15:00'::time,'16:00'::time,'17:00'::time) then raise exception 'invalid_time'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 100 or char_length(trim(p_customer_phone)) not between 10 and 30 then raise exception 'invalid_customer'; end if;
  v_phone_normalized := regexp_replace(p_customer_phone, '[^0-9]', '', 'g');
  if char_length(v_phone_normalized) not between 10 and 15 then raise exception 'invalid_customer'; end if;
  select id into v_service_id from public.services where name = p_service_name and active = true;
  if v_service_id is null then raise exception 'invalid_service'; end if;
  insert into public.customers (name, phone, phone_normalized)
  values (trim(p_customer_name), trim(p_customer_phone), v_phone_normalized)
  on conflict (phone_normalized) do update set name=excluded.name, phone=excluded.phone, updated_at=now()
  returning id into v_customer_id;
  begin
    insert into public.bookings (service_id,customer_id,customer_name,customer_phone,booking_date,booking_time)
    values (v_service_id,v_customer_id,trim(p_customer_name),trim(p_customer_phone),p_booking_date,p_booking_time)
    returning id into v_booking_id;
  exception when unique_violation then raise exception 'slot_unavailable'; end;
  return v_booking_id;
end;
$function$;

revoke all on function public.create_public_booking(text,date,time without time zone,text,text) from public;
grant execute on function public.create_public_booking(text,date,time without time zone,text,text) to anon;
