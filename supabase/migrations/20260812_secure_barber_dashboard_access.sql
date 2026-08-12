grant select, update on table public.bookings to authenticated;
grant select on table public.services to authenticated;

drop policy if exists "barber_can_read_bookings" on public.bookings;
create policy "barber_can_read_bookings"
on public.bookings for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

drop policy if exists "barber_can_update_bookings" on public.bookings;
create policy "barber_can_update_bookings"
on public.bookings for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

drop policy if exists "barber_can_read_services" on public.services;
create policy "barber_can_read_services"
on public.services for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'barber');

create index if not exists bookings_dashboard_idx
on public.bookings (booking_date, booking_time)
where status <> 'cancelled';
