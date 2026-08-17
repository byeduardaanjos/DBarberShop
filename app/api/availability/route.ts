import { NextRequest, NextResponse } from "next/server";

const services = new Set(["Corte masculino", "Barba premium", "Corte + barba"]);

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const service = request.nextUrl.searchParams.get("service") ?? "";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  if (!services.has(service)) return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "O banco de dados ainda não está configurado." }, { status: 503 });

  const response = await fetch(`${url}/rest/v1/rpc/get_available_booking_times`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_date: date, p_service_name: service }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível consultar os horários." }, { status: 502 });

  const rows = (await response.json()) as Array<{ booking_time: string }>;
  return NextResponse.json({ available: rows.map(row => row.booking_time.slice(0, 5)) });
}
