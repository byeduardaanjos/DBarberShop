"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Phone,
  RefreshCw,
  Scissors,
  UserRound,
  XCircle,
} from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: "confirmed" | "completed" | "cancelled";
  services: { name: string; duration_minutes: number } | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const statusLabel = { confirmed: "Confirmado", completed: "Concluído", cancelled: "Cancelado" };

export default function BarberDashboard() {
  const [auth, setAuth] = useState<"loading" | "guest" | "barber">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(today);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadBookings = useCallback(async (selectedDate: string, quiet = false) => {
    if (!quiet) setLoading(true);
    const response = await fetch(`/api/barbeiro/agendamentos?date=${selectedDate}`, { cache: "no-store" });
    if (response.status === 401) {
      setAuth("guest");
      setBookings([]);
      setLoading(false);
      return;
    }
    const data = await response.json();
    if (response.ok) setBookings(data.bookings);
    else setMessage(data.error ?? "Não foi possível carregar a agenda.");
    if (!quiet) setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/barbeiro/session", { cache: "no-store" }).then(async response => {
      if (response.ok) {
        setAuth("barber");
        await loadBookings(date);
      } else setAuth("guest");
    });
  }, [date, loadBookings]);

  useEffect(() => {
    if (auth !== "barber") return;
    const timer = window.setInterval(() => loadBookings(date, true), 30000);
    return () => window.clearInterval(timer);
  }, [auth, date, loadBookings]);

  const summary = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(item => item.status === "confirmed").length,
    completed: bookings.filter(item => item.status === "completed").length,
  }), [bookings]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/barbeiro/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Acesso não autorizado.");
      setLoading(false);
      return;
    }
    setPassword("");
    setAuth("barber");
    await loadBookings(date);
  }

  async function logout() {
    await fetch("/api/barbeiro/session", { method: "DELETE" });
    setAuth("guest");
    setBookings([]);
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    setMessage("");
    const response = await fetch("/api/barbeiro/agendamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "Não foi possível atualizar.");
    else await loadBookings(date, true);
  }

  if (auth === "loading") {
    return <main className="barber-loading"><LoaderCircle className="spin" /><span>Preparando área segura</span></main>;
  }

  if (auth === "guest") {
    return (
      <main className="barber-login-page">
        <a className="barber-back" href="/"><ArrowLeft size={17} /> Voltar ao site</a>
        <section className="barber-login-card">
          <div className="barber-monogram">D</div>
          <p className="barber-kicker">D.BARBERSHOP · ÁREA RESTRITA</p>
          <h1>Agenda do barbeiro.</h1>
          <p className="barber-subtitle">Acesso exclusivo para acompanhar e organizar os atendimentos.</p>
          <form onSubmit={login}>
            <label>E-mail<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
            <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required /></label>
            {message && <p className="barber-error" role="alert">{message}</p>}
            <button className="barber-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={19} /> : <LockKeyhole size={19} />} Entrar com segurança</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="barber-dashboard">
      <header className="barber-header">
        <a href="/" className="barber-wordmark">D.BARBERSHOP</a>
        <div><span>Área do barbeiro</span><button onClick={logout} aria-label="Sair"><LogOut size={18} /> Sair</button></div>
      </header>
      <div className="barber-content">
        <section className="barber-heading">
          <div><p className="barber-kicker">CONTROLE DE ATENDIMENTOS</p><h1>Sua agenda.</h1><p>Os novos agendamentos feitos no site aparecem aqui automaticamente.</p></div>
          <label className="barber-date"><CalendarDays size={18} /><span>Data</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
        </section>
        <section className="barber-stats">
          <article><span>Horários</span><strong>{summary.total}</strong></article>
          <article><span>Confirmados</span><strong>{summary.confirmed}</strong></article>
          <article><span>Concluídos</span><strong>{summary.completed}</strong></article>
        </section>
        <section className="barber-agenda">
          <div className="barber-agenda-title"><div><p className="barber-kicker">AGENDA DO DIA</p><h2>{new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</h2></div><button onClick={() => loadBookings(date)} aria-label="Atualizar agenda"><RefreshCw className={loading ? "spin" : ""} size={18} /> Atualizar</button></div>
          {message && <p className="barber-error" role="alert">{message}</p>}
          {loading ? <div className="barber-empty"><LoaderCircle className="spin" /><p>Carregando horários...</p></div> :
          bookings.length === 0 ? <div className="barber-empty"><CalendarDays /><h3>Nenhum horário nesta data.</h3><p>Quando um cliente agendar pelo site, o atendimento aparecerá aqui.</p></div> :
          <div className="barber-booking-list">{bookings.map(booking => (
            <article className={`barber-booking ${booking.status}`} key={booking.id}>
              <div className="barber-time"><Clock3 size={18} /><strong>{booking.booking_time.slice(0, 5)}</strong></div>
              <div className="barber-booking-info">
                <div><span className={`barber-status ${booking.status}`}>{statusLabel[booking.status]}</span><h3>{booking.customer_name}</h3></div>
                <ul>
                  <li><Scissors size={16} />{booking.services?.name ?? "Serviço"}</li>
                  <li><Clock3 size={16} />{booking.services?.duration_minutes ?? 0} minutos</li>
                  <li><Phone size={16} /><a href={`tel:${booking.customer_phone.replace(/\D/g, "")}`}>{booking.customer_phone}</a></li>
                </ul>
              </div>
              <div className="barber-actions">
                {booking.status !== "completed" && <button className="complete" onClick={() => updateStatus(booking.id, "completed")}><CheckCircle2 size={17} /> Concluir</button>}
                {booking.status !== "cancelled" && <button onClick={() => updateStatus(booking.id, "cancelled")}><XCircle size={17} /> Cancelar</button>}
                {booking.status !== "confirmed" && <button onClick={() => updateStatus(booking.id, "confirmed")}><UserRound size={17} /> Reabrir</button>}
              </div>
            </article>
          ))}</div>}
        </section>
      </div>
    </main>
  );
}

