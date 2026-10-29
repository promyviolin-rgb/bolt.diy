import { describe, expect, it } from "vitest";
import { seizureKetoChart } from "../epilumina-report-chart";
import { buildReportHtml } from "../epilumina-report-html";
import { buildIcs, buildMedsIcs } from "../epilumina-notify";

const base = { from: "2026-09-01", to: "2026-10-01", lang: "pl" };

const bars = (svg: string) => svg.match(/<rect class="bar"/g) || [];
const dots = (svg: string) => svg.match(/<circle /g) || [];
const lines = (svg: string) => svg.match(/<polyline /g) || [];
const gapLabels = (svg: string) => svg.match(/<text[^>]*>\d+\s?(dni|days|Tage|días|jours|天)</g) || [];

function coords(svg: string): number[] {
  return [...svg.matchAll(/(?:x|y|cx|cy|x1|x2|y1|y2)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
}

describe("seizureKetoChart — słupki napadów", () => {
  it("zwraca komunikat, gdy nie ma poprawnego zakresu", () => {
    expect(seizureKetoChart({ entries: [], ketones: [], lang: "pl" })).toContain('class="empty"');
    expect(seizureKetoChart({ ...base, from: "2026-10-01", to: "2026-09-01" })).toContain('class="empty"');
  });

  it("mówi wprost, gdy w okresie nie ma danych", () => {
    const out = seizureKetoChart({ ...base, entries: [], ketones: [] });
    expect(out).toContain("Brak danych do wykresu");
    expect(out).not.toContain("<svg");
  });

  it("rysuje jeden słupek na dzień i scala epizody z tego samego dnia", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [
        { date: "2026-09-10", severity: 1 },
        { date: "2026-09-10", severity: 3 },
        { date: "2026-09-20", severity: 2 },
      ],
    });
    expect(bars(out)).toHaveLength(2);
  });

  it("koloruje słupek najcięższym epizodem dnia", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [
        { date: "2026-09-10", severity: 1 },
        { date: "2026-09-10", severity: 3 },
      ],
    });
    expect(out).toContain("#C0392B");
    expect(out.match(/fill="#7FB8A8"/g)).toBeNull();
  });

  it("używa trzech kolorów nasilenia", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [
        { date: "2026-09-05", severity: 1 },
        { date: "2026-09-10", severity: 2 },
        { date: "2026-09-20", severity: 3 },
      ],
    });
    expect(out).toContain("#7FB8A8");
    expect(out).toContain("#D9A24A");
    expect(out).toContain("#C0392B");
    expect(bars(out)).toHaveLength(3);
  });

  it("grupuje długie zakresy w miesiące", () => {
    const out = seizureKetoChart({
      entries: [{ date: "2026-07-15" }, { date: "2026-08-15" }],
      from: "2026-01-01",
      to: "2026-12-31",
      lang: "pl",
    });
    expect(out).toContain("słupki miesięcznie");
  });
});

describe("seizureKetoChart — klamry dni bez napadów", () => {
  it("pokazuje liczbę dni bez napadu zamiast klamry", () => {
    const out = seizureKetoChart({ ...base, entries: [{ date: "2026-09-03" }, { date: "2026-09-28" }] });
    expect(gapLabels(out).length).toBeGreaterThan(0);
    expect(out).not.toContain('<path d="M');
  });

  it("nie pokazuje liczb, gdy napady są codziennie", () => {
    const daily = [];
    for (let d = 1; d <= 30; d++) daily.push({ date: `2026-09-${String(d).padStart(2, "0")}` });
    const out = seizureKetoChart({ ...base, entries: daily });
    expect(gapLabels(out)).toHaveLength(0);
  });

  it("podaje liczbę dni bez napadu", () => {
    const out = seizureKetoChart({
      from: "2026-09-01",
      to: "2026-10-01",
      lang: "pl",
      entries: [{ date: "2026-09-02" }, { date: "2026-09-30" }],
    });
    expect(out).toMatch(/<text[^>]*>\d+ dni<\/text>/);
  });
});

describe("seizureKetoChart — ketony", () => {
  it("rysuje punkt na każdy pomiar, chronologicznie", () => {
    const out = seizureKetoChart({
      ...base,
      ketones: [
        { date: "2026-09-20", ketones: "3,5" },
        { date: "2026-09-05", ketones: 2 },
      ],
    });
    expect(dots(out)).toHaveLength(2);
    const xs = [...out.matchAll(/<circle cx="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(xs[0]).toBeLessThan(xs[1]);
  });

  it("oś zaczyna się od zera i ma zapas nad maksimum pomiaru", () => {
    const out = seizureKetoChart({
      ...base,
      ketones: [
        { date: "2026-09-05", ketones: 2 },
        { date: "2026-09-25", ketones: 4 },
      ],
    });
    expect(out).toContain("skala 0–5");
  });

  it("nie ścina osi poniżej 2 mmol/L", () => {
    const out = seizureKetoChart({ ...base, ketones: [{ date: "2026-09-05", ketones: 0.8 }] });
    expect(out).toContain("skala 0–2");
  });

  it("pozwala wyjść powyżej 8 mmol/L, gdy pomiary są wyższe", () => {
    const out = seizureKetoChart({ ...base, ketones: [{ date: "2026-09-05", ketones: 9.4 }] });
    expect(out).toContain("skala 0–10");
  });

  it("pomija pomiary poza okresem", () => {
    const out = seizureKetoChart({ ...base, ketones: [{ date: "2026-12-31", ketones: 4 }] });
    expect(out).toContain("Brak danych do wykresu");
  });

  it("rysuje osobną linię dla ketonów", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [{ date: "2026-09-10" }],
      ketones: [
        { date: "2026-09-05", ketones: 2 },
        { date: "2026-09-25", ketones: 4 },
      ],
    });
    expect(lines(out)).toHaveLength(1);
  });
});

