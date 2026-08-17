import { cookies } from "next/headers";

const ACCESS_COOKIE = "dbarber_access";
const REFRESH_COOKIE = "dbarber_refresh";

type SupabaseUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SupabaseUser;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase não configurado.");
  return { url, key };
}

function isBarber(user?: SupabaseUser | null) {
  return user?.app_metadata?.role === "barber";
}

async function fetchUser(accessToken: string) {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as SupabaseUser;
}

async function saveSession(session: TokenResponse) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(session.expires_in - 30, 60),
  });
  store.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function loginBarber(email: string, password: string) {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const session = (await response.json()) as TokenResponse;
  if (!isBarber(session.user)) return null;
  await saveSession(session);
  return session.user;
}

export async function requireBarber() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    const user = await fetchUser(accessToken);
    if (isBarber(user)) return { accessToken, user: user! };
  }

  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    await clearBarberSession();
    return null;
  }
  const session = (await response.json()) as TokenResponse;
  if (!isBarber(session.user)) {
    await clearBarberSession();
    return null;
  }
  await saveSession(session);
  return { accessToken: session.access_token, user: session.user };
}

export async function clearBarberSession() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    const { url, key } = config();
    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => null);
  }
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
