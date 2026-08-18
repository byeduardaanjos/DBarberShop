create or replace function public.booking_slot_is_valid(p_date date,p_time time without time zone,p_duration integer) returns boolean language sql stable set search_path='' as $function$
select p_date between (now() at time zone 'America/Sao_Paulo')::date and ((now() at time zone 'America/Sao_Paulo')::date+90)
and extract(dow from p_date)<>0
and p_time in('08:00'::time,'09:00'::time,'10:00'::time,'11:00'::time,'12:00'::time,'13:00'::time,'14:00'::time,'15:00'::time,'16:00'::time,'17:00'::time)
and ((extract(hour from p_time)::integer*60)+extract(minute from p_time)::integer+p_duration)<=1050
and (p_date+p_time)>=((now() at time zone 'America/Sao_Paulo')+interval '1 hour');
$function$;

create or replace function public.get_available_booking_times(p_date date,p_service_name text) returns table(booking_time time without time zone) language sql stable security definer set search_path='' as $function$
with service as(select duration_minutes from public.services where name=p_service_name and active=true),slots(booking_time) as(values('08:00'::time),('09:00'::time),('10:00'::time),('11:00'::time),('12:00'::time),('13:00'::time),('14:00'::time),('15:00'::time),('16:00'::time),('17:00'::time))
select slots.booking_time from slots cross join service s where public.booking_slot_is_valid(p_date,slots.booking_time,s.duration_minutes)
and not exists(select 1 from public.bookings b where b.booking_date=p_date and b.status='confirmed' and int4range(b.booking_start_minutes,b.booking_start_minutes+b.duration_minutes,'[)')&&int4range((extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer,(extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer+s.duration_minutes,'[)'))
and not exists(select 1 from public.availability_blocks ab where ab.block_date=p_date and(ab.block_time is null or int4range((extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer,(extract(hour from ab.block_time)::integer*60)+extract(minute from ab.block_time)::integer+60,'[)')&&int4range((extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer,(extract(hour from slots.booking_time)::integer*60)+extract(minute from slots.booking_time)::integer+s.duration_minutes,'[)'))) order by slots.booking_time;
$function$;

revoke all on function public.get_available_booking_times(date,text) from public,authenticated;
grant execute on function public.get_available_booking_times(date,text) to anon;
