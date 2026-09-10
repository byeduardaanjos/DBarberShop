"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Scissors,
  Sparkles,
  X,
} from "lucide-react";

const services = [
  { name: "Corte tradicional", price: "R$ 40", detail: "Tesoura e máquina com acabamento preciso." },
  { name: "Degradê", price: "R$ 45", detail: "Transição limpa e finalização personalizada." },
  { name: "Barba", price: "R$ 30", detail: "Desenho, alinhamento e acabamento da barba." },
  { name: "Corte + barba", price: "R$ 65", detail: "Experiência completa para renovar o visual." },
  { name: "Corte infantil", price: "R$ 35", detail: "Atendimento cuidadoso e confortável." },
  { name: "Sobrancelha", price: "R$ 10", detail: "Limpeza e alinhamento para finalizar o visual." },
];

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1100&q=86",
    alt: "Corte masculino em barbearia",
    label: "Precisão",
  },
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1100&q=86",
    alt: "Ambiente de barbearia",
    label: "Experiência",
  },
  {
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1100&q=86",
    alt: "Barbeiro realizando acabamento",
    label: "Detalhe",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="dvini-site">
      <header className="dv-header">
        <a className="dv-brand" href="#inicio" onClick={closeMenu} aria-label="Barbearia do Vini">
          <span className="dv-brand-small">BARBEARIA</span>
          <strong>dº Vini</strong>
        </a>

        <nav className={menuOpen ? "dv-nav open" : "dv-nav"}>
          <a href="#servicos" onClick={closeMenu}>Serviços</a>
          <a href="#trabalhos" onClick={closeMenu}>Trabalhos</a>
          <a href="#localizacao" onClick={closeMenu}>Localização</a>
        </nav>

        <button className="dv-book-header" onClick={() => setBookingOpen(true)}>
          Agendar horário <ArrowRight size={16} />
        </button>

        <button
          className="dv-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="dv-hero" id="inicio">
        <div className="dv-hero-photo" />
        <div className="dv-hero-shade" />
        <div className="dv-hero-grain" />

        <div className="dv-hero-content">
          <p className="dv-kicker"><span /> PALHOÇA · SANTA CATARINA</p>
          <h1>
            Do tradicional
            <em>ao moderno.</em>
          </h1>
          <p className="dv-hero-copy">
            Estilo, técnica e cuidado em uma experiência pensada para valorizar cada detalhe.
          </p>
          <div className="dv-hero-actions">
            <button className="dv-primary" onClick={() => setBookingOpen(true)}>
              <span>Agendar horário</span><CalendarDays size={18} />
            </button>
            <a className="dv-ghost" href="#trabalhos">Ver trabalhos <ArrowRight size={17} /></a>
          </div>
        </div>

        <div className="dv-hero-side">
          <span>SEG — SEX</span><strong>09h — 19h</strong>
          <span>SÁBADO</span><strong>08h — 15h</strong>
        </div>

        <a className="dv-scroll" href="#servicos">DESCUBRA A EXPERIÊNCIA <ArrowDown size={15} /></a>
      </section>

      <section className="dv-manifesto">
        <p className="dv-kicker"><span /> IDENTIDADE</p>
        <div className="dv-manifesto-grid">
          <h2>Visual marcante.<br/>Acabamento <em>preciso.</em></h2>
          <p>
            Uma apresentação premium da Barbearia do Vini, com foco em serviços, trabalhos, localização e agendamento.
          </p>
        </div>
        <div className="dv-values">
          <article><b>01</b><Scissors /><h3>Técnica</h3><p>Cortes e acabamentos apresentados com destaque visual.</p></article>
          <article><b>02</b><Sparkles /><h3>Estilo</h3><p>Uma identidade que combina tradição com uma linguagem atual.</p></article>
          <article><b>03</b><Clock3 /><h3>Praticidade</h3><p>Acesso rápido a horários, localização e formas de agendamento.</p></article>
        </div>
      </section>

      <section className="dv-services" id="servicos">
        <div className="dv-section-head">
          <div><p className="dv-kicker"><span /> SERVIÇOS</p><h2>Escolha seu <em>ritual.</em></h2></div>
          <p>Valores demonstrativos para apresentação do projeto.</p>
        </div>
        <div className="dv-service-list">
          {services.map((service, index) => (
            <button className="dv-service-row" key={service.name} onClick={() => setBookingOpen(true)}>
              <span className="dv-service-number">0{index + 1}</span>
              <span className="dv-service-name"><strong>{service.name}</strong><small>{service.detail}</small></span>
              <span className="dv-service-price">{service.price}</span>
              <span className="dv-service-arrow"><ArrowRight /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="dv-work" id="trabalhos">
        <div className="dv-section-head dv-section-head-light">
          <div><p className="dv-kicker"><span /> TRABALHOS</p><h2>Estilo que fala<br/><em>antes de você.</em></h2></div>
          <a href="https://www.instagram.com/barbeariad.vini" target="_blank" rel="noreferrer">Ver Instagram <ArrowRight size={16} /></a>
        </div>
        <div className="dv-gallery">
          {gallery.map((item, index) => (
            <figure className={`dv-gallery-card card-${index + 1}`} key={item.src}>
              <img src={item.src} alt={item.alt} />
              <figcaption><span>0{index + 1}</span>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="dv-location" id="localizacao">
        <div className="dv-location-main">
          <p className="dv-kicker"><span /> LOCALIZAÇÃO</p>
          <h2>Seu próximo corte<br/>começa <em>aqui.</em></h2>
          <a className="dv-map-link" href="https://maps.app.goo.gl/rpTWc2T2RkhYW5aT9?g_st=ic" target="_blank" rel="noreferrer">
            <MapPin />
            <span><small>GOOGLE MAPS</small><strong>São Sebastião · Palhoça — SC</strong><em>Abrir localização</em></span>
            <ArrowRight />
          </a>
        </div>
        <div className="dv-hours">
          <p>HORÁRIOS</p>
          <div><span>Segunda — Sexta</span><strong>09h — 19h</strong></div>
          <div><span>Sábado</span><strong>08h — 15h</strong></div>
          <div><span>Domingo</span><strong>Fechado</strong></div>
          <button className="dv-primary" onClick={() => setBookingOpen(true)}><span>Agendar horário</span><ArrowRight size={18}/></button>
        </div>
      </section>

      <section className="dv-final-cta">
        <span className="dv-final-watermark">dº Vini</span>
        <div>
          <p className="dv-kicker"><span /> AGENDE SEU HORÁRIO</p>
          <h2>Seu horário.<br/><em>Seu estilo.</em></h2>
          <button className="dv-primary dv-primary-light" onClick={() => setBookingOpen(true)}><span>Quero agendar</span><ArrowRight size={18}/></button>
        </div>
      </section>

      <footer className="dv-footer">
        <div className="dv-brand dv-brand-footer"><span className="dv-brand-small">BARBEARIA</span><strong>dº Vini</strong></div>
        <p>Do tradicional ao moderno.</p>
        <a href="https://www.instagram.com/barbeariad.vini" target="_blank" rel="noreferrer"><Instagram size={17}/> @barbeariad.vini</a>
        <span>© 2026</span>
      </footer>

      {bookingOpen && (
        <div className="dv-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setBookingOpen(false)}>
          <section className="dv-booking-modal" role="dialog" aria-modal="true" aria-label="Demonstração de agendamento">
            <button className="dv-modal-close" onClick={() => setBookingOpen(false)} aria-label="Fechar"><X /></button>
            <p className="dv-kicker"><span /> AGENDAMENTO</p>
            <h2>Como prefere<br/><em>reservar seu horário?</em></h2>
            <p className="dv-modal-intro">O projeto pode funcionar com atendimento direto pelo WhatsApp ou com uma agenda completa dentro do próprio site.</p>
            <div className="dv-booking-options">
              <button>
                <MessageCircle />
                <span><small>OPÇÃO 01</small><strong>WhatsApp</strong><em>Conversa direta e rápida</em></span>
                <ArrowRight />
              </button>
              <button>
                <CalendarDays />
                <span><small>OPÇÃO 02</small><strong>Agenda online</strong><em>Serviço, data e horário no site</em></span>
                <ArrowRight />
              </button>
            </div>
            <p className="dv-demo-note">Demonstração visual · a integração é definida após a aprovação do projeto.</p>
          </section>
        </div>
      )}
    </main>
  );
}
