"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Hash, Instagram, MapPin, Menu, MessageCircle, Settings2, Scissors, ShieldCheck, X } from "lucide-react";
import PremiumCalendar from "./components/PremiumCalendar";

const services = [
  { name: "Corte Tesoura", detail: "Corte clássico feito inteiramente na tesoura.", time: "60 min", price: "R$ 35", priceCents: 3500, image: "/images/imperium-hero-v3.webp" },
  { name: "Degradê", detail: "Transição precisa e acabamento alinhado.", time: "60 min", price: "R$ 40", priceCents: 4000, image: "/images/imperium-barba-v3.webp" },
  { name: "Degradê Navalhado", detail: "Degradê rente com acabamento navalhado.", time: "60 min", price: "R$ 45", priceCents: 4500, image: "/images/imperium-ambiente-v3.webp" },
  { name: "Barba", detail: "Desenho, alinhamento e acabamento da barba.", time: "60 min", price: "R$ 15", priceCents: 1500, image: "/images/imperium-barba-v3.webp" },
  { name: "Sobrancelha", detail: "Limpeza e alinhamento para um visual cuidado.", time: "60 min", price: "R$ 10", priceCents: 1000, image: "/images/imperium-hero-v3.webp" },
  { name: "Tesoura + Barba", detail: "Corte na tesoura combinado ao cuidado da barba.", time: "60 min", price: "R$ 50", priceCents: 5000, image: "/images/imperium-ambiente-v3.webp" },
  { name: "Degradê + Barba", detail: "Degradê preciso com barba alinhada.", time: "60 min", price: "R$ 55", priceCents: 5500, image: "/images/imperium-hero-v3.webp" },
  { name: "Navalhado + Barba", detail: "Degradê navalhado e acabamento completo da barba.", time: "60 min", price: "R$ 60", priceCents: 6000, image: "/images/imperium-barba-v3.webp" },
  { name: "Completo Tesoura", detail: "Tesoura, barba e sobrancelha em um atendimento completo.", time: "60 min", price: "R$ 60", priceCents: 6000, image: "/images/imperium-ambiente-v3.webp" },
  { name: "Degradê + Barba + Sobrancelha", detail: "Atendimento completo com acabamento premium.", time: "60 min", price: "R$ 65", priceCents: 6500, image: "/images/imperium-hero-v3.webp" },
  { name: "Degradê Navalhado + Barba + Sobrancelha", detail: "Atendimento completo com acabamento navalhado.", time: "60 min", price: "R$ 70", priceCents: 7000, image: "/images/imperium-barba-v3.webp" },
];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type ConfirmedBooking = { id: string; manageToken: string; services: string[]; totalPriceCents: number; date: string; time: string; name: string };

function formatBookingDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function bookingCode(id: string) {
  return `DB-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([services[0].name]);
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
  const totalPriceCents = selectedServices.reduce((total, name) => total + (services.find(item => item.name === name)?.priceCents ?? 0), 0);
  function openBooking(selected?: string) { if (selected) setSelectedServices([selected]); setBookingOpen(true); setMenuOpen(false); setConfirmedBooking(null); setPrivacyAccepted(false); setBookingError(""); setStep(1); }
  async function loadAvailability(selectedDate: string, selectedService = selectedServices[0]) {
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
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ services: selectedServices, date, time, name, phone, privacyAccepted }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setConfirmedBooking({ id: result.bookingId, manageToken: result.manageToken, services: selectedServices, totalPriceCents, date, time, name: name.trim() });
      setStep(3);
    } catch (error) { setBookingError(error instanceof Error ? error.message : "Não foi possível concluir o agendamento."); }
    finally { setSubmitting(false); }
  }
  const manageUrl = confirmedBooking && typeof window !== "undefined" ? `${window.location.origin}/agendamento/${confirmedBooking.id}#token=${encodeURIComponent(confirmedBooking.manageToken)}` : "";
  const whatsappConfirmation = confirmedBooking
    ? `https://wa.me/5548991659709?text=${encodeURIComponent(`Agendamento confirmado na D.BarberShop\n\n${confirmedBooking.services.join(" + ")}\nTotal: ${(confirmedBooking.totalPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n${formatBookingDate(confirmedBooking.date)} às ${confirmedBooking.time}\nCódigo: ${bookingCode(confirmedBooking.id)}\nCliente: ${confirmedBooking.name}\n\nGerenciar: ${manageUrl}`)}`
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

    <section className="services" id="servicos"><div className="section-title"><p className="eyebrow">SERVIÇOS EM DESTAQUE</p><h2>Escolha sua experiência.</h2><p>Uma seleção dos atendimentos mais procurados da D.BarberShop.</p></div><div className="service-grid featured-services">{services.slice(0,2).map((item,index)=><article className="service-card service-card-no-image" key={item.name}><span className="service-index">0{index+1}</span><div className="service-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><div className="service-meta"><span><Clock3/>{item.time}</span><strong>{item.price}</strong></div><button onClick={() => openBooking(item.name)}><span>Selecionar serviço</span><ArrowRight/></button></div></article>)}</div><div className="all-services-link"><a className="outline-cta icon-link" href="/servicos"><span>Ver todos os serviços</span><ArrowRight/></a></div></section>

    <section className="work" id="trabalhos"><div className="gallery-coming-soon"><p className="eyebrow">TRABALHOS D.BARBERSHOP</p><h2>Novos trabalhos<br/>em breve.</h2><p>A galeria receberá os primeiros cortes, barbas e acabamentos realizados na D.BarberShop.</p><a className="outline-cta icon-link" href="/trabalhos"><span>Conhecer a galeria</span><ArrowRight/></a></div></section>

    <section className="about about-editorial" id="sobre"><div className="about-copy"><p className="eyebrow">SOBRE A D.BARBERSHOP</p><h2>Atendimento individual.<br/>Resultado com identidade.</h2><p>A D.BarberShop é uma barbearia de atendimento individual em Biguaçu. Cada serviço começa com uma conversa sobre estilo, rotina e preferência para que o resultado tenha precisão e combine com cada cliente.</p><ul><li>Atendimento com hora marcada</li><li>Consultoria antes do corte</li><li>Finalização e orientação de cuidados</li></ul><button className="outline-cta" onClick={() => openBooking()}>Agendar atendimento</button></div></section>

    <section className="contact" id="contato"><div className="contact-heading"><p className="eyebrow">CONTATO</p><h2>Fale com a D.BarberShop.</h2></div><div className="contact-actions"><a className="contact-action" href="https://wa.me/qr/MR5FUVF24SOGK1" target="_blank" rel="noopener noreferrer"><MessageCircle className="contact-action-icon"/><span><small>ATENDIMENTO</small><strong>WhatsApp</strong><em>Dúvidas e informações</em></span><ArrowRight className="contact-action-arrow"/></a><a className="contact-action" href="https://www.instagram.com/d.barbershop00/" target="_blank" rel="noopener noreferrer" aria-label="Abrir o Instagram da D.BarberShop"><Instagram className="contact-action-icon"/><span><small>NOVIDADES</small><strong>Instagram</strong><em>Cortes e trabalhos</em></span><ArrowRight className="contact-action-arrow"/></a></div><div className="contact-details"><a className="contact-action contact-detail" href="https://maps.app.goo.gl/md8iSMqjxu3RRUD27?g_st=ic" target="_blank" rel="noopener noreferrer"><MapPin className="contact-action-icon"/><span><small>VISITE-NOS</small><strong>Localização</strong><em>Rua Francisco Roberto da Silva, 676<br/>Centro, Biguaçu — SC</em></span><ArrowRight className="contact-action-arrow"/></a><button className="contact-action contact-detail" onClick={() => openBooking()}><Clock3 className="contact-action-icon"/><span><small>ATENDIMENTO</small><strong>Horários</strong><em>Seg–sáb 08h–17h30<br/>Domingo fechado</em></span><CalendarDays className="contact-action-arrow"/></button></div></section>
    <footer><span className="brand brand-logo footer-brand"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></span><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>

    {bookingOpen && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setBookingOpen(false)}><section className="booking-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label="Fechar agendamento" onClick={()=>setBookingOpen(false)}><X/></button>{step<3&&<p className="modal-kicker">AGENDAMENTO · ETAPA {step} DE 2</p>}{step===1&&<><h2>Escolha seu horário.</h2><label>Serviço<select value={selectedServices[0]} onChange={e=>{setSelectedServices([e.target.value]);if(date)loadAvailability(date,e.target.value);}}>{services.map(item=><option key={item.name} value={item.name}>{item.name} · {item.price}</option>)}</select></label><fieldset className="calendar-fieldset"><legend>Data</legend><PremiumCalendar value={date} onChange={loadAvailability}/></fieldset><fieldset><legend>Horários disponíveis</legend>{loadingTimes&&<p className="booking-feedback">Consultando horários…</p>}<div className="time-grid">{times.map(t=><button key={t} type="button" disabled={!date||loadingTimes||!availableTimes.includes(t)} className={time===t?"selected":""} onClick={()=>setTime(t)}>{t}</button>)}</div></fieldset>{bookingError&&<p className="booking-error" role="alert">{bookingError}</p>}<button className="primary-cta modal-next" disabled={!date||!time||loadingTimes} onClick={()=>setStep(2)}><span>Continuar</span><ArrowRight/></button></>}{step===2&&<form onSubmit={submitBooking}><h2>Quase tudo pronto.</h2><p className="booking-summary">{selectedServices.join(" + ")}<br/><strong>Total: {(totalPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><br/>{date.split("-").reverse().join("/")} às {time}</p><label>Seu nome<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" required/></label><label>WhatsApp<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(48) 99999-9999" inputMode="tel" required/></label><label className="privacy-consent"><input type="checkbox" checked={privacyAccepted} onChange={e=>setPrivacyAccepted(e.target.checked)} required/><ShieldCheck/><span>Autorizo o uso destes dados apenas para realizar e administrar meu agendamento.</span></label>{bookingError&&<p className="booking-error" role="alert">{bookingError}</p>}<button className="primary-cta modal-next" disabled={submitting||!privacyAccepted}><span>{submitting?"Confirmando…":"Confirmar agendamento"}</span><Check/></button><button className="back-button icon-link" type="button" onClick={()=>setStep(1)}><ArrowLeft/><span>Voltar</span></button></form>}{step===3&&confirmedBooking&&<div className="success receipt-success"><span className="success-mark"><Check/></span><p className="modal-kicker">AGENDAMENTO CONFIRMADO</p><h2>Horário reservado.</h2><p className="receipt-intro">Pronto, {confirmedBooking.name.split(" ")[0]}. Seu atendimento já está na agenda da D.BarberShop.</p><div className="booking-receipt"><div><span><Scissors/>Serviço</span><strong>{confirmedBooking.services.join(" + ")} · {(confirmedBooking.totalPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div><div><span><CalendarDays/>Data</span><strong>{formatBookingDate(confirmedBooking.date)}</strong></div><div><span><Clock3/>Horário</span><strong>{confirmedBooking.time}</strong></div><div><span><Hash/>Código</span><strong>{bookingCode(confirmedBooking.id)}</strong></div></div><div className="receipt-actions"><a className="receipt-whatsapp" href={whatsappConfirmation} target="_blank" rel="noopener noreferrer"><MessageCircle/><span>Compartilhar no WhatsApp</span></a><a className="receipt-manage" href={`/agendamento/${confirmedBooking.id}#token=${encodeURIComponent(confirmedBooking.manageToken)}`}><Settings2/><span>Cancelar ou reagendar</span></a></div><button className="back-button receipt-close" onClick={()=>setBookingOpen(false)}>Voltar ao site</button></div>}</section></div>}
  </main>;
}
