create or replace function public.booking_slot_is_valid(p_date date,p_time time without time zone,p_duration integer) returns boolean language sql stable set search_path='' as $function$
select p_date between (now() at time zone 'America/Sao_Paulo')::date and ((now() at time zone 'America/Sao_Paulo')::date+90)
and extract(dow from p_date)<>0
and p_time in('08:00'::time,'09:00'::time,'10:00'::time,'11:00'::time,'12:00'::time,'13:00'::time,'14:00'::time,'15:00'::time,'16:00'::time,'17:00'::time)
and (p_date+p_time)>=((now() at time zone 'America/Sao_Paulo')+interval '1 hour');
$function$;
