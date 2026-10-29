/* EPILUMINA — język strony landingowej ustalany NA SERWERZE.
 *
 * Po co: dotąd HTML zawsze leciał po polsku, a język przełączał się dopiero
 * po wykonaniu skryptu w przeglądarce. Efekt: mignięcie polskim u każdego,
 * kto ma inny język systemu.
 *
 * Teraz serwer czyta nagłówek Accept-Language i od razu renderuje stronę
 * w wybranym języku. Przeglądarka dostaje gotowy, poprawny HTML — nie ma
 * czego przełączać, więc nie ma mignięcia.
 *
 * Słownik pochodzi z `landing-i18n.ts` (ten sam, który jest w skrypcie
 * landing.html — zgodność pilnuje test).
 */
import { LANDING_TRANSLATIONS, LANDING_LANGS, type LandingLang } from "@/landing/landing-i18n";

/**
 * Wybiera język z nagłówka Accept-Language.
 * - brak nagłówka (np. robot Google) -> polski, bo to rynek podstawowy,
 * - nagłówek jest, ale żaden język nie pasuje -> angielski,
 * - respektuje kolejność i wagi (q=).
 */
export function detectLangFromHeader(header?: string | null): LandingLang {
  const raw = String(header || "").trim();
  if (!raw) return "pl";

  const parts = raw
    .split(",")
    .map((chunk) => {
      const [tag, ...params] = chunk.trim().split(";");
      let q = 1;
      for (const p of params) {
        const m = /^\s*q\s*=\s*([0-9.]+)\s*$/i.exec(p);
        if (m) q = Number(m[1]);
      }
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((p) => p.tag && p.tag !== "*")
    .sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    const base = tag.split("-")[0];
    if ((LANDING_LANGS as string[]).includes(base)) return base as LandingLang;
  }
  // nagłówek był, ale nie znamy żadnego z tych języków
  return "en";
}

function escapeText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(value: string) {
  return escapeText(value).replace(/"/g, "&quot;");
}

/**
 * Podmienia teksty w HTML strony na wybrany język.
 *
 * Obsługuje trzy atrybuty, których używa landing:
 *   data-i18n              -> tekst wewnątrz elementu
 *   data-i18n-html         -> HTML wewnątrz elementu (np. <em> w nagłówku)
 *   data-i18n-placeholder  -> atrybut placeholder
 *
 * Dla polskiego zwraca HTML bez zmian (polski jest źródłem treści).
 */
export function applyLandingLang(html: string, lang: LandingLang): string {
  if (!html || lang === "pl") return html;
  const dict = LANDING_TRANSLATIONS[lang];
  if (!dict) return html;

  let out = html;

  // 1) data-i18n-html — podmieniamy zawartość wraz ze znacznikami
  out = out.replace(
    /<(\w+)([^>]*\bdata-i18n-html="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (match, tag: string, attrs: string, key: string) => {
      const value = dict[key];
      if (value === undefined) return match;
      return `<${tag}${attrs}>${value}</${tag}>`;
    },
  );

  // 2) data-i18n — podmieniamy tylko tekst
  out = out.replace(
    /<(\w+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (match, tag: string, attrs: string, key: string) => {
      const value = dict[key];
      if (value === undefined) return match;
      return `<${tag}${attrs}>${escapeText(value)}</${tag}>`;
    },
  );

  // 3) data-i18n-placeholder — podmieniamy atrybut
  out = out.replace(/<[^>]*\bdata-i18n-placeholder="([^"]+)"[^>]*>/g, (tagStr, key: string) => {
    const value = dict[key];
    if (value === undefined) return tagStr;
    if (/placeholder="[^"]*"/.test(tagStr)) {
      return tagStr.replace(/placeholder="[^"]*"/, `placeholder="${escapeAttr(value)}"`);
    }
    return tagStr.replace(/>$/, ` placeholder="${escapeAttr(value)}">`);
  });

  return out;
}


/* ---------------- kraj odwiedzającego (bez zewnętrznych zapytań) ----------------
 * Vercel dokłada do każdego żądania nagłówek `x-vercel-ip-country`.
 * Dzięki temu znamy kraj BEZ wysyłania adresu IP do jakiegokolwiek serwisu.
 */

const COUNTRY_LANG: Record<string, LandingLang> = {
  // polski
  PL: "pl",
  // niemiecki
  DE: "de",
  AT: "de",
  LI: "de",
  // hiszpański
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", UY: "es",
  PY: "es", BO: "es", EC: "es", GT: "es", CR: "es", PA: "es", DO: "es", CU: "es",
  HN: "es", SV: "es", NI: "es", PR: "es",
  // francuski
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", CM: "fr", HT: "fr",
  // chiński
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  // angielski
  GB: "en", IE: "en", US: "en", CA: "en", AU: "en", NZ: "en", ZA: "en", IN: "en",
};

/** Język przypisany do kraju, albo null gdy kraj nie ma swojego języka. */
export function langFromCountry(country?: string | null): LandingLang | null {
  const code = String(country || "").trim().toUpperCase();
  if (!code || code.length !== 2) return null;
  return COUNTRY_LANG[code] ?? null;
}

/** Roboty wyszukiwarek: pokazujemy wersję podstawową (polską), żeby Google
 *  indeksowało spójną stronę, a nie zależną od lokalizacji serwerowni. */
export function isCrawler(userAgent?: string | null): boolean {
  return /googlebot|bingbot|yandex|duckduckbot|baiduspider|applebot|petalbot|ahrefs|semrush/i.test(
    String(userAgent || ""),
  );
}

/**
 * Wybór języka strony: kraj -> język przeglądarki -> angielski.
 * Gdy nie znamy nawet kraju (np. brak nagłówków), zostaje polski.
 */
export function pickLandingLang(input: {
  country?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
}): LandingLang {
  if (isCrawler(input.userAgent)) return "pl";

  const byCountry = langFromCountry(input.country);
  if (byCountry) return byCountry;

  const header = String(input.acceptLanguage || "").trim();
  if (header) return detectLangFromHeader(header);

  return "pl";
}

/** Opisy dla wyszukiwarek — muszą pasować do języka strony. */
export const META_DESCRIPTION: Record<LandingLang, string> = {
  pl: "Dziennik napadów, przypomnienia o lekach, raporty dla neurologa i wsparcie dietetyczne — wszystko w jednej, w pełni prywatnej aplikacji.",
  en: "Seizure diary, medication reminders, reports for your neurologist and diet support — all in one fully private app.",
  de: "Anfallstagebuch, Medikamenten-Erinnerungen, Berichte für den Neurologen und Ernährungsunterstützung — alles in einer vollständig privaten App.",
  es: "Diario de crisis, recordatorios de medicación, informes para el neurólogo y apoyo dietético: todo en una app totalmente privada.",
  fr: "Journal des crises, rappels de médicaments, rapports pour le neurologue et accompagnement diététique — tout dans une application entièrement privée.",
  zh: "发作日记、用药提醒、医生报告与饮食支持——全部集成在一个完全私密的应用中。",
};

export const OG_LOCALE: Record<LandingLang, string> = {
  pl: "pl_PL",
  en: "en_GB",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
};
