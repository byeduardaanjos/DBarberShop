import InnerHeader from "../components/InnerHeader";
import { CalendarDays } from "lucide-react";

const works = [
  { title: "Corte e acabamento", detail: "Precisão e construção de forma.", image: "/images/imperium-hero-v3.webp", alt: "Acabamento de corte masculino" },
  { title: "Barba e contorno", detail: "Linhas definidas e acabamento cuidadoso.", image: "/images/imperium-barba-v3.webp", alt: "Acabamento de barba com navalha" },
  { title: "Experiência D.BarberShop", detail: "Ambiente preparado para um atendimento individual.", image: "/images/imperium-ambiente-v3.webp", alt: "Ambiente e ferramentas de barbearia" },
];

export default function WorksPage() {
  return <main className="works-page">
    <InnerHeader/>
    <section className="services-page-hero"><p className="eyebrow">TRABALHOS D.BARBERSHOP</p><h1>Detalhes que definem<br/>o resultado.</h1><p>Galeria preparada para reunir os cortes, barbas e acabamentos realizados.</p></section>
    <section className="works-catalog"><div className="works-catalog-grid">{works.map(item=><article className="work-card" key={item.title}><img src={item.image} alt={item.alt}/><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div><p className="catalog-note">Técnica, cuidado e acabamento em cada etapa do atendimento.</p><div className="gallery-book"><a className="primary-cta" href="/?agendar=1"><span>Agendar horário</span><CalendarDays/></a></div></section>
    <footer><a href="/" className="brand brand-logo footer-brand" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>
  </main>;
}