describe("seizureKetoChart — jakość rysunku", () => {
  it("nie wypuszcza NaN ani Infinity do współrzędnych", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [
        { date: "2026-09-02", severity: 2 },
        { date: "2026-09-02" },
        { date: "2026-09-30", severity: 3 },
      ],
      ketones: [{ date: "2026-09-11", ketones: "4.2" }],
    });
    const nums = coords(out);
    expect(nums.length).toBeGreaterThan(10);
    for (const n of nums) expect(Number.isFinite(n)).toBe(true);
  });

  it("trzyma wszystkie punkty w obszarze rysunku", () => {
    const out = seizureKetoChart({
      ...base,
      entries: [{ date: "2026-09-01" }, { date: "2026-10-01" }],
      ketones: [{ date: "2026-10-01", ketones: 6 }],
    });
    for (const n of coords(out)) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(700);
    }
  });

  it("pokazuje legendę tylko dla danych, które istnieją", () => {
    const onlySeizures = seizureKetoChart({ ...base, entries: [{ date: "2026-09-05" }] });
    expect(onlySeizures).toContain("łagodny");
    expect(onlySeizures).not.toContain("Ketony (mmol/L)");
    const onlyKeto = seizureKetoChart({ ...base, ketones: [{ date: "2026-09-05", ketones: 3 }] });
    expect(onlyKeto).toContain("Ketony (mmol/L)");
    expect(bars(onlyKeto)).toHaveLength(0);
  });

  it("tłumaczy legendę i podpis", () => {
    const de = seizureKetoChart({ ...base, lang: "de", entries: [{ date: "2026-09-05" }] });
    expect(de).toContain("Anfälle");
    expect(de).toContain("Tage ohne Anfall");
    expect(seizureKetoChart({ ...base, lang: "xx", entries: [{ date: "2026-09-05" }] })).toContain("Seizures");
  });

  it("daty na osi idą tygodniami", () => {
    const out = seizureKetoChart({
      from: "2026-09-01",
      to: "2026-10-23",
      lang: "pl",
      entries: [{ date: "2026-09-05" }],
    });
    expect(out).toContain(">07.09<");
    expect(out).toContain(">14.09<");
  });
});

