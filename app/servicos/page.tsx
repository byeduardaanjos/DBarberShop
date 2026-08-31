import InnerHeader from "../components/InnerHeader";
import { ArrowRight, Clock3 } from "lucide-react";

const services = [
  { name: "Barba", detail: "Desenho, alinhamento e acabamento da barba.", time: "60 min", price: "R$ 30", image: "/images/imperium-barba-v3.webp" },
  { name: "Corte", detail: "Corte masculino com acabamento preciso e personalizado.", time: "60 min", price: "R$ 40", image: "/images/imperium-ambiente-v3.webp" },
  { name: "Corte de Tesoura", detail: "Corte clássico feito inteiramente na tesoura.", time: "60 min", price: "R$ 45", image: "/images/imperium-hero-v3.webp" },
  { name: "Sobrancelha", detail: "Limpeza e alinhamento para um visual cuidado.", time: "60 min", price: "R$ 10", image: "/images/imperium-hero-v3.webp" },
  { name: "Corte + Sobrancelha", detail: "Corte com limpeza e alinhamento da sobrancelha.", time: "60 min", price: "R$ 50", image: "/images/imperium-hero-v3.webp" },
  { name: "Corte + Sobrancelha + Barba", detail: "Corte, sobrancelha e barba em um atendimento completo.", time: "60 min", price: "R$ 70", image: "/images/imperium-barba-v3.webp" },
];

export default function ServicesPage() {
  return <main className="services-page">
    <InnerHeader/>
    <section className="services-page-hero"><p className="eyebrow">SERVIÇOS D.BARBERSHOP</p><h1>Escolha o cuidado<br/>ideal para você.</h1><p>Conheça os serviços, valores e duração de cada atendimento.</p></section>
    <section className="services-catalog"><div className="service-grid">{services.map((item,index)=><article className="service-card service-card-no-image" key={item.name}><span className="service-index">{String(index+1).padStart(2,"0")}</span><div className="service-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><div className="service-meta"><span><Clock3/>{item.time}</span><strong>{item.price}</strong></div><a className="catalog-book icon-link" href={`/?servico=${encodeURIComponent(item.name)}`}><span>Agendar este serviço</span><ArrowRight/></a></div></article>)}</div><p className="catalog-note">Todos os atendimentos são individuais e realizados com horário marcado.</p></section>
    <footer><a href="/" className="brand brand-logo footer-brand" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>
  </main>;
}
