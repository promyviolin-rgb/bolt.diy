import { useEffect, useMemo } from "react";
import rawHtml from "@/landing/landing.html?raw";
import QRCode from "qrcode";
import { applyLandingLang } from "@/lib/landing-ssr";
import type { LandingLang } from "@/landing/landing-i18n";

const styleCss = rawHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
const bodyHtml = rawHtml.match(/<body>([\s\S]*?)<script>/)?.[1] ?? "";
const scriptJs = rawHtml.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)?.[1] ?? "";

const wrappedScript = `(function(){
try{
${scriptJs}
Object.assign(window,{toggleMenu,toggleFaq,setCurrency,setLanguage,openModal,closeModal,closeModalOutside});
}catch(err){console.error("landing script",err);}
})();`;

export default function LandingPage({ lang = "pl" as LandingLang }: { lang?: LandingLang }) {
  // Serwer podał język — od razu renderujemy przetłumaczony HTML.
  // Dzięki temu nie ma mignięcia polskim przed przełączeniem.
  const translatedBody = useMemo(() => applyLandingLang(bodyHtml, lang), [lang]);

  useEffect(() => {
    // Skrypt landingu ma użyć języka wybranego przez serwer, zamiast
    // zgadywać jeszcze raz po stronie przeglądarki.
    (window as any).__EPI_LANG__ = lang;
    const el = document.createElement("script");
    el.type = "text/javascript";
    el.text = wrappedScript;
    document.body.appendChild(el);
    // QR code generated locally — no third-party request.
    const qr = document.getElementById("appQr") as HTMLImageElement | null;
    if (qr?.dataset.qr) {
      QRCode.toDataURL(qr.dataset.qr, {
        width: 240,
        margin: 0,
        color: { dark: "#1F2A28", light: "#FFFFFF" },
      })
        .then((url) => {
          qr.src = url;
        })
        .catch(() => {
          /* ignore */
        });
    }
    return () => {
      el.remove();
    };
  }, [lang]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleCss }} />
      <div dangerouslySetInnerHTML={{ __html: translatedBody }} />
    </>
  );
}
