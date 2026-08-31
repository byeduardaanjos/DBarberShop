"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function InnerHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header inner-site-header">
    <a href="/" className="brand brand-logo" aria-label="Página inicial da D.BarberShop"><img src="/images/dbarbershop-wordmark.webp" alt="D.BarberShop"/></a>
    <button className={open ? "menu-toggle open" : "menu-toggle"} onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? "nav open" : "nav"}><a href="/servicos">Serviços</a><a href="/planos">Planos</a><a href="/trabalhos">Trabalhos</a><a href="/#sobre">Sobre</a><a href="/#contato">Contato</a><a className="nav-book" href="/?agendar=1">Agendar horário</a></nav>
    <a className="header-cta inner-cta" href="/?agendar=1">Agendar horário</a>
  </header>;
}
