import { NextRequest, NextResponse } from "next/server";

const allowedTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Data inválida." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ available: allowedTimes, demo: true });

  const response = await fetch(`${url}/rest/v1/rpc/get_available_booking_times`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_date: date }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível consultar os horários." }, { status: 502 });

  const rows = (await response.json()) as Array<{ booking_time: string }>;
  return NextResponse.json({ available: rows.map(row => row.booking_time.slice(0, 5)) });
}
