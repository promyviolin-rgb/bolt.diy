/* EPILUMINA — powiadomienia lokalne + eksport do kalendarza telefonu.
 *
 * WAŻNE OGRANICZENIE: przeglądarka/ PWA nie potrafi sama obudzić się w tle.
 * Bez serwera nie ma push. Dlatego:
 *   1. gdy aplikacja jest otwarta — powiadomienie pokazuje się od razu,
 *   2. gdy była zamknięta — po otwarciu nadrabiamy zaległe (catch-up),
 *   3. na stałe, także przy zamkniętej aplikacji, działa kalendarz telefonu —
 *      dlatego dajemy eksport .ics (jeden klik, wpis trafia do Kalendarza
 *      Google / Apple / Samsung i to system pilnuje przypomnienia).
 *
 * Na iOS `new Notification()` rzuca wyjątkiem — poprawna droga to
 * `registration.showNotification()` przez service worker. Ten moduł robi to
 * dobrze na obu platformach.
 */

/** Pokazuje powiadomienie: najpierw przez service worker, potem klasycznie. */
export async function showLocalNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<boolean> {
  const options: NotificationOptions = {
    body,
    // Duża ikona = ikona aplikacji, mała (badge) = biały zarys serca.
    // Wcześniej oba wskazywały na favicon.png, więc Android pokazywał
    // domyślną ikonę Chrome zamiast Epiluminy.
    icon: "/icon-192.png",
    badge: "/badge.png",
    ...(tag ? { tag } : {}),
  };
  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, options);
        return true;
      }
    }
  } catch {
    /* brak SW albo odmowa — próbujemy klasycznie */
  }
  try {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission !== "granted") return false;
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

const FIRED_KEY = "epilumina.notif.fired";

