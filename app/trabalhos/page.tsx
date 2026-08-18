import InnerHeader from "../components/InnerHeader";
import { CalendarDays, Instagram } from "lucide-react";

export default function WorksPage() {
  return <main className="works-page">
    <InnerHeader/>
    <section className="services-page-hero"><p className="eyebrow">TRABALHOS D.BARBERSHOP</p><h1>Detalhes que definem<br/>o resultado.</h1><p>Um espaço reservado para os trabalhos reais da D.BarberShop.</p></section>
    <section className="works-catalog"><div className="gallery-empty"><span className="gallery-empty-mark">D</span><p className="eyebrow">GALERIA EM PREPARAÇÃO</p><h2>Novos trabalhos<br/>em breve.</h2><p>Os primeiros cortes, barbas e acabamentos serão publicados aqui. Acompanhe também pelo Instagram.</p><div className="gallery-empty-actions"><a className="outline-cta icon-link" href="https://www.instagram.com/d.barbershop00/" target="_blank" rel="noopener noreferrer"><span>Acompanhar no Instagram</span><Instagram/></a><a className="primary-cta" href="/?agendar=1"><span>Agendar horário</span><CalendarDays/></a></div></div></section>
    <footer><a href="/" className="brand brand-logo footer-brand" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>
  </main>;
}
