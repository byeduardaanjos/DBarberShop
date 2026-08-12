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
