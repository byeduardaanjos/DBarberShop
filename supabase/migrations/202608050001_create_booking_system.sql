create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0), active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(), service_id uuid not null references public.services(id),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 10 and 30),
  booking_date date not null, booking_time time not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create unique index if not exists bookings_one_active_slot on public.bookings (booking_date, booking_time) where status = 'confirmed';
alter table public.services enable row level security;
alter table public.bookings enable row level security;

insert into public.services (name, duration_minutes, price_cents) values
  ('Corte masculino', 50, 6500), ('Barba premium', 35, 4500), ('Corte + barba', 80, 10000)
on conflict (name) do update set duration_minutes = excluded.duration_minutes, price_cents = excluded.price_cents, active = true;

create or replace function public.get_available_booking_times(p_date date)
returns table (booking_time time) language sql stable security definer set search_path = '' as $$
  with slots(booking_time) as (values ('09:00'::time), ('10:00'::time), ('11:00'::time), ('12:00'::time), ('13:00'::time), ('14:00'::time), ('15:00'::time), ('16:00'::time), ('17:00'::time), ('18:00'::time), ('19:00'::time))
  select slots.booking_time from slots
  where p_date >= current_date and extract(dow from p_date) <> 0
    and not exists (select 1 from public.bookings b where b.booking_date = p_date and b.booking_time = slots.booking_time and b.status = 'confirmed')
  order by slots.booking_time;
$$;

create or replace function public.create_public_booking(p_service_name text, p_booking_date date, p_booking_time time, p_customer_name text, p_customer_phone text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_service_id uuid; v_booking_id uuid;
begin
  if p_booking_date < current_date or extract(dow from p_booking_date) = 0 then raise exception 'invalid_date'; end if;
  if p_booking_time not in ('09:00'::time, '10:00'::time, '11:00'::time, '12:00'::time, '13:00'::time, '14:00'::time, '15:00'::time, '16:00'::time, '17:00'::time, '18:00'::time, '19:00'::time) then raise exception 'invalid_time'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 100 or char_length(trim(p_customer_phone)) not between 10 and 30 then raise exception 'invalid_customer'; end if;
  select id into v_service_id from public.services where name = p_service_name and active = true;
  if v_service_id is null then raise exception 'invalid_service'; end if;
  begin
    insert into public.bookings (service_id, customer_name, customer_phone, booking_date, booking_time)
    values (v_service_id, trim(p_customer_name), trim(p_customer_phone), p_booking_date, p_booking_time) returning id into v_booking_id;
  exception when unique_violation then raise exception 'slot_unavailable'; end;
  return v_booking_id;
end;
$$;

revoke all on public.services from anon, authenticated;
revoke all on public.bookings from anon, authenticated;
revoke execute on function public.get_available_booking_times(date) from public, authenticated;
revoke execute on function public.create_public_booking(text, date, time, text, text) from public, authenticated;
grant execute on function public.get_available_booking_times(date) to anon;
grant execute on function public.create_public_booking(text, date, time, text, text) to anon;
