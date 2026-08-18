"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Download, Hash, Instagram, MapPin, Menu, MessageCircle, Settings2, Scissors, ShieldCheck, X } from "lucide-react";
import PremiumCalendar from "./components/PremiumCalendar";

const services = [
  { name: "Corte masculino", detail: "Corte personalizado com acabamento preciso.", time: "50 min", price: "R$ 65", image: "/images/imperium-hero-v3.webp" },
  { name: "Barba premium", detail: "Modelagem, toalha quente e finalização.", time: "35 min", price: "R$ 45", image: "/images/imperium-barba-v3.webp" },
  { name: "Corte + barba", detail: "A experiência completa para renovar o visual.", time: "80 min", price: "R$ 100", image: "/images/imperium-ambiente-v3.webp" },
];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type ConfirmedBooking = { id: string; manageToken: string; service: string; date: string; time: string; name: string };

function formatBookingDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function bookingCode(id: string) {
  return `DB-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [availableTimes, setAvailableTimes] = useState(times);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  function openBooking(selected?: string) { if (selected) setService(selected); setBookingOpen(true); setMenuOpen(false); setConfirmedBooking(null); setPrivacyAccepted(false); setBookingError(""); setStep(1); }
  async function loadAvailability(selectedDate: string, selectedService = service) {
    setDate(selectedDate); setTime(""); setBookingError(""); setLoadingTimes(true);
    try {
      const response = await fetch(`/api/availability?date=${selectedDate}&service=${encodeURIComponent(selectedService)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAvailableTimes(result.available);
    } catch { setAvailableTimes([]); setBookingError("Não foi possível consultar os horários. Tente novamente."); }
    finally { setLoadingTimes(false); }
  }
  async function submitBooking(e: React.FormEvent) {
    e.preventDefault(); setBookingError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service, date, time, name, phone, privacyAccepted }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setConfirmedBooking({ id: result.bookingId, manageToken: result.manageToken, service, date, time, name: name.trim() });
      setStep(3);
    } catch (error) { setBookingError(error instanceof Error ? error.message : "Não foi possível concluir o agendamento."); }
    finally { setSubmitting(false); }
  }
  function saveToCalendar() {
    if (!confirmedBooking) return;
    const start = new Date(`${confirmedBooking.date}T${confirmedBooking.time}:00`);
    const duration = Number.parseInt(services.find(item => item.name === confirmedBooking.service)?.time ?? "60", 10);
    const end = new Date(start.getTime() + duration * 60_000);
    const calendar = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//D.BarberShop//Agendamento//PT-BR",
      "BEGIN:VEVENT", `UID:${confirmedBooking.id}@dbarbershop`, `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`, `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${confirmedBooking.service} - D.BarberShop`,
      `DESCRIPTION:Agendamento confirmado. Código ${bookingCode(confirmedBooking.id)}.`,
      "LOCATION:Rua Francisco Roberto da Silva, 676 - Centro, Biguaçu - SC",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `agendamento-${bookingCode(confirmedBooking.id).toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }
  const manageUrl = confirmedBooking && typeof window !== "undefined" ? `${window.location.origin}/agendamento/${confirmedBooking.id}#token=${encodeURIComponent(confirmedBooking.manageToken)}` : "";
  const whatsappConfirmation = confirmedBooking
    ? `https://wa.me/?text=${encodeURIComponent(`Agendamento confirmado na D.BarberShop\n\n${confirmedBooking.service}\n${formatBookingDate(confirmedBooking.date)} às ${confirmedBooking.time}\nCódigo: ${bookingCode(confirmedBooking.id)}\nCliente: ${confirmedBooking.name}\n\nGerenciar: ${manageUrl}`)}`
    : "#";
  useEffect(() => { const params = new URLSearchParams(window.location.search); const selected = params.get("servico"); if (selected && services.some(item => item.name === selected)) openBooking(selected); else if (params.get("agendar") === "1") openBooking(); }, []);

  return <main>
    <header className="site-header">
      <a href="/" className="brand brand-logo" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a>
      <button className={menuOpen ? "menu-toggle open" : "menu-toggle"} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? "nav open" : "nav"}><a href="/servicos">Serviços</a><a href="/trabalhos">Trabalhos</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a><a className="nav-book" href="/?agendar=1">Agendar horário</a></nav>
      <button className="header-cta" onClick={() => openBooking()}>Agendar horário</button>
    </header>

    <section className="hero" id="inicio">
      <div className="hero-overlay"/>
      <div className="hero-content"><p className="eyebrow">BARBEARIA PREMIUM · BIGUAÇU — SC</p><h1>Precisão em cada detalhe.<br/><span>Presença em cada corte.</span></h1><p>Atendimento individual, técnica e acabamento impecável para quem valoriza a própria imagem.</p><button className="primary-cta" onClick={() => openBooking()}><span>Agendar horário</span><CalendarDays/></button></div>
      <a href="#servicos" className="scroll-link">CONHEÇA A D.BARBERSHOP <ArrowDown/></a>
    </section>

    <section className="pillars"><article><b>01</b><h3>Atendimento individual</h3><p>Uma experiência pensada no seu estilo e no seu tempo.</p></article><article><b>02</b><h3>Técnica e precisão</h3><p>Acabamento cuidadoso, do primeiro ao último detalhe.</p></article><article><b>03</b><h3>Ambiente premium</h3><p>Conforto, discrição e uma atmosfera feita para você.</p></article></section>

    <section className="services" id="servicos"><div className="section-title"><p className="eyebrow">SERVIÇOS EM DESTAQUE</p><h2>Escolha sua experiência.</h2><p>Uma seleção dos atendimentos mais procurados da D.BarberShop.</p></div><div className="service-grid featured-services">{services.slice(0,2).map(item=><article className="service-card" key={item.name}><div className="service-image" style={{backgroundImage:`url(${item.image})`}}/><div className="service-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><div className="service-meta"><span><Clock3/>{item.time}</span><strong>{item.price}</strong></div><button onClick={() => openBooking(item.name)}><span>Selecionar serviço</span><ArrowRight/></button></div></article>)}</div><div className="all-services-link"><a className="outline-cta icon-link" href="/servicos"><span>Ver todos os serviços</span><ArrowRight/></a></div></section>

    <section className="work" id="trabalhos"><div className="section-title"><p className="eyebrow">TRABALHOS EM DESTAQUE</p><h2>Precisão que se vê.</h2><p>Uma amostra da experiência e do acabamento D.BarberShop.</p></div><div className="work-preview-grid"><article className="work-card"><img src="/images/imperium-hero-v3.webp" alt="Acabamento de corte masculino"/><div><h3>Corte e acabamento</h3><p>Precisão construída em cada detalhe.</p></div></article><article className="work-card"><img src="/images/imperium-barba-v3.webp" alt="Acabamento de barba com navalha"/><div><h3>Barba e contorno</h3><p>Linhas definidas e finalização cuidadosa.</p></div></article></div><div className="all-services-link"><a className="outline-cta icon-link" href="/trabalhos"><span>Ver todos os trabalhos</span><ArrowRight/></a></div></section>

    <section className="about about-editorial" id="sobre"><div className="about-copy"><p className="eyebrow">SOBRE A D.BARBERSHOP</p><h2>Atendimento individual.<br/>Resultado com identidade.</h2><p>A D.BarberShop é uma barbearia de atendimento individual em Biguaçu. Cada serviço começa com uma conversa sobre estilo, rotina e preferência para que o resultado tenha precisão e combine com cada cliente.</p><ul><li>Atendimento com hora marcada</li><li>Consultoria antes do corte</li><li>Finalização e orientação de cuidados</li></ul><button className="outline-cta" onClick={() => openBooking()}>Agendar atendimento</button></div></section>

    <section className="contact" id="contato"><div className="contact-heading"><p className="eyebrow">CONTATO</p><h2>Fale com a D.BarberShop.</h2></div><div className="contact-actions"><a className="contact-action" href="https://wa.me/?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%20D.BarberShop%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." target="_blank" rel="noopener noreferrer"><MessageCircle className="contact-action-icon"/><span><small>ATENDIMENTO</small><strong>WhatsApp</strong><em>Dúvidas e informações</em></span><ArrowRight className="contact-action-arrow"/></a><a className="contact-action" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Abrir o Instagram da D.BarberShop"><Instagram className="contact-action-icon"/><span><small>NOVIDADES</small><strong>Instagram</strong><em>Cortes e trabalhos</em></span><ArrowRight className="contact-action-arrow"/></a></div><div className="contact-details"><a className="contact-action contact-detail" href="https://maps.app.goo.gl/md8iSMqjxu3RRUD27?g_st=ic" target="_blank" rel="noopener noreferrer"><MapPin className="contact-action-icon"/><span><small>VISITE-NOS</small><strong>Localização</strong><em>Rua Francisco Roberto da Silva, 676<br/>Centro, Biguaçu — SC</em></span><ArrowRight className="contact-action-arrow"/></a><button className="contact-action contact-detail" onClick={() => openBooking()}><Clock3 className="contact-action-icon"/><span><small>ATENDIMENTO</small><strong>Horários</strong><em>Seg–sáb 08h–17h30<br/>Domingo fechado</em></span><CalendarDays className="contact-action-arrow"/></button></div></section>
    <footer><span className="brand brand-logo footer-brand"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></span><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>

    {bookingOpen && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setBookingOpen(false)}><section className="booking-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label="Fechar agendamento" onClick={()=>setBookingOpen(false)}><X/></button>{step<3&&<p className="modal-kicker">AGENDAMENTO · ETAPA {step} DE 2</p>}{step===1&&<><h2>Escolha seu horário.</h2><label>Serviço<select value={service} onChange={e=>{setService(e.target.value);if(date)loadAvailability(date,e.target.value);}}>{services.map(s=><option key={s.name}>{s.name}</option>)}</select></label><fieldset className="calendar-fieldset"><legend>Data</legend><PremiumCalendar value={date} onChange={loadAvailability}/></fieldset><fieldset><legend>Horários disponíveis</legend>{loadingTimes&&<p className="booking-feedback">Consultando horários…</p>}<div className="time-grid">{times.map(t=><button key={t} type="button" disabled={!date||loadingTimes||!availableTimes.includes(t)} className={time===t?"selected":""} onClick={()=>setTime(t)}>{t}</button>)}</div></fieldset>{bookingError&&<p className="booking-error" role="alert">{bookingError}</p>}<button className="primary-cta modal-next" disabled={!date||!time||loadingTimes} onClick={()=>setStep(2)}><span>Continuar</span><ArrowRight/></button></>}{step===2&&<form onSubmit={submitBooking}><h2>Quase tudo pronto.</h2><p className="booking-summary">{service}<br/>{date.split("-").reverse().join("/")} às {time}</p><label>Seu nome<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" required/></label><label>WhatsApp<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(48) 99999-9999" inputMode="tel" required/></label><label className="privacy-consent"><input type="checkbox" checked={privacyAccepted} onChange={e=>setPrivacyAccepted(e.target.checked)} required/><ShieldCheck/><span>Autorizo o uso destes dados apenas para realizar e administrar meu agendamento.</span></label>{bookingError&&<p className="booking-error" role="alert">{bookingError}</p>}<button className="primary-cta modal-next" disabled={submitting||!privacyAccepted}><span>{submitting?"Confirmando…":"Confirmar agendamento"}</span><Check/></button><button className="back-button icon-link" type="button" onClick={()=>setStep(1)}><ArrowLeft/><span>Voltar</span></button></form>}{step===3&&confirmedBooking&&<div className="success receipt-success"><span className="success-mark"><Check/></span><p className="modal-kicker">AGENDAMENTO CONFIRMADO</p><h2>Horário reservado.</h2><p className="receipt-intro">Pronto, {confirmedBooking.name.split(" ")[0]}. Seu atendimento já está na agenda da D.BarberShop.</p><div className="booking-receipt"><div><span><Scissors/>Serviço</span><strong>{confirmedBooking.service}</strong></div><div><span><CalendarDays/>Data</span><strong>{formatBookingDate(confirmedBooking.date)}</strong></div><div><span><Clock3/>Horário</span><strong>{confirmedBooking.time}</strong></div><div><span><Hash/>Código</span><strong>{bookingCode(confirmedBooking.id)}</strong></div></div><div className="receipt-actions"><button type="button" className="primary-cta" onClick={saveToCalendar}><span>Salvar no calendário</span><Download/></button><a className="receipt-whatsapp" href={whatsappConfirmation} target="_blank" rel="noopener noreferrer"><MessageCircle/><span>Compartilhar no WhatsApp</span></a><a className="receipt-manage" href={`/agendamento/${confirmedBooking.id}#token=${encodeURIComponent(confirmedBooking.manageToken)}`}><Settings2/><span>Cancelar ou reagendar</span></a></div><button className="back-button receipt-close" onClick={()=>setBookingOpen(false)}>Voltar ao site</button></div>}</section></div>}
  </main>;
}
