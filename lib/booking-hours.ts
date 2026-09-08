export const bookingTimes = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export function getBookingTimesForDate(date?: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return bookingTimes;

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (weekday === 0) return [];
  if (weekday === 6) return bookingTimes.filter((time) => time <= "15:00");
  return bookingTimes;
}

export function isBookingTimeAllowed(date: string, time: string) {
  return getBookingTimesForDate(date).includes(time);
}
