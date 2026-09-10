"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Instagram, MapPin, Menu, MessageCircle, Scissors, Star, X } from "lucide-react";
import "./vini.css";

const mapsUrl = "https://maps.app.goo.gl/Cjtp6uQzRno7BKss8?g_st=ic";
const instagramUrl = "https://www.instagram.com/barbeariad.vini";
const whatsappUrl = "https://wa.me/5548996461346";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBooking = () => {
    setMenuOpen(false);
    setBookingOpen(true);
  };

  return (
    <main className="vini-page">
      <header className="vini-header">
        <a className="vini-brand" href="#inicio" aria-label="Barbearia do Vini - início">
          <span className="vini-brand-mark"><Scissors size={16} /></span>
          <span>Barbearia do Vini<small>São Sebastião · Palhoça</small></span>
        </a>
        <button className="vini-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`vini-menu ${menuOpen ? "open" : ""}`}>
          <a href="#experiencia" onClick={() => setMenuOpen(false)}>Experiência</a>
          <a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a>
          <a href="#trabalhos" onClick={() => setMenuOpen(false)}>Trabalhos</a>
          <a href="#avaliacoes" onClick={() => setMenuOpen(false)}>Avaliações</a>
          <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
          <button className="book" onClick={openBooking}>Agendar horário</button>
        </nav>
      </header>

      <section className="vini-hero" id="inicio">
        <p className="vini-kicker">BARBEARIA · SÃO SEBASTIÃO — PALHOÇA</p>
        <h1>Seu estilo.<br/><span>Sua presença.</span></h1>
        <p className="vini-hero-copy">Uma presença digital pensada para acompanhar a experiência da Barbearia do Vini: direta, moderna e fácil de usar do primeiro clique ao agendamento.</p>
        <div className="vini-hero-actions">
          <button className="vini-primary" onClick={openBooking}>Agendar horário <CalendarDays size={18}/></button>
          <a className="vini-secondary" href="#trabalhos">Ver trabalhos <ArrowRight size={18}/></a>
        </div>
        <div className="vini-trust" aria-label="Avaliações no Google">
          <span><strong>5,0</strong><br/>avaliação no Google</span>
          <span className="vini-trust-dot"/>
          <span><strong>71</strong><br/>avaliações públicas</span>
        </div>
      </section>

      <section className="vini-section" id="experiencia">
        <div className="vini-section-head">
          <span className="vini-section-index">01 · EXPERIÊNCIA</span>
          <h2>Profissionalismo<br/>sem exagero.</h2>
          <p className="vini-section-lead">A interface foi construída para transmitir confiança e personalidade sem cair no visual genérico de “barbearia premium”. Tipografia forte, contraste alto e poucos elementos — cada um com função clara.</p>
        </div>
        <div className="vini-experience-grid">
          <article className="vini-experience-card"><b>01 / MARCA</b><h3>Identidade reconhecível</h3><p>A marca continua sendo a protagonista. O site apenas eleva a apresentação digital.</p></article>
          <article className="vini-experience-card"><b>02 / MOBILE</b><h3>Pensado para celular</h3><p>Navegação rápida para quem chega pelo Instagram, Google ou indicação.</p></article>
          <article className="vini-experience-card"><b>03 / AÇÃO</b><h3>Agendamento fácil</h3><p>O principal caminho do site leva naturalmente do interesse ao horário marcado.</p></article>
        </div>
      </section>

      <section className="vini-section" id="servicos">
        <div className="vini-section-head">
          <span className="vini-section-index">02 · SERVIÇOS</span>
          <h2>Escolha seu<br/>atendimento.</h2>
          <p className="vini-section-lead">Nesta demonstração, os valores ainda não são inventados: os serviços e preços oficiais serão cadastrados quando forem confirmados com a barbearia.</p>
        </div>
        <div className="vini-services-placeholder">
          <div className="line"><strong>Serviços da barbearia</strong><span>Valores oficiais</span></div>
          <div className="line"><strong>Combinações e adicionais</strong><span>Após confirmação</span></div>
          <div className="line"><strong>Duração por atendimento</strong><span>Configurável</span></div>
          <button className="vini-primary" onClick={openBooking}>Ver demonstração do agendamento <ArrowRight size={17}/></button>
          <p className="vini-note">Conteúdo comercial mantido como demonstrativo para não apresentar informações não confirmadas como se fossem oficiais.</p>
        </div>
      </section>

      <section className="vini-section" id="trabalhos">
        <div className="vini-section-head">
          <span className="vini-section-index">03 · TRABALHOS</span>
          <h2>O trabalho<br/>fala primeiro.</h2>
          <p className="vini-section-lead">A galeria final será composta exclusivamente por fotos reais publicadas pela Barbearia do Vini. Enquanto os arquivos não estão incorporados ao projeto, o layout já está preparado para receber o material sem refazer a página.</p>
        </div>
        <div className="vini-gallery" aria-label="Área preparada para fotos reais da Barbearia do Vini">
          <div className="vini-gallery-main"><span className="vini-gallery-label">Foto real em destaque · formato editorial</span></div>
          <div className="vini-gallery-side"><span className="vini-gallery-label">Trabalho real · mobile crop</span></div>
        </div>
        <a className="vini-secondary vini-instagram" href={instagramUrl} target="_blank" rel="noreferrer">Ver trabalhos no Instagram <Instagram size={18}/></a>
      </section>

      <section className="vini-section" id="avaliacoes">
        <div className="vini-section-head">
          <span className="vini-section-index">04 · CONFIANÇA</span>
          <h2>Quem conhece,<br/>avalia.</h2>
          <p className="vini-section-lead">A prova social fica perto da decisão de agendar. Usaremos comentários reais do Google assim que os textos forem incorporados ao projeto.</p>
        </div>
        <div className="vini-reviews">
          <article className="vini-review"><div className="vini-stars">★★★★★</div><p>Nota pública da Barbearia do Vini no Google.</p><small>5,0 · 71 avaliações</small></article>
          <article className="vini-review"><Star size={18}/><p>Espaço reservado para uma avaliação real, sem texto gerado ou depoimento fictício.</p><small>Avaliação Google · conteúdo a incorporar</small></article>
          <article className="vini-review"><Star size={18}/><p>O design suporta avaliações curtas e longas sem transformar a seção em cards genéricos.</p><small>Prova social · layout editorial</small></article>
        </div>
      </section>

      <section className="vini-section" id="contato">
        <div className="vini-section-head">
          <span className="vini-section-index">05 · CONTATO</span>
          <h2>Chegue fácil.<br/>Fale rápido.</h2>
          <p className="vini-section-lead">A mesma lógica funcional que já funciona no DBarber, redesenhada para a identidade deste projeto.</p>
        </div>
        <div className="vini-location">
          <article className="vini-location-card"><span><MapPin size={21}/><div><h3>Localização</h3><p>R. Tomaz Domingos da Silveira, 196<br/>São Sebastião, Palhoça — SC · 88136-000</p><a href={mapsUrl} target="_blank" rel="noreferrer">Traçar rota <ArrowRight size={15}/></a></div></span></article>
          <article className="vini-location-card"><span><Clock3 size={21}/><div><h3>Horários</h3><p>Segunda a sexta · 09h–19h<br/>Sábado · 09h–17h</p><a href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp <MessageCircle size={15}/></a></div></span></article>
        </div>
      </section>

      <section className="vini-cta">
        <p>BARBEARIA DO VINI · DEMONSTRAÇÃO</p>
        <h2>Seu próximo horário a poucos toques.</h2>
        <button onClick={openBooking}>Agendar agora <CalendarDays size={18}/></button>
      </section>

      <footer className="vini-footer">
        <strong>Barbearia do Vini</strong>
        <span>São Sebastião · Palhoça — SC</span>
        <span>© 2026 · Demonstração de proposta digital</span>
      </footer>

      <button className="vini-floating-book" onClick={openBooking}><CalendarDays size={18}/> Agendar horário</button>

      {bookingOpen && (
        <div className="vini-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setBookingOpen(false)}>
          <section className="vini-modal" role="dialog" aria-modal="true" aria-label="Demonstração do agendamento online">
            <div className="vini-modal-top"><div><span className="vini-demo-badge">Demonstração interativa</span><h2>Agendamento online</h2></div><button className="vini-modal-close" onClick={() => setBookingOpen(false)} aria-label="Fechar"><X size={18}/></button></div>
            <p className="vini-section-lead">Esta é a opção completa que pode ser ativada caso a barbearia escolha o sistema próprio.</p>
            <div className="vini-booking-flow">
              <article className="vini-step"><b>ETAPA 01</b><h3>Escolha do serviço</h3><p>Serviços, duração e preços entram aqui com os dados oficiais.</p></article>
              <article className="vini-step"><b>ETAPA 02</b><h3>Data e horário</h3><p>Exemplo visual de horários disponíveis:</p><div className="vini-times"><button>09:00</button><button>10:00</button><button>11:00</button><button>14:00</button><button>15:00</button></div></article>
              <article className="vini-step"><b>ETAPA 03</b><h3>Confirmação</h3><p>Nome e telefone do cliente, confirmação do horário e acesso para gerenciar o agendamento.</p></article>
            </div>
            <div className="vini-modal-actions"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Opção WhatsApp</a><button className="accent" onClick={() => setBookingOpen(false)}>Entendi <ArrowRight size={17}/></button></div>
          </section>
        </div>
      )}
    </main>
  );
}