describe("buildReportHtml", () => {
  const input = (over: any = {}) => ({
    lang: "pl",
    patientName: "Jaś",
    now: "23 października 2026, 16:45",
    dateFrom: "2026-09-01",
    dateTo: "2026-10-23",
    today: "2026-10-23",
    entries: [
      { date: "2026-09-03", time: "10:00", severity: 3, duration: "30 s", typeKey: "other" },
      { date: "2026-10-12", time: "11:00", severity: 2, duration: "15 s", typeKey: "focal", notes: "po kąpieli" },
    ],
    keto: [{ date: "2026-09-05", ketones: 2, glucose: 80 }],
    journal: [],
    sections: {},
    t: (k: string) => k.split(".").pop() || k,
    formatDate: (d: string) => d,
    ...over,
  });

  it("buduje kompletny dokument z blokami do paginacji", () => {
    const html = buildReportHtml(input());
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('class="blk head"');
    expect(html.match(/class="blk/g)!.length).toBeGreaterThanOrEqual(5);
    expect(html).toContain("Raport dla lekarza");
    expect(html).toContain("Jaś");
  });

  it("liczy podsumowanie: napady, dni bez napadu, średni czas, ketony", () => {
    const html = buildReportHtml(input());
    expect(html).toContain("<b>1</b>");
    expect(html).toContain("23 s");
    expect(html).toContain("2,0");
  });

  it("dni bez napadu liczy od ostatniego wpisu do dziś", () => {
    expect(buildReportHtml(input())).toContain(">11<");
  });

  it("pokazuje pusty stan zamiast pustej tabeli", () => {
    const html = buildReportHtml(input({ entries: [], keto: [] }));
    expect(html).toContain("Brak wpisów w tym okresie.");
    expect(html).toContain("Brak pomiarów ketonów");
    expect(html).not.toContain("<table>");
  });

  it("respektuje wyłączone sekcje", () => {
    const html = buildReportHtml(input({ sections: { log: false, keto: false, types: false } }));
    expect(html).not.toContain("Pełny dziennik napadów");
    expect(html).not.toContain("Dieta ketogenna");
    expect(html).not.toContain("Rodzaje napadów");
    expect(html).toContain("Napady i ketony w czasie");
  });

  it("dodaje zestawienie miesięczne tylko przy długim okresie", () => {
    const long = buildReportHtml(
      input({
        dateFrom: "2026-05-01",
        dateTo: "2026-11-01",
        entries: [
          { date: "2026-05-10", severity: 3 },
          { date: "2026-05-20", severity: 1 },
          { date: "2026-06-02", severity: 2 },
          { date: "2026-10-12", severity: 1 },
        ],
      }),
    );
    expect(long).toContain("Podsumowanie miesięczne");
    expect(long).toContain("maj 2026");
    expect(long).toContain("październik 2026");
    expect(buildReportHtml(input())).not.toContain("Podsumowanie miesięczne");
  });

  it("liczy napady i średnie ketony w miesiącu", () => {
    const html = buildReportHtml(
      input({
        dateFrom: "2026-05-01",
        dateTo: "2026-11-01",
        entries: [
          { date: "2026-05-10", severity: 3 },
          { date: "2026-05-20", severity: 3 },
          { date: "2026-05-25", severity: 1 },
        ],
        keto: [
          { date: "2026-05-05", ketones: 2 },
          { date: "2026-05-15", ketones: 4 },
        ],
      }),
    );
    expect(html).toContain("<b>3</b>");
    expect(html).toContain("<td>2</td>");
    expect(html).toContain("<td>3,0</td>");
  });

  it("ucieka HTML z danych użytkownika", () => {
    const html = buildReportHtml(
      input({ patientName: '<img src=x onerror=alert(1)>', entries: [{ date: "2026-10-12", notes: "<b>x</b>" }] }),
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });

  it("ma etykiety w każdym z sześciu języków", () => {
    for (const lang of ["pl", "en", "de", "es", "fr", "zh"]) {
      const html = buildReportHtml(input({ lang }));
      expect(html).toContain('lang="' + lang + '"');
      expect(html).toContain('class="kpi"');
    }
  });
});

describe("buildIcs — eksport przypomnień do kalendarza telefonu", () => {
  const ev = {
    id: "ev1",
    date: "2026-11-02",
    time: "09:30",
    name: "Wizyta u neurologa",
    place: "Poradnia",
    remind: true,
    remindTime: "08:00",
  };

  it("tworzy poprawny plik VCALENDAR", () => {
    const ics = buildIcs([ev], Date.UTC(2026, 10, 1, 12, 0));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20261102T093000");
    expect(ics).toContain("DTEND:20261102T103000");
    expect(ics).toContain("SUMMARY:Wizyta u neurologa");
    expect(ics).toContain("Miejsce: Poradnia");
  });

  it("dokłada VALARM z właściwym wyprzedzeniem", () => {
    const ics = buildIcs([ev], Date.UTC(2026, 10, 1, 12, 0));
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT90M");
    expect(ics).toContain("ACTION:DISPLAY");
  });

  it("bez przypomnienia nie ma VALARM", () => {
    const ics = buildIcs([{ ...ev, remind: false }]);
    expect(ics).not.toContain("BEGIN:VALARM");
    expect(ics).toContain("BEGIN:VEVENT");
  });

  it("ucieka przecinki, średniki i nowe linie", () => {
    const ics = buildIcs([{ ...ev, name: "Wizyta; badanie, EEG\nna czczo" }]);
    expect(ics).toContain("SUMMARY:Wizyta\\; badanie\\, EEG\\nna czczo");
  });

  it("pomija wydarzenia bez daty albo nazwy", () => {
    const ics = buildIcs([{ date: "", name: "x" }, { date: "2026-11-02", name: "" }, ev]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it("tworzy cykliczne wpisy leków z alarmem", () => {
    const ics = buildMedsIcs(
      [{ id: "m1", name: "Depakine", dose: "200 mg", times: ["08:00", "20:00"] }],
      "2026-11-02",
      Date.UTC(2026, 10, 1, 12, 0),
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("RRULE:FREQ=DAILY");
    expect(ics).toContain("DTSTART:20261102T080000");
    expect(ics).toContain("DTSTART:20261102T200000");
    expect(ics).toContain("SUMMARY:Depakine — 200 mg");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(ics).toContain("TRIGGER:PT0M");
  });

  it("pomija leki bez nazwy albo bez godzin", () => {
    const ics = buildMedsIcs(
      [
        { id: "a", name: "", times: ["08:00"] },
        { id: "b", name: "Lek", times: [] },
        { id: "c", name: "Lek", times: ["nie"] },
        { id: "d", name: "Lek", times: ["09:00"] },
      ],
      "2026-11-02",
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it("pusty kalendarz zostaje poprawnym plikiem", () => {
    const ics = buildIcs([]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
