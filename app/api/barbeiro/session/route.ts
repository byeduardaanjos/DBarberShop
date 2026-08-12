import { NextRequest, NextResponse } from "next/server";
import { clearBarberSession, loginBarber, requireBarber } from "@/lib/barber-auth";

export async function GET() {
  const session = await requireBarber().catch(() => null);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, email: session.user.email });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";
  if (!email || password.length < 8) {
    return NextResponse.json({ error: "Informe o e-mail e a senha." }, { status: 400 });
  }
  const user = await loginBarber(email, password).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: user.email });
}

export async function DELETE() {
  await clearBarberSession();
  return NextResponse.json({ authenticated: false });
}

