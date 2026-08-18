create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  duration_minutes integer not null check(duration_minutes>0),
  price_cents integer not null check(price_cents>=0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  customer_name text not null check(char_length(customer_name) between 2 and 100),
  customer_phone text not null check(char_length(customer_phone) between 10 and 30),
  booking_date date not null,
  booking_time time without time zone not null,
  status text not null default 'confirmed' check(status in('confirmed','cancelled','completed','no_show')),
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.bookings enable row level security;
revoke all on public.services,public.bookings from anon;
insert into public.services(name,duration_minutes,price_cents) values
  ('Corte Tesoura',60,3500),
  ('Degradê',60,4000),
  ('Degradê Navalhado',60,4500),
  ('Barba',60,1500),
  ('Sobrancelha',60,1000),
  ('Tesoura + Barba',60,5000),
  ('Degradê + Barba',60,5500),
  ('Navalhado + Barba',60,6000),
  ('Completo Tesoura',60,6000),
  ('VIP',60,6500),
  ('Supremo',60,7000)
on conflict(name) do update set duration_minutes=excluded.duration_minutes,price_cents=excluded.price_cents;
create index if not exists bookings_service_id_idx on public.bookings(service_id);
