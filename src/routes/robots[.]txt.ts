import { createFileRoute } from "@tanstack/react-router";

/**
 * robots.txt generowany dynamicznie — dzięki temu adres sitemapy zawsze
 * pasuje do domeny, na której stoi aplikacja (vercel.app, lovable.app albo
 * docelowa domena). Statyczny plik z public/ został usunięty.
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

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const origin = originOf(request);
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /app",
          "Disallow: /api/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
