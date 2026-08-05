import { NextRequest, NextResponse } from "next/server";

const services = new Set(["Corte masculino", "Barba premium", "Corte + barba"]);
const times = new Set(["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as null | { service?: string; date?: string; time?: string; name?: string; phone?: string };
  if (!body || !services.has(body.service ?? "") || !times.has(body.time ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || (body.name?.trim().length ?? 0) < 2 || (body.phone?.replace(/\D/g, "").length ?? 0) < 10) {
    return NextResponse.json({ error: "Confira os dados do agendamento." }, { status: 400 });
  }
  const service = body.service!;
  const date = body.date!;
  const time = body.time!;
  const name = body.name!.trim();
  const phone = body.phone!.trim();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "O banco de dados ainda não está configurado." }, { status: 503 });

  const response = await fetch(`${url}/rest/v1/rpc/create_public_booking`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_service_name: service, p_booking_date: date, p_booking_time: time, p_customer_name: name, p_customer_phone: phone }),
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text();
    if (message.includes("slot_unavailable")) return NextResponse.json({ error: "Esse horário acabou de ser reservado. Escolha outro." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível concluir o agendamento." }, { status: 502 });
  }
  return NextResponse.json({ bookingId: await response.json() }, { status: 201 });
}
