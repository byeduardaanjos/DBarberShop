import { NextRequest, NextResponse } from "next/server";
import { requireBarber } from "@/lib/barber-auth";

const statuses = new Set(["confirmed", "completed", "cancelled"]);

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
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const query = new URLSearchParams({
    select: "id,customer_name,customer_phone,booking_date,booking_time,status,created_at,services(name,duration_minutes)",
    booking_date: `eq.${validDate}`,
    order: "booking_time.asc",
  });
  const response = await fetch(`${config.url}/rest/v1/bookings?${query}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível carregar a agenda." }, { status: 502 });
  return NextResponse.json({ bookings: await response.json(), date: validDate });
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

