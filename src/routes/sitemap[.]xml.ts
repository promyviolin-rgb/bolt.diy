import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Absolutny adres bazowy. Kolejność: własna domena z żądania -> zmienna
 * środowiskowa -> nowa domena. Dzięki temu stara zmienna VITE_APP_ORIGIN
 * (z czasów vercel.app) nie psuje adresów w sitemapie po podłączeniu domeny.
 */
function originOf(request: Request): string {
  let host = "";
  try {
    host = new URL(request.url).host;
  } catch {
    /* ignore */
  }
  if (host && !/\.vercel\.app$/i.test(host)) return `https://${host}`;
  const env = (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.replace(/\/$/, "");
  if (env && /^https:\/\//i.test(env)) return env;
  if (host) return `https://${host}`;
  return "https://www.epilumina.app";
}

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const BASE_URL = originOf(request);
        const entries: SitemapEntry[] = [{ path: "/", changefreq: "weekly", priority: "1.0" }];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
