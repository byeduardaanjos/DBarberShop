"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type PremiumCalendarProps = {
  value: string;
  onChange: (date: string) => void;
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

function toLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PremiumCalendar({ value, onChange }: PremiumCalendarProps) {
  const today = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);
  const initial = value ? new Date(`${value}T12:00:00`) : today;
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );

  const cells = useMemo(() => {
    const firstWeekDay = visibleMonth.getDay();
    const lastDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();

    const cellCount = firstWeekDay + lastDay > 35 ? 42 : 35;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstWeekDay + 1;
      if (day < 1 || day > lastDay) return null;
      return new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    });
  }, [visibleMonth]);

  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  function changeMonth(offset: number) {
    setVisibleMonth(
      current => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <div className="premium-calendar" aria-label="Escolha uma data">
      <div className="calendar-header">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={isCurrentMonth}
          aria-label="Mês anterior"
        >
          <ChevronLeft />
        </button>
        <strong>
          {monthNames[visibleMonth.getMonth()]}{" "}
          <span>{visibleMonth.getFullYear()}</span>
        </strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">
          <ChevronRight />
        </button>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>

      <div className="calendar-grid">
        {cells.map((date, index) => {
          if (!date) return <span className="calendar-empty" key={`empty-${index}`} />;

          const iso = toLocalISO(date);
          const unavailable = date < today || date.getDay() === 0;
          const selected = value === iso;
          const isToday = iso === toLocalISO(today);

          return (
            <button
              type="button"
              key={iso}
              className={`${selected ? "selected " : ""}${isToday ? "today" : ""}`}
              disabled={unavailable}
              onClick={() => onChange(iso)}
              aria-label={date.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              aria-pressed={selected}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span><i className="legend-selected" />Selecionado</span>
        <span><i className="legend-unavailable" />Indisponível</span>
      </div>
    </div>
  );
}
