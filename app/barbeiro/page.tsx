import type { Metadata } from "next";
import BarberDashboard from "./BarberDashboard";
import "./barbeiro.css";

export const metadata: Metadata = {
  title: "Área do Barbeiro | D.BarberShop",
  robots: { index: false, follow: false },
};

export default function BarberPage() {
  return <BarberDashboard />;
}

