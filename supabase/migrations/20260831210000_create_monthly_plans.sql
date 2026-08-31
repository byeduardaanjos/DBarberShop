create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_cents integer not null check (price_cents >= 0),
  validity_days integer not null check (validity_days > 0),
  cuts_included integer not null check (cuts_included > 0),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

insert into public.plans (
  name,
  price_cents,
  validity_days,
  cuts_included,
  description,
  active
)
values (
  'Plano mensal',
  14000,
  30,
  4,
  '4 cortes para usar durante 30 dias, com atendimento individual e horário marcado.',
  true
)
on conflict (name) do update set
  price_cents = excluded.price_cents,
  validity_days = excluded.validity_days,
  cuts_included = excluded.cuts_included,
  description = excluded.description,
  active = excluded.active;
