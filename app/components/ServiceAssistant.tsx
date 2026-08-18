import { Check, Scissors } from "lucide-react";

type Service = { name: string; price: string; priceCents: number };

export default function ServiceAssistant({ services, selected, onChange }: { services: Service[]; selected: string[]; onChange: (services: string[]) => void }) {
  const total = selected.reduce((sum, name) => sum + (services.find(service => service.name === name)?.priceCents ?? 0), 0);
  function toggle(name: string) {
    if (selected.includes(name)) {
      if (selected.length > 1) onChange(selected.filter(item => item !== name));
    } else onChange([...selected, name]);
  }
  return <section className="service-assistant" aria-labelledby="service-assistant-title">
    <div className="service-assistant-intro"><span><Scissors/></span><div><small>ASSISTENTE D.BARBERSHOP</small><h3 id="service-assistant-title">Quais serviços você deseja?</h3><p>Escolha um ou mais. A comanda é calculada automaticamente.</p></div></div>
    <div className="service-choice-list">{services.map(service => <button type="button" key={service.name} className={selected.includes(service.name) ? "selected" : ""} aria-pressed={selected.includes(service.name)} onClick={() => toggle(service.name)}><span className="service-choice-check">{selected.includes(service.name) && <Check/>}</span><strong>{service.name}</strong><em>{service.price}</em></button>)}</div>
    <div className="service-command"><span><small>SUA SELEÇÃO</small><strong>{selected.join(" + ")}</strong></span><span><small>VALOR TOTAL</small><strong>{(total / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span></div>
  </section>;
}
