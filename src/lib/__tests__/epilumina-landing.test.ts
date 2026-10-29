import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LANDING_TRANSLATIONS, LANDING_LANGS } from "@/landing/landing-i18n";
import {
  META_DESCRIPTION,
  applyLandingLang,
  detectLangFromHeader,
  isCrawler,
  langFromCountry,
  pickLandingLang,
} from "@/lib/landing-ssr";

const htmlPath = resolve(process.cwd(), "src/landing/landing.html");
const raw = readFileSync(htmlPath, "utf8");
const bodyHtml = /<body>([\s\S]*?)<script>/.exec(raw)?.[1] ?? "";

/** Słownik zapisany w skrypcie strony — musi być ten sam co w TS. */
function inlineTranslations(): Record<string, Record<string, string>> {
  const start = raw.indexOf("const TRANSLATIONS = {");
  const end = raw.indexOf("\n  };", start);
  const literal = raw.slice(start + "const TRANSLATIONS = ".length, end + "\n  };".length - 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal});`)();
}

describe("detectLangFromHeader", () => {
  it("bierze język z nagłówka", () => {
    expect(detectLangFromHeader("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
    expect(detectLangFromHeader("pl-PL,pl;q=0.9")).toBe("pl");
    expect(detectLangFromHeader("zh-CN,zh;q=0.9")).toBe("zh");
    expect(detectLangFromHeader("fr-CA")).toBe("fr");
  });

  it("respektuje wagi q", () => {
    expect(detectLangFromHeader("en;q=0.5,de;q=0.9")).toBe("de");
  });

  it("bez nagłówka daje polski (rynek podstawowy)", () => {
    expect(detectLangFromHeader("")).toBe("pl");
    expect(detectLangFromHeader(undefined)).toBe("pl");
  });

  it("nieznany język -> angielski", () => {
    expect(detectLangFromHeader("it-IT,it;q=0.9")).toBe("en");
    expect(detectLangFromHeader("*")).toBe("en");
  });

  it("pomija nieobsługiwany pierwszy język", () => {
    expect(detectLangFromHeader("it-IT,pl-PL;q=0.8")).toBe("pl");
  });
});

describe("applyLandingLang", () => {
  it("dla polskiego nic nie zmienia", () => {
    expect(applyLandingLang(bodyHtml, "pl")).toBe(bodyHtml);
  });

  it("tłumaczy treść dla każdego języka", () => {
    for (const lang of LANDING_LANGS) {
      if (lang === "pl") continue;
      const out = applyLandingLang(bodyHtml, lang);
      const dict = LANDING_TRANSLATIONS[lang];
      // nagłówek hero (data-i18n-html) musi być przetłumaczony — z markupem
      expect(out).toContain(dict["hero.title"]);
    }
  });

  it("nie zostawia polskiego nagłówka w wersji niemieckiej", () => {
    const out = applyLandingLang(bodyHtml, "de");
    expect(out).not.toContain("Pomocne wsparcie w codziennym życiu");
    expect(out).toContain("Epilepsie-Tagebuch");
  });

  it("nie zmienia liczby elementów z data-i18n", () => {
    const count = (s: string) => (s.match(/data-i18n(=|-html=|-placeholder=)/g) || []).length;
    for (const lang of LANDING_LANGS) {
      expect(count(applyLandingLang(bodyHtml, lang))).toBe(count(bodyHtml));
    }
  });

  it("nie gubi polskich znaków ani encji w tłumaczeniu", () => {
    const out = applyLandingLang(bodyHtml, "de");
    expect(out).not.toContain("&amp;amp;");
    // tekst nie może zawierać surowych encji podwójnie zakodowanych
    expect(out.includes("&amp;lt;")).toBe(false);
  });

  it("podstawia placeholder, jeśli taki element istnieje", () => {
    const sample = '<input data-i18n-placeholder="hero.sub" placeholder="stary" />';
    const out = applyLandingLang(sample, "de");
    expect(out).toContain(`placeholder="${LANDING_TRANSLATIONS.de["hero.sub"]}"`);
  });
});

describe("zgodność słowników", () => {
  it("słownik w landing.html i w module TS są identyczne", () => {
    const inline = inlineTranslations();
    for (const lang of LANDING_LANGS) {
      expect(Object.keys(inline[lang]).sort()).toEqual(Object.keys(LANDING_TRANSLATIONS[lang]).sort());
      for (const key of Object.keys(inline[lang])) {
        expect(inline[lang][key]).toBe(LANDING_TRANSLATIONS[lang][key]);
      }
    }
  });
});

describe("język z kraju odwiedzającego", () => {
  it("mapuje kraje na języki", () => {
    expect(langFromCountry("DE")).toBe("de");
    expect(langFromCountry("PL")).toBe("pl");
    expect(langFromCountry("ES")).toBe("es");
    expect(langFromCountry("MX")).toBe("es");
    expect(langFromCountry("FR")).toBe("fr");
    expect(langFromCountry("CN")).toBe("zh");
    expect(langFromCountry("GB")).toBe("en");
  });

  it("kraj bez własnego języka daje null", () => {
    expect(langFromCountry("IT")).toBeNull();
    expect(langFromCountry("JP")).toBeNull();
    expect(langFromCountry("")).toBeNull();
  });

  it("kraj ma pierwszeństwo przed językiem przeglądarki", () => {
    expect(pickLandingLang({ country: "DE", acceptLanguage: "pl-PL" })).toBe("de");
    expect(pickLandingLang({ country: "PL", acceptLanguage: "en-GB" })).toBe("pl");
  });

  it("gdy kraj nieznany — decyduje język przeglądarki", () => {
    expect(pickLandingLang({ country: "IT", acceptLanguage: "pl-PL,pl;q=0.9" })).toBe("pl");
    expect(pickLandingLang({ country: "IT", acceptLanguage: "de-DE" })).toBe("de");
  });

  it("gdy nie ma nic — polski", () => {
    expect(pickLandingLang({})).toBe("pl");
  });

  it("robot dostaje polską wersję, żeby Google indeksowało spójną stronę", () => {
    expect(isCrawler("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(pickLandingLang({ country: "US", userAgent: "Googlebot/2.1" })).toBe("pl");
  });

  it("opis dla wyszukiwarek istnieje w każdym języku", () => {
    for (const lang of LANDING_LANGS) {
      expect(META_DESCRIPTION[lang].length).toBeGreaterThan(25);
    }
  });
});
