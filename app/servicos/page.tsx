import InnerHeader from "../components/InnerHeader";
import { ArrowRight, Clock3 } from "lucide-react";

const services = [
  { name: "Corte masculino", detail: "Corte personalizado, consultoria de estilo e acabamento preciso.", time: "50 min", price: "R$ 65", image: "/images/imperium-hero-v3.webp" },
  { name: "Barba premium", detail: "Modelagem, toalha quente e finalização para valorizar os contornos.", time: "35 min", price: "R$ 45", image: "/images/imperium-barba-v3.webp" },
  { name: "Corte + barba", detail: "A experiência completa para renovar o visual com unidade e precisão.", time: "80 min", price: "R$ 100", image: "/images/imperium-ambiente-v3.webp" },
];

export default function ServicesPage() {
  return <main className="services-page">
    <InnerHeader/>
    <section className="services-page-hero"><p className="eyebrow">SERVIÇOS D.BARBERSHOP</p><h1>Escolha o cuidado<br/>ideal para você.</h1><p>Conheça os serviços, valores e duração de cada atendimento.</p></section>
    <section className="services-catalog"><div className="service-grid">{services.map(item=><article className="service-card" key={item.name}><div className="service-image" style={{backgroundImage:`url(${item.image})`}}/><div className="service-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><div className="service-meta"><span><Clock3/>{item.time}</span><strong>{item.price}</strong></div><a className="catalog-book icon-link" href={`/?servico=${encodeURIComponent(item.name)}`}><span>Agendar este serviço</span><ArrowRight/></a></div></article>)}</div><p className="catalog-note">Todos os atendimentos são individuais e realizados com horário marcado.</p></section>
    <footer><a href="/" className="brand brand-logo footer-brand" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>
  </main>;
}
