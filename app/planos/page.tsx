import { ArrowRight, CalendarDays, CircleCheck, UserRoundCheck } from "lucide-react";
import InnerHeader from "../components/InnerHeader";

export const metadata = {
  title: "Planos | D.BarberShop",
  description: "Conheça o plano mensal da D.BarberShop: quatro cortes durante 30 dias por R$ 140.",
};

const whatsappMessage = encodeURIComponent(
  "Olá! Gostaria de assinar o plano mensal de R$ 140 reais da D.BarberShop. Poderia me passar mais informações sobre a assinatura e as formas de pagamento?",
);
const whatsappUrl = `https://wa.me/5548991659709?text=${whatsappMessage}`;

export default function PlansPage() {
  return <main className="services-page plans-page">
    <InnerHeader />
    <section className="services-page-hero plans-hero">
      <p className="eyebrow">PLANOS D.BARBERSHOP</p>
      <h1>Seu corte em dia.<br/>Todo mês.</h1>
      <p>Mais praticidade para manter o visual sempre alinhado.</p>
    </section>

    <section className="plans-catalog">
      <article className="monthly-plan-card">
        <div className="plan-card-heading">
          <div>
            <p className="eyebrow">PLANO MENSAL</p>
            <h2>PLANOS</h2>
          </div>
        </div>

        <div className="plan-price">
          <small>R$</small>
          <strong>140</strong>
          <span>/ 30 dias</span>
        </div>

        <p className="plan-description">4 cortes para usar durante 30 dias, com atendimento individual e horário marcado.</p>

        <ul className="plan-benefits">
          <li><CircleCheck /><span><strong>4 cortes</strong> incluídos</span></li>
          <li><CalendarDays /><span>Validade de <strong>30 dias</strong></span></li>
          <li><UserRoundCheck /><span>Um corte por atendimento</span></li>
        </ul>

        <a className="primary-cta plan-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <span>Quero assinar o plano</span><ArrowRight />
        </a>
      </article>

      <p className="plan-note">A contratação e o agendamento dos cortes são confirmados diretamente com a D.BarberShop.</p>
    </section>

    <footer><span className="brand brand-logo footer-brand"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></span><span>Biguaçu — Santa Catarina</span><span>© 2026</span></footer>
  </main>;
}
