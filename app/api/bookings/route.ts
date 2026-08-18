import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";

const services = new Set(["Corte masculino", "Barba premium", "Corte + barba"]);
const times = new Set(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as null | { service?: string; date?: string; time?: string; name?: string; phone?: string; privacyAccepted?: boolean };
  if (!body || body.privacyAccepted !== true || !services.has(body.service ?? "") || !times.has(body.time ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || (body.name?.trim().length ?? 0) < 2 || (body.name?.trim().length ?? 0) > 100 || (body.phone?.trim().length ?? 0) > 30 || (body.phone?.replace(/\D/g, "").length ?? 0) < 10 || !/^[\d\s()+-]+$/.test(body.phone ?? "")) {
    return NextResponse.json({ error: "Confira os dados do agendamento." }, { status: 400 });
  }
  const service = body.service!;
  const date = body.date!;
  const time = body.time!;
  const name = body.name!.trim();
  const phone = body.phone!.trim();
  const manageToken = `${randomUUID()}${randomUUID()}`;
  const manageTokenHash = createHash("sha256").update(manageToken).digest("hex");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "O banco de dados ainda não está configurado." }, { status: 503 });

  const response = await fetch(`${url}/rest/v1/rpc/create_public_booking`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_service_name: service, p_booking_date: date, p_booking_time: time, p_customer_name: name, p_customer_phone: phone, p_manage_token_hash: manageTokenHash }),
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text();
    if (message.includes("slot_unavailable")) return NextResponse.json({ error: "Esse horário acabou de ser reservado. Escolha outro." }, { status: 409 });
    if (message.includes("too_many_active_bookings")) return NextResponse.json({ error: "Este WhatsApp já possui três horários futuros. Fale com a barbearia para continuar." }, { status: 429 });
    if (message.includes("too_many_requests")) return NextResponse.json({ error: "Aguarde dois minutos antes de realizar outro agendamento." }, { status: 429 });
    if (message.includes("invalid_slot")) return NextResponse.json({ error: "Este horário não está disponível para o serviço escolhido." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível concluir o agendamento." }, { status: 502 });
  }
  const bookingId = (await response.json()) as string;
  return NextResponse.json({ bookingId, manageToken }, { status: 201 });
}
