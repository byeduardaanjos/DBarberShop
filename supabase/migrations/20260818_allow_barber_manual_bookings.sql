alter table public.bookings
add column if not exists booking_source text not null default 'site'
check (booking_source in ('site','barber'));

drop policy if exists barber_can_insert_customers on public.customers;
create policy barber_can_insert_customers
on public.customers for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

drop policy if exists barber_can_insert_bookings on public.bookings;
create policy barber_can_insert_bookings
on public.bookings for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

grant insert on public.customers, public.bookings to authenticated;
