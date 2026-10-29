/* EPILUMINA — wykres do raportu dla lekarza.
 *
 * Trzy warstwy, każda odpowiada na jedno pytanie:
 *   1. SŁUPKI  — w które dni były napady i jak ciężkie
 *                (zielony = łagodny, bursztynowy = umiarkowany, czerwony = silny)
 *   2. KLAMRY  — gdzie były dłuższe okresy BEZ napadów, z liczbą dni
 *   3. LINIA   — ketony w mmol/L, oś od zera do maksimum użytkownika (domyślnie do 8)
 *
 * Zakres grupuje się sam: do 92 dni liczymy dni, do 240 tygodnie, dłużej
 * miesiące — dzięki temu raport za pół roku nie zamienia się w las kresek.
 *
 * Czysty SVG w tekście: bez zależności i bez JavaScriptu, więc drukuje się
 * i zapisuje do PDF razem z resztą raportu. Daty liczone w UTC, żeby strefa
 * czasowa urządzenia nie przesuwała słupków o dzień.
 */

export type ChartEntry = { date?: string; time?: string; severity?: number };
export type ChartKeto = { date?: string; ketones?: number | string };

type Lang = "pl" | "en" | "de" | "es" | "fr" | "zh";
type Bucket = "day" | "week" | "month";

const LABELS: Record<
  Lang,
  {
    seizures: string;
    ketones: string;
    empty: string;
    perDay: string;
    perWeek: string;
    perMonth: string;
    free: string;
    unitDays: string;
    caption: string;
    scale: string;
    mild: string;
    moderate: string;
    severe: string;
    months: string[];
  }
