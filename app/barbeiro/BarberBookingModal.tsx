"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, LoaderCircle, Plus, UserRound, X } from "lucide-react";

const services = [
  { name: "Corte Tesoura", price: 3500 },
  { name: "Degradê", price: 4000 },
  { name: "Degradê Navalhado", price: 4500 },
  { name: "Barba", price: 1500 },
  { name: "Sobrancelha", price: 1000 },
  { name: "Tesoura + Barba", price: 5000 },
  { name: "Degradê + Barba", price: 5500 },
  { name: "Navalhado + Barba", price: 6000 },
  { name: "Completo Tesoura", price: 6000 },
  { name: "Degradê + Barba + Sobrancelha", price: 6500 },
  { name: "Degradê Navalhado + Barba + Sobrancelha", price: 7000 },
];
const allTimes = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const today = () => { const value=new Date(); return new Date(value.getTime()-value.getTimezoneOffset()*60000).toISOString().slice(0,10); };

type Props = {
  open: boolean;
  initialDate: string;
  onClose: () => void;
  onCreated: (date: string) => Promise<void>;
};

export default function BarberBookingModal({open,initialDate,onClose,onCreated}:Props){
  const [service,setService]=useState(services[0].name);
  const [date,setDate]=useState(initialDate);
  const [time,setTime]=useState("");
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [availableTimes,setAvailableTimes]=useState<string[]>([]);
  const [loadingTimes,setLoadingTimes]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const selectedService=useMemo(()=>services.find(item=>item.name===service)!,[service]);

  useEffect(()=>{if(open)setDate(initialDate);},[initialDate,open]);
  useEffect(()=>{
    if(!open||!date)return;
    const controller=new AbortController();
    setLoadingTimes(true);setTime("");setMessage("");
    fetch(`/api/availability?date=${encodeURIComponent(date)}&service=${encodeURIComponent(service)}`,{cache:"no-store",signal:controller.signal})
      .then(async response=>({ok:response.ok,data:await response.json()}))
      .then(({ok,data})=>{if(ok)setAvailableTimes(data.available??[]);else setMessage(data.error??"Não foi possível consultar os horários.");})
      .catch(error=>{if(error?.name!=="AbortError")setMessage("Não foi possível consultar os horários.");})
      .finally(()=>setLoadingTimes(false));
    return()=>controller.abort();
  },[date,open,service]);

  if(!open)return null;

  async function submit(event:FormEvent){
    event.preventDefault();setSaving(true);setMessage("");
    const response=await fetch("/api/barbeiro/agendamentos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service,date,time,name,phone})});
    const data=await response.json();
    if(!response.ok){setMessage(data.error??"Não foi possível criar o agendamento.");setSaving(false);return;}
    await onCreated(date);
    setName("");setPhone("");setTime("");setSaving(false);onClose();
  }

  return <div className="barber-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className="barber-booking-modal" role="dialog" aria-modal="true" aria-labelledby="new-booking-title">
      <button className="barber-modal-close" onClick={onClose} aria-label="Fechar"><X/></button>
      <p className="barber-kicker">AGENDAMENTO PELO BARBEIRO</p>
      <h2 id="new-booking-title">Novo horário.</h2>
      <p className="barber-modal-intro">Cadastre clientes que marcaram pessoalmente ou pelo WhatsApp.</p>
      <form onSubmit={submit}>
        <div className="barber-form-grid">
          <label className="wide">Serviço<select value={service} onChange={event=>setService(event.target.value)}>{services.map(item=><option key={item.name} value={item.name}>{item.name} · {(item.price/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</option>)}</select></label>
          <label>Data<span><CalendarDays/><input type="date" min={today()} value={date} onChange={event=>setDate(event.target.value)} required/></span></label>
          <label>Valor<span className="barber-readonly">{(selectedService.price/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span></label>
          <fieldset className="wide"><legend>Horário</legend>{loadingTimes?<p className="barber-time-loading"><LoaderCircle className="spin"/>Consultando agenda…</p>:<div className="barber-new-time-grid">{allTimes.map(item=><button type="button" key={item} disabled={!availableTimes.includes(item)} className={time===item?"active":""} onClick={()=>setTime(item)}><Clock3/>{item}</button>)}</div>}</fieldset>
          <label>Nome do cliente<span><UserRound/><input value={name} onChange={event=>setName(event.target.value)} minLength={2} maxLength={100} placeholder="Nome completo" required/></span></label>
          <label>WhatsApp<span><input value={phone} onChange={event=>setPhone(event.target.value)} maxLength={30} inputMode="tel" placeholder="(48) 99999-9999" required/></span></label>
        </div>
        {message&&<p className="barber-modal-message" role="alert">{message}</p>}
        <button className="barber-primary barber-create-booking" disabled={saving||!time}>{saving?<LoaderCircle className="spin"/>:<Check/>}{saving?"Salvando…":"Confirmar agendamento"}</button>
      </form>
    </section>
  </div>;
}

export function NewBookingButton({onClick}:{onClick:()=>void}){
  return <button className="barber-new-booking" type="button" onClick={onClick}><Plus/>Novo agendamento</button>;
}
