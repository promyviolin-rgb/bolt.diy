import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import LandingPage from "@/components/landing/LandingPage";
import { META_DESCRIPTION, OG_LOCALE, pickLandingLang } from "@/lib/landing-ssr";
import { LANDING_TRANSLATIONS } from "@/landing/landing-i18n";
import type { LandingLang } from "@/landing/landing-i18n";

/**
 * Język strony głównej ustalany na serwerze z nagłówka Accept-Language.
 * Dzięki temu pierwszy render jest już we właściwym języku — bez mignięcia.
 * `Vary` mówi cache'om, że odpowiedź zależy od języka przeglądarki.
 */
const getLandingLang = createServerFn({ method: "GET" }).handler(async () => {
  const country = getRequestHeader("x-vercel-ip-country") ?? getRequestHeader("cf-ipcountry") ?? "";
  const acceptLanguage = getRequestHeader("accept-language") ?? "";
  const userAgent = getRequestHeader("user-agent") ?? "";
  try {
    // Odpowiedź zależy od kraju i języka przeglądarki — cache musi o tym wiedzieć.
    setResponseHeader("Vary", "Accept-Language, X-Vercel-IP-Country");
  } catch {
    /* ignore */
  }
  return pickLandingLang({ country, acceptLanguage, userAgent });
});

/** Kanoniczny adres strony — musi wskazywać na JEDNO miejsce, żeby
 *  lovable.app i vercel.app nie konkurowały ze sobą w Google. */
const ORIGIN =
  (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.replace(/\/$/, "") ||
  "https://www.epilumina.app";

export const Route = createFileRoute("/")({
  head: ({ match }: any) => {
    // Ten sam język, w którym wyrenderowana jest strona — inaczej Google
    // indeksuje tytuł w jednym języku, a opis w drugim (tak było wcześniej).
    const lang = (match?.loaderData?.lang ?? "pl") as keyof typeof META_DESCRIPTION;
    // W chińskim tytule są znaczniki <em> — w <title> muszą zniknąć,
    // inaczej w Google widać "&lt;em&gt;" zamiast tekstu.
    const title = (
      LANDING_TRANSLATIONS[lang]?.pageTitle ?? LANDING_TRANSLATIONS.pl.pageTitle
    ).replace(/<[^>]+>/g, "");
    const description = META_DESCRIPTION[lang] ?? META_DESCRIPTION.pl;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: ORIGIN + "/" },
        { property: "og:site_name", content: "Epilumina" },
        { property: "og:locale", content: OG_LOCALE[lang] ?? "pl_PL" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: ORIGIN + "/" }],
    };
  },
  loader: async () => ({ lang: await getLandingLang() }),
  component: LandingRoute,
});

function LandingRoute() {
  const data = Route.useLoaderData() as { lang?: LandingLang };
  return <LandingPage lang={data?.lang ?? "pl"} />;
}
