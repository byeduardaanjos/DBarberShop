"use client";

import { useEffect } from "react";
import { animate, hover, inView, scroll, stagger } from "motion";

const premiumEase = [0.22, 1, 0.36, 1] as const;

export default function MotionEnhancements() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];
    const hero = document.querySelector<HTMLElement>(".hero");
    const heroContent = document.querySelector<HTMLElement>(".hero-content");
    const heroOverlay = document.querySelector<HTMLElement>(".hero-overlay");
    const header = document.querySelector<HTMLElement>(".site-header");

    if (header) animate(header, { opacity: [0, 1], transform: ["translateY(-28px)", "translateY(0)"] }, { duration: 0.9, ease: premiumEase });
    if (heroOverlay) animate(heroOverlay, { opacity: [0, 1] }, { duration: 1.4, ease: "easeOut" });

    if (heroContent) {
      const heroItems = heroContent.querySelectorAll<HTMLElement>(":scope > *");
      animate(heroItems, { opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"], transform: ["translateY(44px)", "translateY(0)"] }, { duration: 1, delay: stagger(0.14), ease: premiumEase });
      if (hero) cleanups.push(scroll((progress: number) => {
        heroContent.style.transform = `translateY(${-progress * 72}px)`;
        heroContent.style.opacity = String(1 - progress * 0.56);
        hero.style.backgroundPosition = `64% ${38 + progress * 10}%`;
      }, { target: hero, offset: ["start start", "end start"] }));
    }

    document.querySelectorAll<HTMLElement>(".section-title, .about-copy, .contact-heading, .services-page-hero").forEach((element) => {
      element.style.opacity = "0";
      element.style.filter = "blur(6px)";
      element.style.transform = "translateY(46px)";
      cleanups.push(inView(element, () => {
        animate(element, { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" }, { duration: 0.95, ease: premiumEase });
      }, { margin: "0px 0px -10% 0px", amount: 0.18 }));
    });

    document.querySelectorAll<HTMLElement>(".service-grid, .work-preview-grid, .contact-actions, .contact-details, .works-catalog-grid, .pillars").forEach((group) => {
      const cards = Array.from(group.children) as HTMLElement[];
      cards.forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(42px) scale(.975)";
      });
      cleanups.push(inView(group, () => {
        animate(cards, { opacity: 1, transform: "translateY(0) scale(1)" }, { duration: 0.8, delay: stagger(0.11), ease: premiumEase });
      }, { margin: "0px 0px -8% 0px", amount: 0.1 }));
    });

    document.querySelectorAll<HTMLElement>(".work-card img").forEach((image) => {
      const card = image.closest<HTMLElement>(".work-card");
      if (!card) return;
      cleanups.push(scroll((progress: number) => {
        image.style.transform = `scale(1.08) translateY(${(progress - 0.5) * 12}px)`;
      }, { target: card, offset: ["start end", "end start"] }));
    });

    document.querySelectorAll<HTMLElement>(".primary-cta, .outline-cta, .contact-action, .service-card").forEach((element) => {
      cleanups.push(hover(element, () => {
        animate(element, { transform: "translateY(-3px) scale(1.012)" }, { duration: 0.24, ease: "easeOut" });
        return () => animate(element, { transform: "translateY(0) scale(1)" }, { duration: 0.3, ease: "easeOut" });
      }));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
