"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Scissors,
  Star,
  X,
} from "lucide-react";
import "./vini.css";

const mapsUrl = "https://maps.app.goo.gl/Cjtp6uQzRno7BKss8?g_st=ic";
const instagramUrl = "https://www.instagram.com/barbeariad.vini";
const whatsappUrl = "https://wa.me/5548996461346";

const bookingTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState("");

  function openBooking() {
    setMenuOpen(false);
    setBookingOpen(true);
    setBookingStep(1);
    setSelectedTime("");
  }

  function closeBooking() {
    setBookingOpen(false);
    setBookingStep(1);
    setSelectedTime("");
  }

  useEffect(() => {
    document.body.style.overflow = bookingOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingOpen, menuOpen]);

  return (
    <main className="vini-page">
      <header className="vini-header">
        <a className="vini-brand" href="#inicio" aria-label="Barbearia do Vini - início">
          <span className="vini-brand-mark"><Scissors size={17} strokeWidth={1.8} /></span>
          <span className="vini-brand-copy">Barbearia do Vini<small>São Sebastião · Palhoça</small></span>
        </a>

        <button
          className="vini-menu-btn"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`vini-menu ${menuOpen ? "open" : ""}`} aria-label="Navegação principal">
          <a href="#sobre" onClick={() => setMenuOpen(false)}>A barbearia</a>
          <a href="#trabalhos" onClick={() => setMenuOpen(false)}>Trabalhos</a>
          <a href="#avaliacoes" onClick={() => setMenuOpen(false)}>Avaliações</a>
          <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
          <button className="book" onClick={openBooking}>Agendar horário</button>
        </nav>
      </header>

      <section className="vini-hero" id="inicio">
        <div className="vini-hero-art" aria-hidden="true">
          <span className="vini-hero-number">01</span>
          <span className="vini-hero-ring" />
          <span className="vini-hero-line" />
        </div>

        <div className="vini-hero-content">
          <p className="vini-kicker">BARBEARIA · SÃO SEBASTIÃO — PALHOÇA</p>
          <h1>Corte limpo.<br/><span>Presença forte.</span></h1>
          <p className="vini-hero-copy">
            Um espaço para cuidar do visual com praticidade, estilo e uma experiência digital à altura da Barbearia do Vini.
          </p>
          <div className="vini-hero-actions">
            <button className="vini-primary" onClick={openBooking}>Agendar horário <CalendarDays size={18} /></button>
            <a className="vini-secondary" href={instagramUrl} target="_blank" rel="noreferrer">Ver Instagram <Instagram size={18} /></a>
          </div>
        </div>

        <div className="vini-trust" aria-label="Informações públicas da Barbearia do Vini">
          <div><strong>5,0</strong><span>nota no Google</span></div>
          <div><strong>37</strong><span>avaliações públicas</span></div>
          <a href={mapsUrl} target="_blank" rel="noreferrer">Ver no Google <ArrowRight size={15} /></a>
        </div>
      </section>

      <section className="vini-marquee" aria-hidden="true">
        <div>ESTILO <span>✦</span> PRESENÇA <span>✦</span> PRECISÃO <span>✦</span> BARBEARIA DO VINI <span>✦</span> ESTILO <span>✦</span> PRESENÇA</div>
      </section>

      <section className="vini-section vini-about" id="sobre">
        <div className="vini-section-head">
          <span className="vini-section-index">01 · A EXPERIÊNCIA</span>
          <h2>Visual forte.<br/>Experiência simples.</h2>
          <p className="vini-section-lead">
            Tudo o que o cliente precisa fica a poucos toques: conhecer a barbearia, ver os trabalhos, conferir avaliações, encontrar o endereço e agendar.
          </p>
        </div>

        <div className="vini-feature-grid">
          <article className="vini-feature-card featured">
            <span>01</span>
            <h3>Do Instagram ao horário marcado.</h3>
            <p>Uma jornada curta, clara e pensada primeiro para quem acessa pelo celular.</p>
            <button onClick={openBooking}>Agendar agora <ArrowRight size={16} /></button>
          </article>
          <article className="vini-feature-card">
            <span>02</span>
            <h3>Contato rápido.</h3>
            <p>WhatsApp, Instagram e rota ficam sempre fáceis de encontrar.</p>
          </article>
          <article className="vini-feature-card">
            <span>03</span>
            <h3>Confiança antes do clique.</h3>
            <p>Avaliações públicas e informações reais da barbearia ajudam na decisão.</p>
          </article>
        </div>
      </section>

      <section className="vini-section vini-booking-showcase" id="agendamento">
        <div className="vini-section-head">
          <span className="vini-section-index">02 · AGENDAMENTO</span>
          <h2>Menos conversa.<br/>Mais praticidade.</h2>
          <p className="vini-section-lead">
            A proposta pode funcionar de duas formas: agendamento online próprio ou atendimento direto pelo WhatsApp. A experiência visual já está pronta para as duas opções.
          </p>
        </div>

        <div className="vini-booking-preview">
          <div className="vini-preview-top">
            <span className="vini-preview-dot" />
            <p>Próximo passo</p>
            <span>01 / 03</span>
          </div>
          <div className="vini-preview-body">
            <p className="vini-kicker">SELECIONE O ATENDIMENTO</p>
            <h3>Escolha o serviço que combina com o que você precisa.</h3>
            <div className="vini-preview-lines">
              <span /><span /><span />
            </div>
            <button onClick={openBooking}>Abrir prévia do agendamento <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="vini-section vini-work" id="trabalhos">
        <div className="vini-section-head">
          <span className="vini-section-index">03 · TRABALHOS</span>
          <h2>Resultado que<br/>fala por si.</h2>
          <p className="vini-section-lead">
            Os trabalhos reais da Barbearia do Vini continuam no centro da experiência. O site leva o visitante direto ao perfil oficial para conhecer o portfólio publicado.
          </p>
        </div>

        <a className="vini-instagram-panel" href={instagramUrl} target="_blank" rel="noreferrer">
          <div>
            <span className="vini-instagram-icon"><Instagram size={24} /></span>
            <p>@barbeariad.vini</p>
            <h3>Veja os trabalhos<br/>no Instagram.</h3>
          </div>
          <span className="vini-circle-arrow"><ArrowRight size={22} /></span>
        </a>
      </section>

      <section className="vini-section vini-reviews-section" id="avaliacoes">
        <div className="vini-section-head">
          <span className="vini-section-index">04 · AVALIAÇÕES</span>
          <h2>Boa reputação<br/>também converte.</h2>
          <p className="vini-section-lead">
            A Barbearia do Vini aparece com nota máxima no Google. Em vez de inventar depoimentos, a proposta usa somente prova social pública e verificável.
          </p>
        </div>

        <div className="vini-rating-card">
          <div className="vini-rating-score">5,0</div>
          <div className="vini-rating-copy">
            <div className="vini-stars" aria-label="5 estrelas">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}</div>
            <h3>Excelente avaliação no Google</h3>
            <p>37 avaliações públicas no perfil da barbearia.</p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer">Ver avaliações <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="vini-section vini-contact" id="contato">
        <div className="vini-section-head">
          <span className="vini-section-index">05 · CONTATO</span>
          <h2>Chegue fácil.<br/>Fale rápido.</h2>
          <p className="vini-section-lead">Informações essenciais sem esconder o que o cliente veio procurar.</p>
        </div>

        <div className="vini-contact-grid">
          <a className="vini-contact-card primary-card" href={mapsUrl} target="_blank" rel="noreferrer">
            <MapPin size={23} />
            <div><small>LOCALIZAÇÃO</small><h3>São Sebastião, Palhoça</h3><p>R. Tomaz Domingos da Silveira, 196<br/>SC · 88136-000</p></div>
            <ArrowRight className="vini-card-arrow" size={20} />
          </a>

          <div className="vini-contact-stack">
            <a className="vini-contact-card" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={21} />
              <div><small>ATENDIMENTO</small><h3>WhatsApp</h3><p>(48) 99646-1346</p></div>
              <ArrowRight className="vini-card-arrow" size={19} />
            </a>
            <article className="vini-contact-card">
              <Clock3 size={21} />
              <div><small>HORÁRIOS</small><h3>Quando encontrar a gente</h3><p>Seg–sex · 09h–19h<br/>Sábado · 08h–15h</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="vini-cta">
        <div>
          <p>BARBEARIA DO VINI · PALHOÇA</p>
          <h2>Seu próximo corte começa aqui.</h2>
        </div>
        <button onClick={openBooking}>Agendar horário <CalendarDays size={19} /></button>
      </section>

      <footer className="vini-footer">
        <div><strong>Barbearia do Vini</strong><span>São Sebastião · Palhoça — SC</span></div>
        <div className="vini-footer-links"><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href={mapsUrl} target="_blank" rel="noreferrer">Google Maps</a></div>
        <span>© 2026</span>
      </footer>

      <button className="vini-floating-book" onClick={openBooking}><CalendarDays size={18} /> Agendar horário</button>

      {bookingOpen && (
        <div className="vini-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeBooking()}>
          <section className="vini-modal" role="dialog" aria-modal="true" aria-label="Prévia do agendamento online">
            <div className="vini-modal-top">
              <div><span className="vini-demo-badge">Prévia do sistema</span><h2>Agendamento online</h2></div>
              <button className="vini-modal-close" onClick={closeBooking} aria-label="Fechar"><X size={18} /></button>
            </div>

            {bookingStep === 1 && (
              <div className="vini-booking-step">
                <p className="vini-modal-step">ETAPA 01 · SERVIÇO</p>
                <h3>Escolha do atendimento</h3>
                <p>Os serviços e valores oficiais entram aqui quando forem confirmados pela barbearia.</p>
                <div className="vini-service-preview">
                  <button className="selected"><span><Scissors size={18} /> Serviço selecionado</span><Check size={17} /></button>
                  <button disabled><span>Outros serviços</span><span>+</span></button>
                </div>
                <button className="vini-modal-primary" onClick={() => setBookingStep(2)}>Continuar <ArrowRight size={17} /></button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="vini-booking-step">
                <p className="vini-modal-step">ETAPA 02 · HORÁRIO</p>
                <h3>Escolha um horário</h3>
                <p>Exemplo da experiência que o cliente terá para encontrar um horário disponível.</p>
                <div className="vini-times">
                  {bookingTimes.map((time) => <button key={time} className={selectedTime === time ? "selected" : ""} onClick={() => setSelectedTime(time)}>{time}</button>)}
                </div>
                <button className="vini-modal-primary" disabled={!selectedTime} onClick={() => setBookingStep(3)}>Continuar <ArrowRight size={17} /></button>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="vini-booking-step vini-confirm-step">
                <span className="vini-confirm-icon"><Check size={24} /></span>
                <p className="vini-modal-step">ETAPA 03 · CONFIRMAÇÃO</p>
                <h3>Pronto para confirmar.</h3>
                <p>Na versão completa, o cliente informa nome e WhatsApp e recebe a confirmação do horário de {selectedTime}.</p>
                <div className="vini-modal-actions">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Usar WhatsApp</a>
                  <button onClick={closeBooking}>Finalizar prévia <Check size={17} /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
