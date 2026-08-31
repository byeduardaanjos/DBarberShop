import { NextRequest, NextResponse } from "next/server";
import { requireBarber } from "@/lib/barber-auth";

const statuses = new Set(["confirmed", "completed", "cancelled", "no_show"]);
const services = new Set(["Barba", "Corte", "Corte de Tesoura", "Sobrancelha", "Corte + Sobrancelha", "Corte + Sobrancelha + Barba"]);
const times = new Set(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]);

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function GET(request: NextRequest) {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const date = request.nextUrl.searchParams.get("date");
  const from = request.nextUrl.searchParams.get("from");
  const upcoming = request.nextUrl.searchParams.get("scope") === "upcoming";
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallbackDate;
  const validFrom = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : fallbackDate;
  const query = new URLSearchParams({
    select: "id,customer_name,customer_phone,booking_date,booking_time,status,created_at,booking_source,selected_services,total_price_cents,services(name,duration_minutes)",
    booking_date: upcoming ? `gte.${validFrom}` : `eq.${validDate}`,
    order: upcoming ? "booking_date.asc,booking_time.asc" : "booking_time.asc",
  });
  if (upcoming) {
    query.set("status", "eq.confirmed");
    query.set("limit", "6");
  }
  const response = await fetch(`${config.url}/rest/v1/bookings?${query}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível carregar a agenda." }, { status: 502 });
  return NextResponse.json({ bookings: await response.json(), date: upcoming ? validFrom : validDate });
}

export async function POST(request: NextRequest) {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as null | { service?:string; date?:string; time?:string; name?:string; phone?:string };
  const phoneNormalized = body?.phone?.replace(/\D/g, "") ?? "";
  if (!body || !services.has(body.service ?? "") || !times.has(body.time ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || (body.name?.trim().length ?? 0)<2 || (body.name?.trim().length ?? 0)>100 || (body.phone?.trim().length ?? 0)>30 || phoneNormalized.length<10 || phoneNormalized.length>15 || !/^[\d\s()+-]+$/.test(body.phone ?? "")) {
    return NextResponse.json({ error: "Confira os dados do agendamento." }, { status: 400 });
  }
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  const headers = { apikey:config.key, Authorization:`Bearer ${session.accessToken}`, "Content-Type":"application/json" };
  const serviceQuery = new URLSearchParams({select:"id,name,duration_minutes,price_cents",name:`eq.${body.service}`,active:"eq.true",limit:"1"});
  const serviceResponse = await fetch(`${config.url}/rest/v1/services?${serviceQuery}`,{headers,cache:"no-store"});
  if (!serviceResponse.ok) return NextResponse.json({ error: "Não foi possível consultar o serviço." }, { status: 502 });
  const service = (await serviceResponse.json())[0] as {id:string;name:string;duration_minutes:number;price_cents:number}|undefined;
  if (!service) return NextResponse.json({ error: "Serviço indisponível." }, { status: 400 });

  const customerResponse = await fetch(`${config.url}/rest/v1/customers?on_conflict=phone_normalized`,{
    method:"POST",
    headers:{...headers,Prefer:"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify({name:body.name!.trim(),phone:body.phone!.trim(),phone_normalized:phoneNormalized,updated_at:new Date().toISOString()}),
    cache:"no-store",
  });
  if (!customerResponse.ok) return NextResponse.json({ error: "Não foi possível salvar o cliente." }, { status: 502 });
  const customer = (await customerResponse.json())[0] as {id:string}|undefined;
  if (!customer) return NextResponse.json({ error: "Não foi possível identificar o cliente." }, { status: 502 });

  const bookingResponse = await fetch(`${config.url}/rest/v1/bookings`,{
    method:"POST",
    headers:{...headers,Prefer:"return=representation"},
    body:JSON.stringify({service_id:service.id,customer_id:customer.id,customer_name:body.name!.trim(),customer_phone:body.phone!.trim(),booking_date:body.date,booking_time:body.time,duration_minutes:service.duration_minutes,selected_services:[service.name],total_price_cents:service.price_cents,booking_source:"barber"}),
    cache:"no-store",
  });
  if (!bookingResponse.ok) {
    const error = await bookingResponse.text();
    if (error.includes("bookings_no_confirmed_overlap") || error.includes("23P01") || error.includes("confirmed_booking_conflict")) return NextResponse.json({ error: "Esse horário já está ocupado." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível criar o agendamento." }, { status: 502 });
  }
  return NextResponse.json({ booking:(await bookingResponse.json())[0] }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; status?: string } | null;
  if (!body?.id || !/^[0-9a-f-]{36}$/i.test(body.id) || !statuses.has(body.status ?? "")) {
    return NextResponse.json({ error: "Alteração inválida." }, { status: 400 });
  }
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/bookings?id=eq.${encodeURIComponent(body.id)}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status: body.status }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível atualizar o horário." }, { status: 502 });
  return NextResponse.json({ booking: (await response.json())[0] });
}
