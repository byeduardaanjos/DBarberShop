import { NextRequest, NextResponse } from "next/server";
import { requireBarber } from "@/lib/barber-auth";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function GET() {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const query = new URLSearchParams({
    select: "id,name,phone,notes,created_at,updated_at,bookings(id,booking_date,booking_time,status,services(name))",
    order: "updated_at.desc",
  });
  const response = await fetch(`${config.url}/rest/v1/customers?${query}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível carregar os clientes." }, { status: 502 });
  return NextResponse.json({ customers: await response.json() });
}

export async function PATCH(request: NextRequest) {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; notes?: string } | null;
  if (!body?.id || !/^[0-9a-f-]{36}$/i.test(body.id) || typeof body.notes !== "string" || body.notes.length > 1000) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const response = await fetch(`${config.url}/rest/v1/customers?id=eq.${encodeURIComponent(body.id)}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ notes: body.notes.trim(), updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível salvar as observações." }, { status: 502 });
  return NextResponse.json({ customer: (await response.json())[0] });
}