> = {
  pl: {
    seizures: "Napady",
    ketones: "Ketony (mmol/L)",
    empty: "Brak danych do wykresu w wybranym okresie.",
    perDay: "słupki dziennie",
    perWeek: "słupki tygodniowo",
    perMonth: "słupki miesięcznie",
    free: "dni bez napadu",
    unitDays: "dni",
    caption:
      "Słupek = dzień z napadem, wysokość = liczba napadów, kolor = najcięższy epizod (zielony łagodny, bursztynowy umiarkowany, czerwony silny). Liczby pod osią to dni bez napadu — np. „12 dni” znaczy dwanaście dni z rzędu bez napadu. Pomarańczowa linia to ketony w mmol/L — im wyżej, tym wyższe stężenie.",
    scale: "skala",
    mild: "łagodny",
    moderate: "umiarkowany",
    severe: "silny",
    months: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
  },
  en: {
    seizures: "Seizures",
    ketones: "Ketones (mmol/L)",
    empty: "No data to plot for this period.",
    perDay: "daily bars",
    perWeek: "weekly bars",
    perMonth: "monthly bars",
    free: "days seizure-free",
    unitDays: "days",
    caption:
      "A bar is a day with a seizure: height = number of seizures, colour = the most severe one (green mild, amber moderate, red severe). The numbers under the axis are days without a seizure — e.g. “12 days” means twelve days in a row without one. The orange line is ketones in mmol/L — higher means a higher level.",
    scale: "scale",
    mild: "mild",
    moderate: "moderate",
    severe: "severe",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  de: {
    seizures: "Anfälle",
    ketones: "Ketone (mmol/L)",
    empty: "Keine Daten für diesen Zeitraum.",
    perDay: "Balken pro Tag",
    perWeek: "Balken pro Woche",
    perMonth: "Balken pro Monat",
    free: "Tage ohne Anfall",
    unitDays: "Tage",
    caption:
      "Ein Balken ist ein Tag mit Anfall: Höhe = Anzahl, Farbe = schwerster Anfall (grün leicht, bernstein mittel, rot schwer). Die Zahlen unter der Achse sind Tage ohne Anfall — z. B. „12 Tage” heißt zwölf Tage in Folge ohne Anfall. Die orange Linie sind die Ketone in mmol/L — höher bedeutet höherer Wert.",
    scale: "Skala",
    mild: "leicht",
    moderate: "mittel",
    severe: "schwer",
    months: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  },
  es: {
    seizures: "Crisis",
    ketones: "Cetonas (mmol/L)",
    empty: "Sin datos para este periodo.",
    perDay: "barras por día",
    perWeek: "barras por semana",
    perMonth: "barras por mes",
    free: "días sin crisis",
    unitDays: "días",
    caption:
      "Una barra es un día con crisis: altura = número de crisis, color = la más grave (verde leve, ámbar moderada, rojo grave). Los números bajo el eje son días sin crisis: p. ej. «12 días» significa doce días seguidos sin crisis. La línea naranja son las cetonas en mmol/L: más alta, mayor nivel.",
    scale: "escala",
    mild: "leve",
    moderate: "moderada",
    severe: "grave",
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  },
  fr: {
    seizures: "Crises",
    ketones: "Cétones (mmol/L)",
    empty: "Aucune donnée pour cette période.",
    perDay: "barres par jour",
    perWeek: "barres par semaine",
    perMonth: "barres par mois",
    free: "jours sans crise",
    unitDays: "jours",
    caption:
      "Une barre = un jour avec crise : hauteur = nombre de crises, couleur = la plus sévère (vert légère, ambre modérée, rouge sévère). Les nombres sous l’axe sont des jours sans crise — p. ex. « 12 jours » signifie douze jours consécutifs sans crise. La ligne orange représente les cétones en mmol/L : plus haut, taux plus élevé.",
    scale: "échelle",
    mild: "légère",
    moderate: "modérée",
    severe: "sévère",
    months: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
  },
  zh: {
    seizures: "发作",
    ketones: "酮体 (mmol/L)",
    empty: "所选时间段没有可绘制的数据。",
    perDay: "按天显示",
    perWeek: "按周显示",
    perMonth: "按月显示",
    free: "无发作天数",
    unitDays: "天",
    caption:
      "柱子代表有发作的日期：高度为发作次数，颜色为最严重的一次（绿色轻度、琥珀色中度、红色重度）。坐标轴下方的数字是无发作的天数——例如“12 天”表示连续 12 天没有发作。橙色线为酮体（mmol/L），越高表示浓度越高。",
    scale: "刻度",
    mild: "轻度",
    moderate: "中度",
    severe: "重度",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  },
};

const C = {
  bar: "#1B6B63",
  mild: "#7FB8A8",
  moderate: "#D9A24A",
  severe: "#C0392B",
  keto: "#C1701A",
  grid: "#E6ECE9",
  axis: "#8B9C96",
  band: "#F7FAF9",
  rule: "#D6E0DC",
  brace: "#9BB0AA",
};

const W = 700;
const H = 232;
const DAY = 86400000;
const KETO_DEFAULT_MAX = 8;

function dayMs(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(t) ? t : null;
}

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function dec(v: number) {
  return (Math.round(v * 10) / 10).toString().replace(".", ",");
}

function bucketStart(ms: number, mode: Bucket): number {
  const d = new Date(ms);
  if (mode === "day") return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  if (mode === "week") {
    const dow = (d.getUTCDay() + 6) % 7;
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow);
  }
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

function bucketEnd(ms: number, mode: Bucket): number {
  const d = new Date(ms);
  if (mode === "day") return ms + DAY;
  if (mode === "week") return ms + 7 * DAY;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

function barColor(severity: number) {
  if (severity >= 3) return C.severe;
  if (severity === 2) return C.moderate;
  if (severity === 1) return C.mild;
  return C.bar;
}

function tickLabel(ms: number, mode: Bucket, L: { months: string[] }, lang: string) {
  const d = new Date(ms);
  if (mode === "month") return L.months[d.getUTCMonth()];
  const dd = pad(d.getUTCDate());
  const mm = pad(d.getUTCMonth() + 1);
  return lang === "en" ? `${dd}/${mm}` : `${dd}.${mm}`;
}

/**
 * Fragment HTML z wykresem, legendą i objaśnieniem.
 * Gdy w okresie nie ma ani napadów, ani ketonów — zwraca krótki komunikat.
 */
export function seizureKetoChart(opts: {
  entries?: ChartEntry[];
  ketones?: ChartKeto[];
  from?: string;
  to?: string;
  lang?: string;
}): string {
  const lang = (LABELS[opts?.lang as Lang] ? opts.lang : "en") as Lang;
  const L = LABELS[lang];

  const to = dayMs(opts?.to);
  const from = dayMs(opts?.from);
  if (from === null || to === null || to <= from) return `<p class="empty">${esc(L.empty)}</p>`;

  const totalDays = Math.round((to - from) / DAY);
  const mode: Bucket = totalDays <= 92 ? "day" : totalDays <= 240 ? "week" : "month";

  /* --- napady w kubełkach --- */
  const buckets = new Map<number, { count: number; severity: number }>();
  for (const e of opts?.entries || []) {
    const t = dayMs(e?.date);
    if (t === null || t < from || t > to) continue;
    const b = bucketStart(t, mode);
    const cur = buckets.get(b) || { count: 0, severity: 0 };
    cur.count += 1;
    cur.severity = Math.max(cur.severity, Number(e?.severity) || 0);
    buckets.set(b, cur);
  }
  const bucketKeys = [...buckets.keys()].sort((a, b) => a - b);

  /* --- ketony: pojedyncze pomiary --- */
  const points: { t: number; v: number }[] = [];
  for (const r of opts?.ketones || []) {
    const t = dayMs(r?.date);
    const v = num(r?.ketones);
    if (t === null || v === null || t < from || t > to) continue;
    points.push({ t, v });
  }
  points.sort((a, b) => a.t - b.t);

  const hasSeizures = bucketKeys.length > 0;
  const hasKeto = points.length > 0;
  if (!hasSeizures && !hasKeto) return `<p class="empty">${esc(L.empty)}</p>`;

  const padL = hasSeizures ? 40 : 18;
  const padR = hasKeto ? 46 : 14;
  const padT = 14;
  const padB = 48;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;
  const spanY = plotH - 4;

  const x = (t: number) => padL + ((t - from) / (to - from)) * plotW;

  const maxCount = Math.max(1, ...bucketKeys.map((b) => buckets.get(b)!.count));
  const step = maxCount <= 3 ? 1 : Math.ceil(maxCount / 3);
  const yMax = step * Math.ceil(maxCount / step);
  const yBar = (n: number) => baseY - (n / yMax) * spanY;

  /* Oś ketonów: od zera do maksimum użytkownika (zaokrąglone w górę),
   * nie mniej niż 2. Przy typowych pomiarach pion jest na 8 mmol/L. */
  const maxKet = hasKeto ? Math.max(...points.map((p) => p.v)) : 0;
  // oś od 0 do maksimum użytkownika z zapasem; typowo kończy się na 8 mmol/L
  const ketWanted = Math.ceil(maxKet + 0.5);
  const ketTop = hasKeto
    ? maxKet > KETO_DEFAULT_MAX
      ? ketWanted
      : Math.max(2, Math.min(KETO_DEFAULT_MAX, ketWanted))
    : KETO_DEFAULT_MAX;
  const yKet = (v: number) => baseY - (Math.min(Math.max(v, 0), ketTop) / ketTop) * spanY;

  /* --- szerokość słupka --- */
  let slotCount = 0;
  for (let b = bucketStart(from, mode); b <= to; b = bucketEnd(b, mode)) slotCount++;
  const slotW = plotW / Math.max(1, slotCount);
  const barW = Math.max(3, Math.min(16, slotW * 0.62));

  const bars = bucketKeys
    .map((b) => {
      const info = buckets.get(b)!;
      const cx = x(b + (bucketEnd(b, mode) - b) / 2);
      const y = Math.min(yBar(info.count), baseY - 3);
      return `<rect class="bar" x="${(cx - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(
        1,
      )}" height="${Math.max(3, baseY - y).toFixed(1)}" rx="2" fill="${barColor(info.severity)}"/>`;
    })
    .join("");

  /* --- ketony: linia + punkty --- */
  let ketoLine = "";
  let ketoDots = "";
  if (hasKeto) {
    ketoLine = `<polyline points="${points
      .map((p) => `${x(p.t).toFixed(1)},${yKet(p.v).toFixed(1)}`)
      .join(" ")}" fill="none" stroke="${C.keto}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    ketoDots = points
      .map(
        (p) =>
          `<circle cx="${x(p.t).toFixed(1)}" cy="${yKet(p.v).toFixed(1)}" r="3" fill="#FFFFFF" stroke="${C.keto}" stroke-width="2"/>`,
      )
      .join("");
  }

  /* --- liczby dni bez napadu pod osią ---
   * Zamiast klamer (nachodziły na siebie i były nieczytelne) pokazujemy
   * SAMĄ LICZBĘ z krótką jednostką, np. "12 dni". Znaczenie liczby wyjaśnia
   * legenda i podpis pod wykresem. */
  const gapLabels: string[] = [];
  if (hasSeizures) {
    const marks = bucketKeys.map((b) => x(b + (bucketEnd(b, mode) - b) / 2));
    const edges = [padL, ...marks, padL + plotW];
    const gaps: { a: number; b: number; days: number }[] = [];
    for (let i = 0; i < edges.length - 1; i++) {
      const a = edges[i];
      const b = edges[i + 1];
      if (b - a < 34) continue;
      const days = Math.max(1, Math.round(((b - a) / plotW) * totalDays));
      gaps.push({ a, b, days });
    }

    const unit = lang === "zh" ? "" : " " + L.unitDays;
    const labelWidth = (days: number) => (String(days).length + unit.length) * 5.4 + 6;
    const candidates = gaps
      .filter((g) => g.b - g.a >= labelWidth(g.days))
      .sort((p, q) => q.b - q.a - (p.b - p.a));

    const chosen: { a: number; b: number; days: number }[] = [];
    for (const g of candidates) {
      if (chosen.length >= 6) break;
      const mid = (g.a + g.b) / 2;
      const clash = chosen.some((c) => {
        const cMid = (c.a + c.b) / 2;
        return Math.abs(cMid - mid) < (labelWidth(c.days) + labelWidth(g.days)) / 2 + 8;
      });
      if (clash) continue;
      chosen.push(g);
    }

    const labelY = baseY + 30;
    for (const g of chosen) {
      const mid = (g.a + g.b) / 2;
      gapLabels.push(
        `<text x="${mid.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${C.brace}">${g.days}${esc(unit)}</text>`,
      );
    }
  }

  /* --- siatka + osie --- */
  let grid = "";
  let leftTicks = "";
  if (hasSeizures) {
    for (let v = 0; v <= yMax + 0.001; v += step) {
      const y = yBar(v);
      grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${(padL + plotW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
      leftTicks += `<text x="${padL - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="${C.axis}">${Math.round(v)}</text>`;
    }
  }
  let rightTicks = "";
  if (hasKeto) {
    const ketMid = Math.round((ketTop / 2) * 10) / 10;
    for (const v of [0, ketMid, ketTop]) {
      const y = yKet(v);
      rightTicks += `<text x="${(padL + plotW + 8).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" font-size="9.5" fill="${C.keto}">${dec(v)}</text>`;
    }
  }

  /* --- etykiety czasu: równe tygodnie (poniedziałki) albo początki miesięcy --- */
  const tickTimes: number[] = [];
  if (mode === "month") {
    for (let b = bucketStart(from, "month"); b <= to; b = bucketEnd(b, "month")) {
      if (b >= from) tickTimes.push(b);
    }
  } else {
    for (let b = bucketStart(from, "week"); b <= to; b = bucketEnd(b, "week")) {
      if (b >= from && b <= to) tickTimes.push(b);
    }
  }
  const maxTicks = Math.max(2, Math.floor(plotW / 72));
  let every = 1;
  while (tickTimes.length / every > maxTicks) every += 1;
  const shownTicks = tickTimes.filter((_, i) => i % every === 0);

  let dateTicks = "";
  let vTicks = "";
  for (const t of shownTicks) {
    const cx = mode === "month" ? x(t + (bucketEnd(t, "month") - t) / 2) : x(t);
    vTicks += `<line x1="${cx.toFixed(1)}" y1="${padT}" x2="${cx.toFixed(1)}" y2="${baseY}" stroke="${C.grid}" stroke-width="1"/>`;
    dateTicks += `<text x="${cx.toFixed(1)}" y="${(baseY + 15).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${C.axis}">${tickLabel(t, mode, L, lang)}</text>`;
  }

  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" style="display:block;width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#FFFFFF"/>
  <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="${C.band}"/>
  ${vTicks}
  ${grid}
  <line x1="${padL}" y1="${baseY}" x2="${(padL + plotW).toFixed(1)}" y2="${baseY}" stroke="${C.rule}" stroke-width="1"/>
  ${bars}
  ${ketoLine}
  ${ketoDots}
  ${leftTicks}
  ${rightTicks}
  ${dateTicks}
  ${gapLabels.join("")}
</svg>`;

  const swatch = (color: string, label: string) =>
    `<span class="lg"><i style="background:${color}"></i>${esc(label)}</span>`;
  const lineChip = (color: string, label: string) =>
    `<span class="lg"><i style="background:${color};height:3px;border-radius:2px"></i>${esc(label)}</span>`;

  const unit = mode === "day" ? L.perDay : mode === "week" ? L.perWeek : L.perMonth;

  const legend = `<div class="legend">
    ${hasSeizures ? `<span class="lg"><i style="background:${C.bar}"></i>${esc(L.seizures)} — ${esc(unit)}</span>` : ""}
    ${hasSeizures ? swatch(C.mild, L.mild) : ""}
    ${hasSeizures ? swatch(C.moderate, L.moderate) : ""}
    ${hasSeizures ? swatch(C.severe, L.severe) : ""}
    ${hasKeto ? lineChip(C.keto, `${L.ketones} · ${L.scale} 0–${dec(ketTop)}`) : ""}
  </div>`;

  return `<figure class="chart">${svg}${legend}<figcaption>${esc(L.caption)}</figcaption></figure>`;
}
