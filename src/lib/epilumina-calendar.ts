/* Shared calendar helpers (on-device). */

export type CalendarEventLike = { date?: string; time?: string };

const pad = (n: number) => String(n).padStart(2, "0");
const todayISO = (now: Date) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/**
 * True when an event is still ahead of `now`. An event without a time is
 * treated as starting at 00:00 of its day (same as MedicalCalendar). When the
 * date/time can't be parsed, falls back to comparing the date string with today.
 */
export function isUpcoming(
  ev: CalendarEventLike | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!ev) return false;
  const ts = new Date(`${ev.date}T${ev.time || "00:00"}:00`).getTime();
  if (Number.isFinite(ts)) return ts >= now.getTime();
  return (ev.date || "") >= todayISO(now);
}