/** Klucze już pokazanych powiadomień (żeby nie dublować po odświeżeniu). */
export function firedSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FIRED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markFired(keys: string[]) {
  try {
    const set = firedSet();
    for (const k of keys) set.add(k);
    // trzymamy maks. 500 ostatnich
    const arr = [...set].slice(-500);
    window.localStorage.setItem(FIRED_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

/* --------------------------- kalendarz .ics --------------------------- */

function icsEscape(s: string) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** "2026-10-26" + "09:00" → 20261026T090000 (czas lokalny, bez Z). */
function icsStamp(date: string, time: string) {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!d) return "";
  const t = /^(\d{2}):(\d{2})/.exec(time || "09:00");
  const hh = t ? t[1] : "09";
  const mm = t ? t[2] : "00";
  return `${d[1]}${d[2]}${d[3]}T${hh}${mm}00`;
}

export type IcsEvent = {
  id?: string;
  date: string;
  time?: string;
  name: string;
  place?: string;
  notes?: string;
  remind?: boolean;
  remindTime?: string;
};

/**
 * Buduje plik .ics z wydarzeniami kalendarza medycznego.
 * Jeśli wydarzenie ma przypomnienie, dokładamy VALARM — telefon pokaże
 * powiadomienie sam, nawet gdy Epilumina jest zamknięta.
 */
export function buildIcs(events: IcsEvent[], stampMs = Date.now()): string {
  const dtstamp =
    new Date(stampMs).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z") || "20260101T000000Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Epilumina//Kalendarz medyczny//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Epilumina",
  ];

  const nowMs = stampMs;
  for (const ev of events) {
    if (!ev || !ev.date || !ev.name) continue;
    const start = icsStamp(ev.date, ev.time || "09:00");
    if (!start) continue;

    const endMin = (() => {
      const t = /^(\d{2}):(\d{2})/.exec(ev.time || "09:00");
      const base = t ? Number(t[1]) * 60 + Number(t[2]) : 9 * 60;
      return Math.min(23 * 60 + 59, base + 60);
    })();
    const end = `${start.slice(0, 9)}${String(Math.floor(endMin / 60)).padStart(2, "0")}${String(
      endMin % 60,
    ).padStart(2, "0")}00`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:epilumina-${ev.id || start}-${start}@epilumina.app`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${icsEscape(ev.name)}`);

    const desc = [ev.place ? `Miejsce: ${ev.place}` : "", ev.notes || ""].filter(Boolean).join("\n");
    if (desc) lines.push(`DESCRIPTION:${icsEscape(desc)}`);

    // przypomnienie: domyślnie 30 min przed, jeśli podano konkretną godzinę — o niej
    if (ev.remind) {
      const startMs = (() => {
        const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(start);
        if (!m) return null;
        return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
      })();
      let trigger = "-PT30M";
      if (ev.remindTime && startMs !== null) {
        const t = /^(\d{2}):(\d{2})/.exec(ev.remindTime);
        if (t) {
          const remindMs = Date.UTC(
            +start.slice(0, 4),
            +start.slice(4, 6) - 1,
            +start.slice(6, 8),
            +t[1],
            +t[2],
          );
          const diffMin = Math.round((startMs - remindMs) / 60000);
          if (diffMin > 0) trigger = `-PT${diffMin}M`;
          else if (diffMin < 0) trigger = `PT${Math.abs(diffMin)}M`;
          else trigger = "PT0M";
        }
      }
      lines.push("BEGIN:VALARM");
      lines.push(`TRIGGER:${trigger}`);
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${icsEscape(ev.name)}`);
      lines.push("END:VALARM");
    }

    lines.push("END:VEVENT");
  }
  void nowMs;

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Pobiera plik .ics (użytkownik dodaje go do kalendarza telefonu). */
export function downloadIcs(events: IcsEvent[], fileName = "epilumina-kalendarz.ics") {
  const text = buildIcs(events);
  // BEZ BOM na początku! Znacznik BOM sprawia, że część kalendarzy na Androidzie
  // i iOS odrzuca plik ("nie można uruchomić wydarzenia").
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ---------------------- leki jako cykliczne wpisy ---------------------- */

export type IcsMed = { id?: string; name?: string; dose?: string; times?: string[] };

/**
 * Buduje .ics z lekami jako wydarzeniami POWTARZAJĄCYMI SIĘ codziennie
 * (RRULE:FREQ=DAILY) z alarmem o dokładnej godzinie. Telefon sam przypomni
 * o leku nawet przy zamkniętej Epiluminie — to jedyny pewny sposób w PWA.
 */
export function buildMedsIcs(meds: IcsMed[], startDate: string, stampMs = Date.now()): string {
  const dtstamp =
    new Date(stampMs).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z") ||
    "20260101T000000Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Epilumina//Leki//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Epilumina — leki",
  ];

  for (const m of meds || []) {
    const name = String(m?.name || "").trim();
    if (!name) continue;
    const dose = String(m?.dose || "").trim();
    const title = dose ? `${name} — ${dose}` : name;
    for (const raw of m?.times || []) {
      const t = /^(\d{1,2}):(\d{2})/.exec(String(raw).trim());
      if (!t) continue;
      const hh = Math.min(23, Number(t[1]));
      const mm = Math.min(59, Number(t[2]));
      const start = icsStamp(startDate, `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
      if (!start) continue;
      const endMin = Math.min(23 * 60 + 59, hh * 60 + mm + 15);
      const end = `${start.slice(0, 9)}${String(Math.floor(endMin / 60)).padStart(2, "0")}${String(
        endMin % 60,
      ).padStart(2, "0")}00`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:epilumina-lek-${m.id || name}-${hh}${mm}@epilumina.app`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push("RRULE:FREQ=DAILY");
      lines.push(`SUMMARY:${icsEscape(title)}`);
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:PT0M");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${icsEscape(title)}`);
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Pobiera .ics z lekami (cykliczne przypomnienia w kalendarzu telefonu). */
export function downloadMedsIcs(meds: IcsMed[], fileName = "epilumina-leki.ics") {
  const today = new Date();
  const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  const text = buildMedsIcs(meds, startDate);
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Próbuje udostępnić plik .ics systemowym oknem "Udostępnij" (na Androidzie
 * można wtedy wybrać Kalendarz i wydarzenie dopisze się od razu, bez
 * szukania pliku w Pobranych). Gdy przeglądarka tego nie umie — pobiera plik.
 * Zwraca "shared" albo "downloaded", żeby ekran mógł pokazać odpowiednią radę.
 */
export async function shareOrDownloadIcs(
  events: IcsEvent[],
  fileName = "epilumina-kalendarz.ics",
): Promise<"shared" | "downloaded"> {
  const text = buildIcs(events);
  try {
    const file = new File([text], fileName, { type: "text/calendar" });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: "Epilumina" });
      return "shared";
    }
  } catch {
    /* użytkownik anulował albo brak wsparcia — pobieramy plik */
  }
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}

/** To samo dla leków. */
export async function shareOrDownloadMedsIcs(
  meds: IcsMed[],
  fileName = "epilumina-leki.ics",
): Promise<"shared" | "downloaded"> {
  const today = new Date();
  const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  const text = buildMedsIcs(meds, startDate);
  try {
    const file = new File([text], fileName, { type: "text/calendar" });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: "Epilumina" });
      return "shared";
    }
  } catch {
    /* ignore */
  }
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}
