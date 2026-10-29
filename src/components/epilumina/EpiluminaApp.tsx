/* eslint-disable */
/* EPILUMINA — pełna aplikacja MVP (100% on-device, dane w localStorage) */
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  BookOpen,
  Plus,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Edit3,
  Trash2,
  Zap,
  Crown,
  FileText,
  Heart,
  Lock,
  Sparkles,
  ScanLine,
  CreditCard,
  Upload,
  Phone,
  MapPin,
  Settings as SettingsIcon,
  Eye,
  Download,
  Salad,
} from "lucide-react";
import JSZip from "jszip";
import { LANGS, translations, useT } from "@/lib/epilumina-i18n";

/** Języki, które naprawdę mamy w aplikacji (kolejność jak w przełączniku). */
const SUPPORTED_UI_LANGS = ["pl", "en", "de", "es", "fr", "zh"];

/**
 * Język interfejsu z preferencji przeglądarki/telefonu.
 * Bierzemy pierwszą obsługiwaną pozycję z navigator.languages, a gdy żadna
 * nie pasuje — angielski. Nie pytamy o kraj przez IP: to wymagałoby
 * zewnętrznego serwera, a język systemu jest lepszym i prywatnym wskaźnikiem.
 */
function detectUiLang(): string | null {
  try {
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (!nav) return null;
    const list: string[] =
      nav.languages && nav.languages.length ? [...nav.languages] : [nav.language || ""];
    for (const raw of list) {
      const base = String(raw || "")
        .toLowerCase()
        .split("-")[0];
      if (SUPPORTED_UI_LANGS.includes(base)) return base;
    }
    return "en";
  } catch {
    return null;
  }
}
import { useCommonT } from "@/lib/epilumina-common-i18n";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  REGION_NUMBERS,
  detectRegionFromCoords,
  detectRegionFromLocale,
} from "@/lib/epilumina-regions";
import { extractPdf } from "@/lib/epilumina-pdf-parse";
import { useProfiles, pkey, DEFAULT_PROFILE } from "@/lib/epilumina-profiles";
import KetoScreen from "./KetoScreen";
import MedicalCalendar from "./MedicalCalendar";
import { PinLockScreen, PinSettingsCard } from "./PinLock";
import { useExtraT } from "@/lib/epilumina-extra-i18n";
import { useIdbDocuments } from "@/lib/epilumina-idb";
import { useLicense, openBillingPortal } from "@/lib/epilumina-license";
import { isUpcoming } from "@/lib/epilumina-calendar";
import { buildReportHtml as buildReportHtmlDoc } from "@/lib/epilumina-report-html";
import {
  shareOrDownloadMedsIcs,
  firedSet,
  markFired,
  showLocalNotification,
} from "@/lib/epilumina-notify";
import PremiumRecovery from "./PremiumRecovery";
import {
  buildFullBackup,
  downloadBlob,
  downloadFullBackupJson,
  restoreFullBackup,
} from "@/lib/epilumina-backup";

// Media-query hook — used to switch to a sidebar layout on tablet/desktop (>=768px).
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return isDesktop;
}

// Simple ErrorBoundary — shows Emergency Recovery View with direct data download.
// It NEVER touches or clears localStorage: all medical data stays on the device.
const ERR_TXT = {
  pl: [
    "Wystąpił błąd wyświetlania",
    "Twoje dane medyczne są nienaruszone w pamięci urządzenia. Możesz odświeżyć aplikację lub najpierw pobrać pełną kopię zapasową.",
    "Odśwież aplikację",
    "Pobierz pełną kopię zapasową",
    "Kopia zapasowa została pobrana.",
  ],
  en: [
    "Something went wrong while displaying",
    "Your medical data is untouched in your device's memory. You can refresh the app or first download a full backup.",
    "Refresh the app",
    "Download full backup",
    "Backup downloaded.",
  ],
  de: [
    "Beim Anzeigen ist ein Fehler aufgetreten",
    "Deine medizinischen Daten sind im Gerätespeicher unversehrt. Du kannst die App neu laden oder zuerst eine vollständige Sicherung herunterladen.",
    "App neu laden",
    "Vollständige Sicherung herunterladen",
    "Sicherung heruntergeladen.",
  ],
  es: [
    "Se produjo un error al mostrar la app",
    "Tus datos médicos siguen intactos en la memoria del dispositivo. Puedes recargar la app o descargar antes una copia completa.",
    "Recargar la app",
    "Descargar copia completa",
    "Copia descargada.",
  ],
  fr: [
    "Une erreur d'affichage s'est produite",
    "Vos données médicales sont intactes dans la mémoire de l'appareil. Vous pouvez actualiser l'application ou d'abord télécharger une sauvegarde complète.",
    "Actualiser l'application",
    "Télécharger la sauvegarde complète",
    "Sauvegarde téléchargée.",
  ],
  zh: [
    "显示时出现错误",
    "您的医疗数据完好地保存在设备中。您可以刷新应用，或先下载完整备份。",
    "刷新应用",
    "下载完整备份",
    "备份已下载。",
  ],
};
function errTxt() {
  try {
    const l = JSON.parse(window.localStorage.getItem("epilumina.lang") || '"pl"');
    return (ERR_TXT as any)[l] || ERR_TXT.pl;
  } catch {
    return ERR_TXT.pl;
  }
}

class EpiluminaErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, saved: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any) {
    try {
      console.error("[Epilumina]", error);
    } catch {
      /* ignore */
    }
  }
  async dump() {
    try {
      await downloadFullBackupJson("epilumina-kopia-awaryjna");
      this.setState({ saved: true });
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    const T = errTxt();
    return (
      <div
        className="epi-minh"
        style={{
          background: "#EFF3F1",
          padding: 24,
          fontFamily: "'Lexend', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#fff",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 8px 24px rgba(20,30,28,0.15)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#F3DEE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} color="#A6416B" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  margin: 0,
                  color: "#24312E",
                }}
              >
                {T[0]}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#5C6E68", lineHeight: 1.55 }}>
                {T[1]}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => {
                try {
                  window.location.reload();
                } catch {
                  /* ignore */
                }
              }}
              style={{
                background: "#1B6B63",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: 13,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {T[2]}
            </button>
            <button
              onClick={() => this.dump()}
              style={{
                background: "#B8863B",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: 13,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Download size={14} /> {T[3]}
            </button>
            {this.state.saved && (
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: "#1B6B63",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {T[4]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/* ================= DATA ================= */
const seedDocs = [];

const TYPE_KEYS = [
  "tonicClonic",
  "focal",
  "absence",
  "myoclonic",
  "atonic",
  "clonic",
  "partial",
  "other",
];
const SYMPTOM_KEYS = [
  "lossConsciousness",
  "stiffBody",
  "convulsions",
  "blankStare",
  "disorientation",
  "limbTremor",
  "tongueBiting",
  "incontinence",
];
const TRIGGER_KEYS = [
  "sleepDeprivation",
  "fever",
  "infection",
  "stress",
  "flashingLights",
  "missedMed",
  "unknown",
];

const severityColorMap = { 1: "#4C8C7A", 2: "#C08A2E", 3: "#A6416B" };
const severityColor = new Proxy(severityColorMap, { get: (o, k) => (o as any)[k] ?? "#8B9C96" });
const GOLD = "#B8863B";
const LIMITS = { name: 80, short: 120, long: 800, duration: 40 };
const clamp = (s: string | any[], n: number | undefined) =>
  typeof s === "string" ? s.slice(0, n) : "";

function fillTemplate(str: string, values: any) {
  if (!str) return "";
  return Object.entries(values).reduce(
    (acc, [key, val]) => acc.split(`{${key}}`).join(String(val)),
    str,
  );
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function daysSince(dateStr: string) {
  return Math.floor(
    (new Date(todayISO() + "T00:00:00").getTime() - new Date(dateStr + "T00:00:00").getTime()) /
      86400000,
  );
}
const LOCALE_MAP = { pl: "pl-PL", en: "en-GB", de: "de-DE", zh: "zh-CN", es: "es-ES", fr: "fr-FR" };
function formatDate(dateStr: string, lang: string | number) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString((LOCALE_MAP as any)[lang] || "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function formatDateShort(dateStr: string, lang: string | number) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString((LOCALE_MAP as any)[lang] || "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function inRange(dateStr: number, from: number, to: number) {
  if (!dateStr) return false;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}
const humanSize = (b: number | null) =>
  b == null
    ? ""
    : b > 1024 * 1024
      ? (b / 1024 / 1024).toFixed(1) + " MB"
      : Math.max(1, Math.round(b / 1024)) + " KB";

/* ================= SHARED UI ================= */
function TopBar({ title, onBack, action }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 20px 14px",
      }}
    >
      <div style={{ width: 32 }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "none",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(36,49,46,0.08)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} color="#24312E" />
          </button>
        )}
      </div>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 19,
          fontWeight: 600,
          color: "#24312E",
          margin: 0,
        }}
      >
        {title}
      </h1>
      <div style={{ width: 32, display: "flex", justifyContent: "flex-end" }}>{action}</div>
    </div>
  );
}

function Pill_({ children, tone = "neutral" }: any) {
  const tones = {
    neutral: { bg: "#E4EAE7", fg: "#3A4A45" },
    teal: { bg: "#DCEEEA", fg: "#1B6B63" },
    berry: { bg: "#F3DEE7", fg: "#A6416B" },
    gold: { bg: "#F3E8D3", fg: GOLD },
  };
  const t = (tones as any)[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: 11.5,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

function LangSwitcher({ lang, onChange }: any) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[1];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "none",
          background: "#FFFFFF",
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(36,49,46,0.08)",
        }}
      >
        {current.flag}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            background: "#FFFFFF",
            borderRadius: 14,
            boxShadow: "0 8px 20px rgba(36,49,46,0.15)",
            padding: 6,
            zIndex: 50,
            width: 130,
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                onChange(l.code);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                background: l.code === lang ? "#EFF3F1" : "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#24312E",
              }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StreakRing({ days, label }: any) {
  const pct = Math.min(days / 30, 1);
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
      <svg width={116} height={116}>
        <circle cx={58} cy={58} r={r} fill="none" stroke="#DCE5E1" strokeWidth={10} />
        <circle
          cx={58}
          cy={58}
          r={r}
          fill="none"
          stroke="#1B6B63"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - pct * c}
          transform="rotate(-90 58 58)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#1B6B63",
            lineHeight: 1,
          }}
        >
          {days}
        </span>
        <span
          style={{
            fontSize: 9.5,
            color: "#5C6E68",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 70,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* ================= BOTTOM NAV ================= */
function BottomNav({ current, onNavigate, t, isPremium }: any) {
  const items = [
    { key: "dashboard", icon: Home, label: t("nav.home") },
    { key: "log", icon: BookOpen, label: t("nav.log") },
    { key: "diet", icon: Salad, label: t("nav.diet"), crown: !isPremium },
    { key: "stats", icon: BarChart3, label: t("nav.stats") },
    { key: "forYou", icon: Heart, label: t("nav.forYou") },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "8px 6px 16px",
        background: "#FFFFFF",
        borderTop: "1px solid #E1E7E4",
        flexShrink: 0,
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = current === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onNavigate(it.key)}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              color: active ? "#1B6B63" : "#8B9C96",
              padding: 3,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Icon
              size={18}
              strokeWidth={active ? 2.4 : 2}
              fill={it.key === "forYou" && active ? "#1B6B63" : "none"}
            />
            {it.crown && (
              <Crown
                size={9}
                color={GOLD}
                fill={GOLD}
                style={{ position: "absolute", top: 0, right: "50%", marginRight: -16 }}
              />
            )}
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PremiumCrownButton({ onClick, isPremium }: any) {
  return (
    <button
      onClick={onClick}
      aria-label="Premium toggle"
      aria-pressed={isPremium}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: isPremium ? `1.5px solid ${GOLD}` : "none",
        background: isPremium ? GOLD : "#F3E8D3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: isPremium ? "0 2px 8px rgba(184,134,59,0.4)" : "0 1px 2px rgba(36,49,46,0.08)",
        position: "relative",
      }}
    >
      <Crown size={16} color={isPremium ? "#fff" : GOLD} fill={isPremium ? "#fff" : GOLD} />
      {isPremium && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#1B6B63",
            border: "2px solid #EFF3F1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={7} color="#fff" strokeWidth={4} />
        </span>
      )}
    </button>
  );
}

function SettingsButton({ onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "none",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(36,49,46,0.08)",
      }}
    >
      <SettingsIcon size={16} color="#24312E" />
    </button>
  );
}

const primaryGoldBtn = {
  background: GOLD,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "13px",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
};
const inputStyle: any = {
  width: "100%",
  border: "1px solid #DCE5E1",
  background: "#FFFFFF",
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 13,
  color: "#24312E",
  boxSizing: "border-box",
  outline: "none",
};
const primaryBtn = {
  flex: 1,
  background: "#1B6B63",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "13px",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
};
const secondaryBtn = {
  flex: 1,
  background: "#FFFFFF",
  color: "#5C6E68",
  border: "1px solid #DCE5E1",
  borderRadius: 14,
  padding: "13px",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
};

function PremiumLock({ title, desc, ctaLabel, onOpenPremium }: any) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 20,
        background: "rgba(239,243,241,0.55)",
        borderRadius: 18,
        backdropFilter: "blur(1px)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          background: "#F3E8D3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          boxShadow: "0 4px 10px rgba(184,134,59,0.25)",
        }}
      >
        <Lock size={19} color={GOLD} />
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#24312E" }}>{title}</p>
      <p style={{ margin: "4px 0 12px", fontSize: 11.5, color: "#5C6E68", maxWidth: 240 }}>
        {desc}
      </p>
      <button
        onClick={onOpenPremium}
        style={{ ...primaryGoldBtn, padding: "9px 16px", fontSize: 12 }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, desc, isPremium, onIconClick, iconHint }: any) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
      <div
        onClick={onIconClick}
        title={iconHint}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: isPremium ? "#F3E8D3" : "#EFF3F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: onIconClick ? "pointer" : "default",
        }}
      >
        <Icon size={17} color={isPremium ? GOLD : "#8B9C96"} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#24312E" }}>{title}</h3>
          <Pill_ tone="gold">PREMIUM</Pill_>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.4 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ================= MODALS: Terms, Quota, Lightbox ================= */
function ModalShell({ children, onClose, wide }: any) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,30,28,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 22,
          padding: 22,
          maxWidth: wide ? 720 : 420,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(20,30,28,0.4)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TermsModal({ tc, onAccept, onImport }: any) {
  const fileRef = React.useRef<any>(null);
  return (
    <ModalShell>
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 20,
          margin: "0 0 6px",
          color: "#24312E",
        }}
      >
        {tc("terms.title")}
      </h2>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#5C6E68" }}>{tc("terms.intro")}</p>
      <div
        style={{
          background: "#EFF3F1",
          borderRadius: 14,
          padding: 14,
          fontSize: 12.5,
          color: "#3A4A45",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          maxHeight: "44vh",
          overflowY: "auto",
        }}
      >
        {tc("terms.body")}
      </div>
      <button onClick={onAccept} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>
        <Check size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
        {tc("terms.accept")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.zip,application/json,application/zip"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onImport) onImport(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          width: "100%",
          marginTop: 10,
          background: "transparent",
          border: "1px solid #CBD9D4",
          borderRadius: 14,
          padding: 11,
          fontSize: 12.5,
          fontWeight: 600,
          color: "#1B6B63",
          cursor: "pointer",
        }}
      >
        <Upload size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
        {tc("settings.importBackup")}
      </button>
    </ModalShell>
  );
}

function QuotaModal({ tc, onClose }: any) {
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "#F3DEE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} color="#A6416B" />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{ fontFamily: "'Fraunces', serif", fontSize: 18, margin: 0, color: "#24312E" }}
          >
            {tc("quota.title")}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tc("quota.body")}
          </p>
        </div>
      </div>
      <button onClick={onClose} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>
        {tc("quota.ok")}
      </button>
    </ModalShell>
  );
}

/* Convert a data: URL into a Blob (keeps raw base64 out of the DOM / address bar). */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
    if (!m) return null;
    const mime = m[1] || "application/octet-stream";
    if (m[2]) {
      const bin = atob(m[3]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(m[3])], { type: mime });
  } catch {
    return null;
  }
}

/* Multi-page PDF viewer: renders every page to a canvas (pdf.js) inside a
 * vertically scrollable container. Works identically on iPadOS Safari 15+,
 * Android Chrome (which has no inline PDF plugin) and desktop browsers.
 * Falls back to a native <object> viewer if pdf.js fails. */
function PdfPagesViewer({ blob, name }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "ok" | "fallback">("loading");
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        // @ts-ignore
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const buf = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        if (cancelled) return;
        setTotal(doc.numPages);
        setStatus("ok");
        const cw = Math.max(280, (containerRef.current?.clientWidth || 360) - 16);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const max = Math.min(doc.numPages, 60);
        for (let i = 1; i <= max; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = cw / base.width;
          const vp = page.getViewport({ scale: scale * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          const url = canvas.toDataURL("image/jpeg", 0.9);
          canvas.width = 0;
          canvas.height = 0; // release memory (iOS canvas cap)
          if (cancelled) return;
          setPages((prev) => [...prev, url]);
        }
      } catch (e) {
        console.warn("[epilumina] pdf.js preview failed, using native viewer", e);
        if (cancelled) return;
        const u = URL.createObjectURL(blob);
        setFallbackUrl(u);
        setStatus("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blob]);

  useEffect(
    () => () => {
      if (fallbackUrl) URL.revokeObjectURL(fallbackUrl);
    },
    [fallbackUrl],
  );

  if (status === "fallback" && fallbackUrl) {
    return (
      <object
        data={fallbackUrl}
        type="application/pdf"
        aria-label={name}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 10,
          background: "#fff",
        }}
      >
        <iframe
          src={fallbackUrl}
          title={name}
          style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
        />
      </object>
    );
  }
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as any,
        borderRadius: 10,
        background: "#2A3431",
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${name} — ${i + 1}/${total}`}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            marginBottom: 10,
            borderRadius: 6,
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          }}
        />
      ))}
      {(status === "loading" || pages.length < Math.min(total, 60)) && (
        <p
          style={{
            color: "#fff",
            fontSize: 12,
            textAlign: "center",
            padding: 16,
            margin: 0,
            opacity: 0.8,
          }}
        >
          {total ? `${pages.length}/${total}…` : "…"}
        </p>
      )}
      {total > 0 && pages.length >= Math.min(total, 60) && (
        <p
          style={{
            color: "#fff",
            fontSize: 11,
            textAlign: "center",
            padding: "4px 0 12px",
            margin: 0,
            opacity: 0.7,
          }}
        >
          {total} / {total}
        </p>
      )}
    </div>
  );
}

function Lightbox({ file, onClose, tc }: any) {
  if (!file) return null;
  const isImage = file.type && file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const blob = useMemo(
    () => (isPdf && file.dataUrl ? dataUrlToBlob(file.dataUrl) : null),
    [file, isPdf],
  );
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setDownloadUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setDownloadUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  const dlHref = isPdf ? downloadUrl : file.dataUrl;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0F1614",
        display: "flex",
        flexDirection: "column",
        zIndex: 400,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            maxWidth: "70%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.name}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {dlHref && (
            <a
              href={dlHref}
              download={file.name}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Download size={13} /> {tc("files.download")}
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <X size={14} /> {tc("files.close")}
          </button>
        </div>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px 20px",
          overflow: "hidden",
        }}
      >
        {isImage && file.dataUrl && (
          <img
            src={file.dataUrl}
            alt={file.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 10,
              background: "#fff",
            }}
          />
        )}
        {isPdf && blob && <PdfPagesViewer blob={blob} name={file.name} />}
        {!isImage && !isPdf && <p style={{ color: "#fff", fontSize: 13 }}>—</p>}
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({
  t,
  tc,
  tx,
  lang,
  onChangeLang,
  entries,
  onNavigate,
  onOpenEntry,
  isPremium,
  onToggleCrown,
  onOpenSettings,
  patientName,
  calendarEvents = [],
}: any) {
  const baseGreeting = t("dashboard.greeting");
  const greeting = patientName
    ? baseGreeting.replace(/[!！].*$/, "") + ", " + patientName + "! 👋"
    : baseGreeting;
  const last = entries[0];
  const streak = last ? Math.max(daysSince(last.date), 0) : 0;
  const monthPrefix = todayISO().slice(0, 7);
  const thisMonthCount = entries.filter((e: any) => e.date.startsWith(monthPrefix)).length;

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "8px 0 4px",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "#5C6E68", fontWeight: 500 }}>{greeting}</p>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              margin: "2px 0 0",
              color: "#24312E",
              fontWeight: 600,
            }}
          >
            {t("dashboard.title")}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <PremiumCrownButton onClick={onToggleCrown} isPremium={isPremium} />
          <LangSwitcher lang={lang} onChange={onChangeLang} />
          <SettingsButton onClick={onOpenSettings} label={tc("settings.open")} />
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          background: "#FFFFFF",
          borderRadius: 22,
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
        }}
      >
        <StreakRing
          days={streak}
          label={
            lang === "pl"
              ? "dni bez napadu"
              : lang === "de"
                ? "Tage anfallsfrei"
                : lang === "zh"
                  ? "天未发作"
                  : lang === "es"
                    ? "días sin crisis"
                    : lang === "fr"
                      ? "jours sans crise"
                      : "days seizure-free"
          }
        />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {t("dashboard.lastSeizure")}:{" "}
            <strong style={{ color: "#24312E" }}>{last ? formatDate(last.date, lang) : "—"}</strong>
          </p>
          <p style={{ margin: "8px 0 10px", fontSize: 12.5, color: "#5C6E68" }}>
            {t("dashboard.thisMonth")}:{" "}
            <strong style={{ color: "#24312E" }}>
              {thisMonthCount} {t("dashboard.episodes")}
            </strong>
          </p>
          <button
            onClick={() => onNavigate("add")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#1B6B63",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> {t("dashboard.reportButton")}
          </button>
        </div>
      </div>

      {(() => {
        const up = (calendarEvents || [])
          .filter((e: any) => e && isUpcoming(e))
          .sort((a: any, b: any) =>
            (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")),
          )
          .slice(0, 3);
        if (up.length === 0) return null;
        return (
          <div
            style={{
              marginTop: 18,
              background: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#8B9C96",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {tx ? tx("cal.upcoming") : ""}
              </p>
              <button
                onClick={() => onNavigate("stats")}
                aria-label={tx ? tx("cal.title") : ""}
                title={tx ? tx("cal.title") : ""}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 15,
                  lineHeight: 1,
                  color: "#1B6B63",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "0 2px",
                }}
              >
                ›
              </button>
            </div>
            {up.map((ev: any) => (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "7px 0",
                  borderBottom: "1px solid #EFF3F1",
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    color: "#24312E",
                    fontWeight: 600,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ev.name}
                </span>
                <span style={{ fontSize: 11, color: "#5C6E68", flexShrink: 0 }}>
                  {formatDate(ev.date, lang)} · {ev.time}
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      <div
        style={{
          marginTop: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#24312E" }}>
          {t("dashboard.recentEntries")}
        </p>
        <button
          onClick={() => onNavigate("log")}
          style={{
            background: "none",
            border: "none",
            fontSize: 11.5,
            color: "#1B6B63",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("dashboard.fullLog")}
        </button>
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.slice(0, 3).map((e: any) => (
          <EntryRow
            key={(e as any).id}
            entry={e}
            t={t}
            lang={lang}
            onClick={() => onOpenEntry((e as any).id)}
          />
        ))}
      </div>
    </div>
  );
}

function EntryRow({ entry, t, lang, onClick }: any) {
  const color = (severityColor as any)[entry.severity];
  const sevLabel = t(
    "severity." + ({ 1: "mild", 2: "moderate", 3: "severe" } as any)[entry.severity],
  );
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#FFFFFF",
        border: "none",
        borderRadius: 16,
        padding: 12,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: color + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Zap size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#24312E" }}>
          {entry.typeKey === "other" && entry.customType
            ? entry.customType
            : t("types." + entry.typeKey)}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#5C6E68" }}>
          {formatDate(entry.date, lang)} · {entry.time} · {entry.duration}
        </p>
      </div>
      <Pill_ tone={entry.severity === 3 ? "berry" : "neutral"}>{sevLabel}</Pill_>
    </button>
  );
}

/* ================= LOG ================= */
function LogScreen({
  t,
  tc,
  lang,
  entries,
  onOpenEntry,
  onBack,
  progressJournal,
  onAddProgress,
  onDeleteEntry,
  onEditEntry,
  onDeleteProgress,
  onEditProgress,
}: any) {
  const [subTab, setSubTab] = useState("seizures");
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? entries : entries.filter((e: any) => e.severity === Number(filter));

  return (
    <div>
      <TopBar title={t("log.title")} onBack={onBack} />
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            background: "#EFF3F1",
            borderRadius: 14,
            padding: 4,
          }}
        >
          <button
            onClick={() => setSubTab("seizures")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 11,
              padding: "9px 0",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              background: subTab === "seizures" ? "#FFFFFF" : "transparent",
              color: subTab === "seizures" ? "#1B6B63" : "#5C6E68",
              boxShadow: subTab === "seizures" ? "0 1px 3px rgba(36,49,46,0.1)" : "none",
            }}
          >
            {t("log.title")}
          </button>
          <button
            onClick={() => setSubTab("progress")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 11,
              padding: "9px 0",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              background: subTab === "progress" ? "#FFFFFF" : "transparent",
              color: subTab === "progress" ? "#1B6B63" : "#5C6E68",
              boxShadow: subTab === "progress" ? "0 1px 3px rgba(36,49,46,0.1)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Sparkles size={13} /> {t("log.progressSectionTitle")}
          </button>
        </div>

        {subTab === "seizures" ? (
          <>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {[
                { key: "all", label: t("log.filterAll") },
                { key: "1", label: t("log.filterMild") },
                { key: "2", label: t("log.filterModerate") },
                { key: "3", label: t("log.filterSevere") },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "7px 13px",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    background: filter === f.key ? "#1B6B63" : "#FFFFFF",
                    color: filter === f.key ? "#fff" : "#5C6E68",
                    boxShadow: "0 1px 2px rgba(36,49,46,0.06)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 && (
                <p style={{ fontSize: 12.5, color: "#8B9C96", textAlign: "center", marginTop: 30 }}>
                  {t("log.noEntries")}
                </p>
              )}
              {filtered.map((e: any) => (
                <EntryRowWithActions
                  key={(e as any).id}
                  entry={e}
                  t={t}
                  tc={tc}
                  lang={lang}
                  onOpen={() => onOpenEntry((e as any).id)}
                  onEdit={() => onEditEntry((e as any).id)}
                  onDelete={() => {
                    if (window.confirm(tc("files.confirmDelete"))) onDeleteEntry((e as any).id);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <ProgressJournalSection
            t={t}
            tc={tc}
            progressJournal={progressJournal}
            onAddProgress={onAddProgress}
            onDeleteProgress={onDeleteProgress}
            onEditProgress={onEditProgress}
          />
        )}
      </div>
    </div>
  );
}

function EntryRowWithActions({ entry, t, tc, lang, onOpen, onEdit, onDelete }: any) {
  const color = (severityColor as any)[entry.severity];
  const sevLabel = t(
    "severity." + ({ 1: "mild", 2: "moderate", 3: "severe" } as any)[entry.severity],
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
      }}
    >
      <button
        onClick={onOpen}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={18} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#24312E" }}>
            {t("types." + entry.typeKey)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#5C6E68" }}>
            {formatDate(entry.date, lang)} · {entry.time} · {entry.duration}
          </p>
        </div>
        <Pill_ tone={entry.severity === 3 ? "berry" : "neutral"}>{sevLabel}</Pill_>
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={onEdit}
          aria-label={tc("files.rename")}
          style={{
            background: "#EFF3F1",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: 8,
          }}
        >
          <Edit3 size={13} color="#1B6B63" />
        </button>
        <button
          onClick={onDelete}
          aria-label={tc("files.delete")}
          style={{
            background: "#F3DEE7",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: 8,
          }}
        >
          <Trash2 size={13} color="#A6416B" />
        </button>
      </div>
    </div>
  );
}

function ProgressJournalSection({
  t,
  tc,
  progressJournal,
  onAddProgress,
  onDeleteProgress,
  onEditProgress,
}: any) {
  const [text, setText] = useState<any>("");
  const [editId, setEditId] = useState<any>(null);
  const [editVal, setEditVal] = useState<any>("");
  const handleSave = () => {
    if (!text.trim()) return;
    onAddProgress(text.trim());
    setText("");
  };

  return (
    <div style={{ paddingBottom: 10 }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#5C6E68", lineHeight: 1.5 }}>
        {t("log.progressDesc")}
      </p>
      <textarea
        rows={3}
        placeholder={t("log.progressPlaceholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
      />
      <button
        onClick={handleSave}
        disabled={!text.trim()}
        style={{
          ...primaryBtn,
          width: "100%",
          marginTop: 10,
          opacity: text.trim() ? 1 : 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Sparkles size={14} /> {t("log.progressSaveButton")}
      </button>
      <p
        style={{
          marginTop: 20,
          marginBottom: 8,
          fontSize: 11.5,
          fontWeight: 700,
          color: "#8B9C96",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {t("log.progressPastLabel")}
      </p>
      {progressJournal.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "#8B9C96", textAlign: "center", marginTop: 10 }}>
          {t("log.progressEmpty")}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {progressJournal.map((p: any) => (
            <div
              key={p.id}
              style={{
                background: "#DCEEEA",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Sparkles size={14} color="#1B6B63" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#5C6E68" }}>{p.date}</p>
                {editId === p.id ? (
                  <>
                    <textarea
                      rows={2}
                      value={editVal}
                      onChange={(e) => setEditVal(clamp(e.target.value, LIMITS.long))}
                      style={{ ...inputStyle, marginTop: 4, resize: "none", fontFamily: "inherit" }}
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        onClick={() => {
                          onEditProgress(p.id, editVal.trim() || p.text);
                          setEditId(null);
                        }}
                        style={{ ...primaryBtn, padding: "6px 10px", fontSize: 11 }}
                      >
                        {tc("common.save")}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{ ...secondaryBtn, padding: "6px 10px", fontSize: 11 }}
                      >
                        {tc("common.cancel")}
                      </button>
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12.5,
                      color: "#175048",
                      lineHeight: 1.4,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {p.text}
                  </p>
                )}
              </div>
              {editId !== p.id && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    onClick={() => {
                      setEditId(p.id);
                      setEditVal(p.text);
                    }}
                    style={{
                      background: "#EFF3F1",
                      border: "none",
                      cursor: "pointer",
                      padding: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Edit3 size={12} color="#1B6B63" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(tc("files.confirmDelete"))) onDeleteProgress(p.id);
                    }}
                    style={{
                      background: "#F3DEE7",
                      border: "none",
                      cursor: "pointer",
                      padding: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={12} color="#A6416B" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= DETAIL ================= */
function DetailScreen({ t, tc, lang, entry, onBack, onDelete, onEdit }: any) {
  if (!entry) return null;
  const sevLabel = t(
    "severity." + ({ 1: "mild", 2: "moderate", 3: "severe" } as any)[entry.severity],
  );
  return (
    <div>
      <TopBar
        title={t("detail.title")}
        onBack={onBack}
        action={
          <button
            onClick={() => onEdit(entry.id)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
            aria-label="Edit"
          >
            <Edit3 size={17} color="#1B6B63" />
          </button>
        }
      />
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: 18,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  margin: 0,
                  color: "#24312E",
                }}
              >
                {entry.typeKey === "other" && entry.customType
                  ? entry.customType
                  : t("types." + entry.typeKey)}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#5C6E68" }}>
                {formatDate(entry.date, lang)}
              </p>
            </div>
            <Pill_ tone={entry.severity === 3 ? "berry" : "teal"}>{sevLabel}</Pill_>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={15} color="#5C6E68" />
              <span style={{ fontSize: 12.5, color: "#24312E", fontWeight: 600 }}>
                {entry.time}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={15} color="#5C6E68" />
              <span style={{ fontSize: 12.5, color: "#24312E", fontWeight: 600 }}>
                {entry.duration}
              </span>
            </div>
          </div>
        </div>
        <Section title={t("detail.symptoms")}>
          <TagList
            items={entry.symptomKeys.map((k: string) => t("symptoms." + k))}
            tone="neutral"
          />
        </Section>
        <Section title={t("detail.triggers")}>
          <TagList items={entry.triggerKeys.map((k: string) => t("triggers." + k))} tone="teal" />
        </Section>
        <Section title={t("detail.notes")}>
          <p style={{ fontSize: 13, color: "#3A4A45", lineHeight: 1.6, margin: 0 }}>
            {entry.notes || "—"}
          </p>
        </Section>
        <button
          onClick={() => {
            if (window.confirm(tc("files.confirmDelete"))) onDelete(entry.id);
          }}
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #F3DEE7",
            color: "#A6416B",
            borderRadius: 14,
            padding: "12px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Trash2 size={15} /> {t("detail.delete")}
        </button>
      </div>
    </div>
  );
}
function Section({ title, children }: any) {
  return (
    <div style={{ marginTop: 14 }}>
      <p
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "#8B9C96",
          textTransform: "uppercase",
          letterSpacing: 0.4,
          margin: "0 0 8px",
        }}
      >
        {title}
      </p>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
function TagList({ items, tone }: any) {
  if (!items || items.length === 0)
    return <span style={{ fontSize: 12.5, color: "#8B9C96" }}>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((it: any) => (
        <Pill_ key={it} tone={tone}>
          {it}
        </Pill_>
      ))}
    </div>
  );
}

/* ================= ADD ================= */
function AddEntryScreen({ t, tc, onBack, onSave, initialEntry }: any) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(
    initialEntry
      ? {
          date: initialEntry.date || todayISO(),
          time: initialEntry.time || nowHM(),
          duration: initialEntry.duration || "",
          typeKey: initialEntry.typeKey || "",
          customType: initialEntry.customType || "",
          severity: initialEntry.severity || 2,
          symptomKeys: initialEntry.symptomKeys || [],
          triggerKeys: initialEntry.triggerKeys || [],
          aura: initialEntry.aura || "",
          postState: initialEntry.postState || "",
          notes: initialEntry.notes || "",
        }
      : {
          date: todayISO(),
          time: nowHM(),
          duration: "",
          typeKey: "",
          customType: "",
          severity: 2,
          symptomKeys: [],
          triggerKeys: [],
          aura: "",
          postState: "",
          notes: "",
        },
  );

  const toggle = (key: string, value: any) =>
    setForm((f) => {
      const s = new Set((f as any)[key]);
      s.has(value) ? s.delete(value) : s.add(value);
      return { ...f, [key]: Array.from(s) };
    });
  const [errors, setErrors] = useState<any>({});
  const isEdit = Boolean(initialEntry);
  const durationMissing = Boolean(errors.duration);

  // Validation happens only at the very end — intermediate steps never block.
  const trySave = () => {
    const next = {};
    if (!String(form.duration || "").trim()) (next as any).duration = true;
    if (!form.typeKey) (next as any).typeKey = true;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStep(1);
      return;
    }
    onSave(form);
  };

  return (
    <div>
      <TopBar
        title={isEdit ? tc("files.rename") + " · " + t("add.title") : t("add.title")}
        onBack={onBack}
        action={
          <button
            onClick={onBack}
            aria-label="Cancel"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={18} color="#5C6E68" />
          </button>
        }
      />
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= step ? "#1B6B63" : "#DCE5E1",
              }}
            />
          ))}
        </div>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label={t("add.date")}>
              <input
                type="date"
                max={todayISO()}
                value={form.date}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v || v <= todayISO()) setForm({ ...form, date: v });
                }}
                style={inputStyle}
              />
            </Field>
            <Field label={t("add.time")}>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                style={inputStyle}
              />
            </Field>
            {(() => {
              const h = parseInt((form.time || "").slice(0, 2), 10);
              if (isNaN(h) || h >= 4) return null;
              const anchorLabel = t("add.anchorPrev");
              const anchored = (form as any)._anchoredPrev === true;
              return (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#EFF3F1",
                    borderRadius: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={anchored}
                    onChange={(e) => {
                      const check = e.target.checked;
                      setForm((f) => {
                        if (check) {
                          const d = new Date(f.date + "T00:00:00");
                          d.setDate(d.getDate() - 1);
                          const prev = d.toISOString().slice(0, 10);
                          return { ...f, date: prev, _anchoredPrev: true, _originalDate: f.date };
                        }
                        const restore = (f as any)._originalDate || f.date;
                        const copy = { ...f, date: restore, _anchoredPrev: false };
                        delete (copy as any)._originalDate;
                        return copy;
                      });
                    }}
                  />
                  <span style={{ fontSize: 12.5, color: "#24312E", fontWeight: 600 }}>
                    {anchorLabel}
                  </span>
                </label>
              );
            })()}
            <Field label={t("add.duration")}>
              <input
                type="text"
                maxLength={LIMITS.duration}
                placeholder={t("add.durationPlaceholder")}
                value={form.duration}
                onChange={(e) => {
                  setForm({ ...form, duration: clamp(e.target.value, LIMITS.duration) });
                  if (errors.duration) setErrors((x: any) => ({ ...x, duration: false }));
                }}
                style={{
                  ...inputStyle,
                  border: durationMissing ? "1.5px solid #C0392B" : inputStyle.border,
                }}
              />
              {durationMissing && (
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#C0392B",
                  }}
                >
                  {t("add.durationRequired")}
                </span>
              )}
            </Field>
            <Field label={t("add.type")}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TYPE_KEYS.map((k) => (
                  <ChoiceChip
                    key={k}
                    active={form.typeKey === k}
                    onClick={() => {
                      setForm({ ...form, typeKey: k });
                      setErrors((x: any) => ({ ...x, typeKey: false }));
                    }}
                  >
                    {t("types." + k)}
                  </ChoiceChip>
                ))}
              </div>
              {form.typeKey === "other" && (
                <input
                  type="text"
                  maxLength={LIMITS.short}
                  placeholder={t("add.otherTypePlaceholder")}
                  value={form.customType || ""}
                  onChange={(e) =>
                    setForm({ ...form, customType: clamp(e.target.value, LIMITS.short) })
                  }
                  style={{ ...inputStyle, marginTop: 8 }}
                />
              )}
              {errors.typeKey && (
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#C0392B",
                  }}
                >
                  {t("add.typeRequired")}
                </span>
              )}
            </Field>
            <Field label={t("add.severity")}>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setForm({ ...form, severity: lvl })}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: form.severity === lvl ? (severityColor as any)[lvl] : "#FFFFFF",
                      color: form.severity === lvl ? "#fff" : "#5C6E68",
                      boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
                    }}
                  >
                    {t("severity." + { 1: "mild", 2: "moderate", 3: "severe" }[lvl])}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label={t("add.symptomsLabel")}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SYMPTOM_KEYS.map((k) => (
                  <ChoiceChip
                    key={k}
                    active={form.symptomKeys.includes(k)}
                    onClick={() => toggle("symptomKeys", k)}
                  >
                    {t("symptoms." + k)}
                  </ChoiceChip>
                ))}
              </div>
            </Field>
            <Field label={t("add.triggersLabel")}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TRIGGER_KEYS.map((k) => (
                  <ChoiceChip
                    key={k}
                    active={form.triggerKeys.includes(k)}
                    onClick={() => toggle("triggerKeys", k)}
                  >
                    {t("triggers." + k)}
                  </ChoiceChip>
                ))}
              </div>
            </Field>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label={t("add.auraLabel")}>
              <textarea
                rows={2}
                maxLength={LIMITS.short}
                placeholder={t("add.auraPlaceholder")}
                value={form.aura}
                onChange={(e) => setForm({ ...form, aura: clamp(e.target.value, LIMITS.short) })}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
              />
            </Field>
            <Field label={t("add.postStateLabel")}>
              <textarea
                rows={2}
                maxLength={LIMITS.short}
                placeholder={t("add.postStatePlaceholder")}
                value={form.postState}
                onChange={(e) =>
                  setForm({ ...form, postState: clamp(e.target.value, LIMITS.short) })
                }
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
              />
            </Field>
            <Field label={t("add.notesLabel")}>
              <textarea
                rows={3}
                maxLength={LIMITS.long}
                placeholder={t("add.notesPlaceholder")}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: clamp(e.target.value, LIMITS.long) })}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
              />
            </Field>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={secondaryBtn}>
              {t("add.back")}
            </button>
          )}
          {step < 3 && (
            <button onClick={() => setStep(step + 1)} style={primaryBtn}>
              {t("add.next")}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={trySave}
              style={{
                ...primaryBtn,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Check size={15} /> {t("add.save")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function Field({ label, children }: any) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "#5C6E68",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
function ChoiceChip({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: 999,
        padding: "8px 13px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        background: active ? "#1B6B63" : "#FFFFFF",
        color: active ? "#fff" : "#5C6E68",
        boxShadow: "0 1px 2px rgba(36,49,46,0.06)",
      }}
    >
      {children}
    </button>
  );
}

/* ================= STATS (shared date-range state) ================= */
function DateRangeBar({ tc, from, to, onChange }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <label style={{ flex: 1 }}>
        <span
          style={{
            display: "block",
            fontSize: 10.5,
            fontWeight: 700,
            color: "#5C6E68",
            marginBottom: 4,
          }}
        >
          {tc("chronicle.from")}
        </span>
        <input
          type="date"
          value={from}
          max={to || todayISO()}
          onChange={(e) => onChange(e.target.value, to)}
          style={{ ...inputStyle, padding: "8px 10px", fontSize: 12 }}
        />
      </label>
      <label style={{ flex: 1 }}>
        <span
          style={{
            display: "block",
            fontSize: 10.5,
            fontWeight: 700,
            color: "#5C6E68",
            marginBottom: 4,
          }}
        >
          {tc("chronicle.to")}
        </span>
        <input
          type="date"
          value={to}
          min={from}
          max={todayISO()}
          onChange={(e) => onChange(from, e.target.value)}
          style={{ ...inputStyle, padding: "8px 10px", fontSize: 12 }}
        />
      </label>
    </div>
  );
}

function StatsScreen({
  t,
  tc,
  tx,
  lang,
  entries,
  patientName = "",
  documents,
  onAddDocument,
  onRenameDocument,
  onDeleteDocument,
  progressJournal,
  ketoReadings = [],
  isPremium,
  onOpenPremium,
  calendarEvents = [],
  onAddCalendarEvent,
  onUpdateCalendarEvent,
  onDeleteCalendarEvent,
  meds = [],
}: any) {
  const [dateFrom, setDateFrom] = useState(daysAgoISO(30));
  const [dateTo, setDateTo] = useState(todayISO());
  const setRange = (f: any, t2: any) => {
    setDateFrom(f);
    setDateTo(t2);
  };

  const thisWeekCount = entries.filter((e: any) => {
    const d = daysSince(e.date);
    return d >= 0 && d <= 7;
  }).length;
  const thisMonthCount = entries.filter((e: any) => {
    const d = daysSince(e.date);
    return d >= 0 && d <= 31;
  }).length;

  return (
    <div>
      <TopBar title={t("stats.title")} />
      <div style={{ padding: "0 20px 30px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div
            style={{
              flex: 1,
              background: "#FFFFFF",
              borderRadius: 18,
              padding: 14,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
            }}
          >
            <p style={{ margin: 0, fontSize: 10.5, color: "#5C6E68", fontWeight: 600 }}>
              {t("stats.thisWeek")}
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 30,
                margin: "2px 0 0",
                color: "#1B6B63",
                fontWeight: 600,
              }}
            >
              {thisWeekCount}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              background: "#FFFFFF",
              borderRadius: 18,
              padding: 14,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
            }}
          >
            <p style={{ margin: 0, fontSize: 10.5, color: "#5C6E68", fontWeight: 600 }}>
              {t("stats.thisMonth")}
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 30,
                margin: "2px 0 0",
                color: "#1B6B63",
                fontWeight: 600,
              }}
            >
              {thisMonthCount}
            </p>
          </div>
        </div>

        <DocsSection
          t={t}
          tc={tc}
          lang={lang}
          documents={documents}
          onAdd={onAddDocument}
          onRename={onRenameDocument}
          onDelete={onDeleteDocument}
          isPremium={isPremium}
          onOpenPremium={onOpenPremium}
        />

        <PdfSection
          t={t}
          tc={tc}
          tx={tx}
          lang={lang}
          entries={entries}
          isPremium={isPremium}
          onOpenPremium={onOpenPremium}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onRangeChange={setRange}
          ketoReadings={ketoReadings}
          progressJournal={progressJournal}
          patientName={patientName}
        />

        <ChronicleSection
          t={t}
          tc={tc}
          lang={lang}
          entries={entries}
          isPremium={isPremium}
          onOpenPremium={onOpenPremium}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onRangeChange={setRange}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              filter: isPremium ? "none" : "blur(5px)",
              pointerEvents: isPremium ? "auto" : "none",
              minHeight: isPremium ? "auto" : 220,
            }}
          >
            <MedicalCalendar
              tx={tx}
              lang={lang}
              events={calendarEvents}
              onAddEvent={onAddCalendarEvent}
              onUpdateEvent={onUpdateCalendarEvent}
              onDeleteEvent={onDeleteCalendarEvent}
              entries={entries}
              progressJournal={progressJournal}
              meds={meds}
              isPremium={isPremium}
            />
          </div>
          {!isPremium && (
            <PremiumLock
              title={tx("cal.title")}
              desc={tx("cal.desc")}
              ctaLabel={t("stats.tryPremium")}
              onOpenPremium={onOpenPremium}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= DOCS SECTION (multi-upload, collapsible, lightbox) ================= */
function DocsSection({
  t,
  tc,
  lang,
  documents,
  onAdd,
  onRename,
  onDelete,
  isPremium,
  onOpenPremium,
}: any) {
  const [editingId, setEditingId] = useState<any>(null);
  const [editValue, setEditValue] = useState<any>("");
  const [uploadError, setUploadError] = useState<any>("");
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const fileInputRef = useRef<any>(null);
  // Documents live in IndexedDB. A per-file cap + storage check protects the
  // browser from running out of space (which could break saving new entries).
  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const [storageWarn, setStorageWarn] = useState<any>("");
  const tx = useExtraT(lang);

  const handleFiles = async (fileList: FileList | null) => {
    setUploadError("");
    setStorageWarn("");
    let files = Array.from(fileList || []);
    if (files.length === 0) return;
    const tooBig = files.filter((f) => f.size > MAX_FILE_BYTES);
    if (tooBig.length) {
      setUploadError(
        tc("files.tooLarge", { size: "20 MB" }) + " — " + tooBig.map((f) => f.name).join(", "),
      );
      files = files.filter((f) => f.size <= MAX_FILE_BYTES);
      if (files.length === 0) return;
    }
    try {
      const est = await navigator.storage?.estimate?.();
      if (est && est.quota) {
        const incoming = files.reduce((a, f) => a + f.size * 1.4, 0); // base64 overhead
        const free = est.quota - (est.usage || 0);
        if (incoming > free) {
          setUploadError(tx("files.storageFull"));
          return;
        }
        if ((est.usage || 0) + incoming > est.quota * 0.8) setStorageWarn(tx("files.storageWarn"));
      }
    } catch {
      /* estimate unsupported */
    }
    const hadError = false;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result || "");
        const base: any = {
          name: clamp(file.name, LIMITS.name),
          date: todayISO(),
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
        };
        // PDF text extraction + medical keyword tagging (Premium feature, runs 100% on-device).
        if (file.type === "application/pdf") {
          try {
            const ext = await extractPdf(file);
            if (ext) {
              base.extractedText = ext.text;
              base.extractedKeywords = ext.keywords;
              base.pageCount = ext.pageCount;
            }
          } catch {
            /* ignore */
          }
        }
        onAdd(base);
      };
      reader.onerror = () => setUploadError(tc("files.unreadable"));
      reader.readAsDataURL(file);
    });
    if (!hadError && files.length > 0) setExpanded(true);
  };

  const countLabel = fillTemplate(tc("files.countLabel"), { n: documents.length });

  return (
    <div style={{ marginBottom: 20, position: "relative" }}>
      <SectionHeader
        icon={ScanLine}
        title={t("stats.docsSection.title")}
        desc={t("stats.docsSection.desc")}
        isPremium={isPremium}
        onIconClick={() => isPremium && fileInputRef.current && fileInputRef.current.click()}
      />
      <div
        style={{
          filter: isPremium ? "none" : "blur(5px)",
          pointerEvents: isPremium ? "auto" : "none",
          minHeight: isPremium ? "auto" : 160,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            ...primaryBtn,
            width: "100%",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Upload size={14} /> {tc("files.uploadButton")}
        </button>
        {uploadError && (
          <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#A6416B" }}>{uploadError}</p>
        )}
        {storageWarn && (
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11.5,
              color: "#8A5A12",
              background: "#FFF6E4",
              borderRadius: 10,
              padding: "7px 10px",
            }}
          >
            ⚠️ {storageWarn}
          </p>
        )}

        {/* Collapsible header */}
        <button
          onClick={() => setExpanded((x) => !x)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FFFFFF",
            border: "none",
            borderRadius: 14,
            padding: "12px 14px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>{countLabel}</span>
          {expanded ? (
            <ChevronUp size={16} color="#5C6E68" />
          ) : (
            <ChevronDown size={16} color="#5C6E68" />
          )}
        </button>

        {expanded && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {documents.length === 0 && (
              <p style={{ fontSize: 12, color: "#8B9C96", textAlign: "center", padding: "10px 0" }}>
                {tc("files.empty")}
              </p>
            )}
            {documents.map((doc: any) => {
              const isImage = (doc as any).type && (doc as any).type.startsWith("image/");
              return (
                <div
                  key={(doc as any).id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#FFFFFF",
                    borderRadius: 14,
                    padding: 12,
                    boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
                  }}
                >
                  <button
                    onClick={() => (doc as any).dataUrl && setPreview(doc)}
                    aria-label={tc("files.preview")}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#DCEEEA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                      border: "none",
                      cursor: (doc as any).dataUrl ? "pointer" : "default",
                      padding: 0,
                    }}
                  >
                    {isImage && (doc as any).dataUrl ? (
                      <img
                        src={(doc as any).dataUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <FileText size={16} color="#1B6B63" />
                    )}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingId === (doc as any).id ? (
                      <input
                        autoFocus
                        maxLength={LIMITS.name}
                        value={editValue}
                        onChange={(e) => setEditValue(clamp(e.target.value, LIMITS.name))}
                        onBlur={() => {
                          onRename(
                            (doc as any).id,
                            clamp(editValue.trim(), LIMITS.name) || (doc as any).name,
                          );
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as any).blur();
                        }}
                        style={{ ...inputStyle, padding: "4px 8px", fontSize: 12.5 }}
                      />
                    ) : (
                      <button
                        onClick={() => (doc as any).dataUrl && setPreview(doc)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                          cursor: (doc as any).dataUrl ? "pointer" : "default",
                          width: "100%",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#24312E",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {(doc as any).name}
                        </p>
                      </button>
                    )}
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5C6E68" }}>
                      {(doc as any).date}
                      {(doc as any).size ? " · " + humanSize((doc as any).size) : ""}
                    </p>
                  </div>
                  {(doc as any).dataUrl && (
                    <button
                      onClick={() => setPreview(doc)}
                      aria-label={tc("files.preview")}
                      style={{
                        background: "#DCEEEA",
                        border: "none",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Eye size={13} color="#1B6B63" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingId((doc as any).id);
                      setEditValue((doc as any).name);
                    }}
                    aria-label={tc("files.rename")}
                    style={{
                      background: "#EFF3F1",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Edit3 size={13} color="#1B6B63" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(tc("files.confirmDelete"))) onDelete((doc as any).id);
                    }}
                    aria-label={tc("files.delete")}
                    style={{
                      background: "#F3DEE7",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={13} color="#A6416B" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {preview && <Lightbox file={preview} onClose={() => setPreview(null)} tc={tc} />}
      {!isPremium && (
        <PremiumLock
          title={t("stats.docsSection.lockTitle")}
          desc={t("stats.docsSection.lockDesc")}
          ctaLabel={t("stats.tryPremium")}
          onOpenPremium={onOpenPremium}
        />
      )}
    </div>
  );
}

/* ================= PDF SECTION (date range, translated headers) ================= */
function PdfSection({
  t,
  tc,
  tx,
  lang,
  entries,
  isPremium,
  onOpenPremium,
  dateFrom,
  dateTo,
  onRangeChange,
  ketoReadings = [],
  progressJournal = [],
  patientName = "",
}: any) {
  const [lastReport, setLastReport] = useState<any>(null);
  const [sections, setSections] = useState({
    stats: true,
    types: true,
    triggers: true,
    log: true,
    keto: true,
    journal: false,
  });
  const toggleSection = (k: string | number) => setSections((s) => ({ ...s, [k]: !(s as any)[k] }));
  const escapeHtml = (s: string) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c: string) =>
        (
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
            string,
            string
          >
        )[c],
    );

  // The doctor reads a report chronologically, oldest first.
  const inWindow = entries
    .filter((e: any) => inRange(e.date, dateFrom, dateTo))
    .slice()
    .sort((a: any, b: any) =>
      ((a.date || "") + "T" + (a.time || "00:00")).localeCompare(
        (b.date || "") + "T" + (b.time || "00:00"),
      ),
    );
  const ketoWindow = (ketoReadings || [])
    .filter((r: any) => inRange(r.date, dateFrom, dateTo))
    .slice()
    .sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)));
  const journalWindow = (progressJournal || [])
    .filter((j: any) => inRange(j.date, dateFrom, dateTo))
    .slice()
    .sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));

  // Cały dokument buduje osobny moduł — dzięki temu "Drukuj" i "Pobierz PDF"
  // korzystają z dokładnie tego samego, ładnego układu A4.
  const buildReportHtml = () =>
    buildReportHtmlDoc({
      lang,
      patientName,
      now: new Date().toLocaleString((LOCALE_MAP as any)[lang] || "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      dateFrom,
      dateTo,
      today: todayISO(),
      entries: inWindow,
      keto: ketoWindow,
      journal: journalWindow,
      sections,
      t,
      formatDate: (d: string) => formatDateShort(d, lang),
    });

  const markGenerated = () =>
    setLastReport({
      generatedAt: new Date().toLocaleString((LOCALE_MAP as any)[lang] || "en-GB", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
      count: inWindow.length,
    });

  // "Drukuj" — opens the report and triggers the native print dialog (Save as PDF).
  const generate = () => {
    const html = buildReportHtml();
    const w = window.open("", "_blank");
    if (!w) {
      alert(tc("pdf.openedNewTab"));
      return;
    }
    w.document.open();
    w.document.write(
      html +
        "<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));<\/script>",
    );
    w.document.close();
    markGenerated();
  };

  // "Pobierz PDF" — real binary PDF (application/pdf) rendered on-device with html2canvas + jsPDF.
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  // Drukowanie z okna przeglądarki ma sens tylko na komputerze. W zainstalowanej
  // aplikacji na telefonie window.open + window.print() zachowuje się różnie
  // (nowa karta, brak okna druku), więc na telefonie zostaje jeden pewny przycisk:
  // "Pobierz PDF", który tworzy prawdziwy plik.
  const isWide = useIsDesktop();
  const download = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    setPdfError("");
    const name = "Epilumina_Raport_" + todayISO() + ".pdf";

    let html = "";
    try {
      html = buildReportHtml().replace(/<button[\s\S]*?<\/button>/g, "");
    } catch (e: any) {
      // Sama treść raportu się nie zbudowała — to inny błąd niż PDF.
      setPdfError(tx("pdf.failed") + " (" + String(e?.message || e).slice(0, 90) + ")");
      setPdfBusy(false);
      return;
    }

    // Iframe MUSI być renderowany przez przeglądarkę. Wcześniej stał na
    // left:-10000px — na niektórych telefonach przeglądarka nie maluje takiego
    // iframe'u i html2canvas dostawał element bez stylów. Teraz jest na ekranie,
    // ale przezroczysty i nieklikalny.
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText =
      "position:fixed;left:0;top:0;width:794px;height:1123px;border:0;opacity:0;pointer-events:none;z-index:-1";
    document.body.appendChild(frame);

    try {
      const fdoc = (frame as any).contentWindow.document;
      fdoc.open();
      fdoc.write(html);
      fdoc.close();
      await new Promise((r) => window.setTimeout(r, 500));

      // Biblioteki ładowane leniwie — z jedną ponowną próbą (słabe łącze).
      const loadLibs = async () => {
        const h2cMod: any = await import("html2canvas");
        const jsMod: any = await import("jspdf");
        const html2canvas = h2cMod.default || h2cMod;
        const JsPDF = jsMod.jsPDF || jsMod.default;
        if (typeof html2canvas !== "function" || typeof JsPDF !== "function") {
          throw new Error("pdf libs unavailable");
        }
        return { html2canvas, JsPDF };
      };
      let libs;
      try {
        libs = await loadLibs();
      } catch {
        await new Promise((r) => window.setTimeout(r, 800));
        libs = await loadLibs();
      }
      const { html2canvas, JsPDF } = libs as any;

      const pdf = new JsPDF({ unit: "pt", format: "a4", compress: true });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const M = 36;
      const cw = pw - M * 2;

      // Telefony z mało pamięci: mniejsza skala = mniejsze canvasy, mniej OOM.
      const mem = (navigator as any).deviceMemory;
      const baseScale = typeof mem === "number" && mem > 0 && mem <= 4 ? 1.5 : 2;

      const blocks = Array.from(fdoc.querySelectorAll(".blk")) as HTMLElement[];
      const targets = blocks.length > 0 ? blocks : [fdoc.body];

      /** Render jednego bloku: najpierw w normalnej skali, potem w 1. */
      const renderBlock = async (el: HTMLElement) => {
        for (const scale of [baseScale, 1]) {
          try {
            frame.style.height = Math.max(el.scrollHeight + 24, 80) + "px";
            const canvas = await html2canvas(el, {
              scale,
              backgroundColor: "#FFFFFF",
              windowWidth: 794,
              logging: false,
            });
            if (!canvas || !canvas.width || !canvas.height) continue;
            return canvas;
          } catch {
            /* spróbujemy w mniejszej skali */
          }
        }
        return null;
      };

      let y = M;
      let done = 0;
      let skipped = 0;
      let lastError = "";

      for (const el of targets) {
        if (!el) continue;
        const canvas = await renderBlock(el);
        if (!canvas) {
          skipped++;
          continue;
        }
        const h = (canvas.height * cw) / canvas.width;
        let img = "";
        try {
          img = canvas.toDataURL("image/jpeg", 0.92);
        } catch (e: any) {
          lastError = String(e?.message || e);
          skipped++;
          continue;
        }

        if (h <= ph - M * 2) {
          if (y + h > ph - M) {
            pdf.addPage();
            y = M;
          }
          pdf.addImage(img, "JPEG", M, y, cw, h);
          y += h + 10;
        } else {
          let placed = 0;
          while (placed < h - 0.5) {
            const avail = ph - M - y;
            pdf.addImage(img, "JPEG", M, y - placed, cw, h);
            if (placed + avail < h - 0.5) {
              placed += avail;
              pdf.addPage();
              y = M;
            } else {
              y += h - placed;
              placed = h;
            }
          }
          y += 10;
        }
        done++;
        // Oddech dla przeglądarki między blokami (mniej ryzyka OOM na telefonie).
        await new Promise((r) => window.setTimeout(r, 0));
      }

      if (done === 0) {
        throw new Error(lastError || "no blocks rendered");
      }

      const blob = pdf.output("blob");
      try {
        const file = new Blob([blob], { type: "application/pdf" });
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 6000);
      } catch {
        const a = document.createElement("a");
        a.href = pdf.output("datauristring");
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      if (skipped > 0) {
        setPdfError(
          fillTemplate(tx("pdf.partial"), { n: skipped, total: targets.length }),
        );
        window.setTimeout(() => setPdfError(""), 9000);
      }
      markGenerated();
    } catch (e: any) {
      const reason = String(e?.message || e?.name || e).slice(0, 90);
      setPdfError(tx("pdf.failed") + " (" + reason + ")");
      window.setTimeout(() => setPdfError(""), 12000);
    } finally {
      if (frame.parentNode) frame.parentNode.removeChild(frame);
      setPdfBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 20, position: "relative" }}>
      <SectionHeader
        icon={FileText}
        title={t("stats.pdfSection.title")}
        desc={t("stats.pdfSection.desc")}
        isPremium={isPremium}
      />
      <div
        style={{
          filter: isPremium ? "none" : "blur(5px)",
          pointerEvents: isPremium ? "auto" : "none",
          minHeight: isPremium ? "auto" : 140,
        }}
      >
        <DateRangeBar tc={tc} from={dateFrom} to={dateTo} onChange={onRangeChange} />
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tc("pdf.configTitle")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              ["stats", tc("pdf.secStats")],
              ["types", tc("pdf.secTypes")],
              ["triggers", tc("pdf.secTriggers")],
              ["log", tc("pdf.secLog")],
              ["keto", tc("pdf.secKeto")],
              ["journal", tc("pdf.secJournal")],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => toggleSection(k)}
                aria-pressed={!!(sections as any)[k]}
                style={{
                  border: (sections as any)[k] ? "1.5px solid #1B6B63" : "1px solid #E1E7E4",
                  background: (sections as any)[k] ? "#DCEEEA" : "#F6F9F8",
                  color: (sections as any)[k] ? "#1B6B63" : "#5C6E68",
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            onClick={download}
            disabled={pdfBusy}
            style={{
              ...primaryBtn,
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              opacity: pdfBusy ? 0.6 : 1,
            }}
          >
            <Download size={15} /> {tx("pdf.download")}
          </button>
          {isWide && (
            <button
              onClick={generate}
              style={{
                ...primaryBtn,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <FileText size={15} /> {tx("pdf.print")}
            </button>
          )}
        </div>
        {pdfError && (
          <p style={{ margin: "0 0 10px", fontSize: 11.5, lineHeight: 1.5, color: "#A6416B" }}>
            {pdfError}
          </p>
        )}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {t("stats.pdfSection.previewTitle")}
          </p>
          {!lastReport ? (
            <p style={{ fontSize: 12, color: "#8B9C96", margin: 0 }}>
              {t("stats.pdfSection.noReportYet")}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <RowLine label={t("stats.pdfSection.generatedAt")} value={lastReport.generatedAt} />
              <RowLine label={t("stats.pdfSection.count")} value={String(lastReport.count)} />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#5C6E68", lineHeight: 1.4 }}>
                {tc("pdf.openedNewTab")}
              </p>
            </div>
          )}
        </div>
      </div>
      {!isPremium && (
        <PremiumLock
          title={t("stats.pdfSection.lockTitle")}
          desc={t("stats.pdfSection.lockDesc")}
          ctaLabel={t("stats.tryPremium")}
          onOpenPremium={onOpenPremium}
        />
      )}
    </div>
  );
}
function RowLine({ label, value }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
      <span style={{ color: "#5C6E68" }}>{label}</span>
      <span style={{ color: "#24312E", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

/* ================= CHRONICLE (date range + collapsible rows) ================= */
function ChronicleSection({
  t,
  tc,
  lang,
  entries,
  isPremium,
  onOpenPremium,
  dateFrom,
  dateTo,
  onRangeChange,
}: any) {
  const [expanded, setExpanded] = useState(() => new Set());
  const filtered = entries.filter((e: any) => inRange(e.date, dateFrom, dateTo));

  const toggle = (id: any) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div style={{ marginBottom: 20, position: "relative" }}>
      <SectionHeader
        icon={BookOpen}
        title={t("stats.chronicleSection.title")}
        desc={t("stats.chronicleSection.desc")}
        isPremium={isPremium}
      />
      <div
        style={{
          filter: isPremium ? "none" : "blur(5px)",
          pointerEvents: isPremium ? "auto" : "none",
          minHeight: isPremium ? "auto" : 200,
        }}
      >
        <DateRangeBar tc={tc} from={dateFrom} to={dateTo} onChange={onRangeChange} />
        {filtered.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#8B9C96", textAlign: "center", padding: "16px 0" }}>
            {tc("chronicle.empty")}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((e: any) => {
              const isOpen = expanded.has(e.id);
              const sevLabel = t(
                "severity." + ({ 1: "mild", 2: "moderate", 3: "severe" } as any)[e.severity],
              );
              const tone = e.severity === 3 ? "berry" : e.severity === 2 ? "gold" : "teal";
              return (
                <div
                  key={e.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 14,
                    boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggle(e.id)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "none",
                      border: "none",
                      padding: "12px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#24312E",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatDateShort(e.date, lang)} · {e.time} · {t("types." + e.typeKey)}
                      </p>
                    </div>
                    <Pill_ tone={tone}>{sevLabel}</Pill_>
                    {isOpen ? (
                      <ChevronUp size={16} color="#5C6E68" />
                    ) : (
                      <ChevronDown size={16} color="#5C6E68" />
                    )}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 14px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        borderTop: "1px solid #EFF3F1",
                      }}
                    >
                      <div style={{ marginTop: 10 }}>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#8B9C96",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {t("stats.chronicleSection.auraLabel")}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: e.aura ? "#3A4A45" : "#8B9C96",
                            lineHeight: 1.5,
                          }}
                        >
                          {e.aura || t("stats.chronicleSection.noAura")}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#8B9C96",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {t("stats.chronicleSection.symptomsLabel")}
                        </p>
                        <TagList
                          items={e.symptomKeys.map((k: string) => t("symptoms." + k))}
                          tone="neutral"
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#8B9C96",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {t("stats.chronicleSection.triggersLabel")}
                        </p>
                        <TagList
                          items={e.triggerKeys.map((k: string) => t("triggers." + k))}
                          tone="teal"
                        />
                      </div>
                      {e.postState && (
                        <div>
                          <p
                            style={{
                              margin: "0 0 3px",
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: "#8B9C96",
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            {t("stats.chronicleSection.postStateLabel")}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: "#3A4A45", lineHeight: 1.5 }}>
                            {e.postState}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {!isPremium && (
        <PremiumLock
          title={t("stats.chronicleSection.lockTitle")}
          desc={t("stats.chronicleSection.lockDesc")}
          ctaLabel={t("stats.tryPremium")}
          onOpenPremium={onOpenPremium}
        />
      )}
    </div>
  );
}

/* ================= FOR YOU ================= */
const REGION_KEYS = ["eu", "usa", "mexico", "thailand"];
function ForYouScreen({
  t,
  tc,
  tx,
  forYouEntries,
  onAddForYou,
  onDeleteForYou,
  onEditForYou,
  region,
  autoRegion,
  gpsStatus,
  onChangeRegion,
  meds = [],
  tripItems = [],
  onAddTripItem,
  onToggleTripItem,
  onDeleteTripItem,
}: any) {
  const [text, setText] = useState<any>("");
  const [editId, setEditId] = useState<any>(null);
  const [editVal, setEditVal] = useState<any>("");
  const [openEntries, setOpenEntries] = useState(() => new Set());
  const [tripText, setTripText] = useState<any>("");
  const candidate = region || autoRegion || "eu";
  const effectiveRegion =
    REGION_KEYS.includes(candidate) && (REGION_NUMBERS as any)[candidate] ? candidate : "eu";
  const regionInfo = (REGION_NUMBERS as any)[effectiveRegion] || REGION_NUMBERS.eu;

  const handleSave = () => {
    const c = clamp(text.trim(), LIMITS.long);
    if (!c) return;
    onAddForYou(c);
    setText("");
  };
  const toggleEntry = (id: any) =>
    setOpenEntries((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const addTrip = () => {
    const c = clamp(tripText.trim(), LIMITS.name);
    if (!c) return;
    onAddTripItem(c);
    setTripText("");
  };
  const importMeds = () => {
    meds.forEach((m: any) =>
      onAddTripItem(clamp([m.name, m.dose].filter(Boolean).join(" · "), LIMITS.name)),
    );
  };

  return (
    <div>
      <TopBar title={t("forYou.title")} />
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            background: "#F3DEE7",
            borderRadius: 20,
            padding: 16,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Heart size={18} color="#A6416B" fill="#A6416B" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: "#6E2C48", lineHeight: 1.6 }}>
            {t("forYou.welcomeText")}
          </p>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#24312E" }}>
            {t("forYou.moodQuestion")}
          </p>
          <textarea
            rows={4}
            maxLength={LIMITS.long}
            placeholder={t("forYou.textPlaceholder") || undefined}
            value={text}
            onChange={(e) => setText(clamp(e.target.value, LIMITS.long))}
            style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            style={{ ...primaryBtn, width: "100%", marginTop: 10, opacity: text.trim() ? 1 : 0.5 }}
          >
            {tx("journal.save")}
          </button>
          {forYouEntries.length > 0 && (
            <>
              <p
                style={{
                  margin: "16px 0 8px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#8B9C96",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {t("forYou.pastEntries")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {forYouEntries.map((en: any) => {
                  const isOpen = openEntries.has(en.id) || editId === en.id;
                  return (
                    <div
                      key={en.id}
                      style={{ background: "#EFF3F1", borderRadius: 14, overflow: "hidden" }}
                    >
                      <button
                        onClick={() => toggleEntry(en.id)}
                        aria-expanded={isOpen}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "none",
                          border: "none",
                          padding: "11px 12px",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 11, color: "#5C6E68" }}>{en.date}</p>
                          {!isOpen && (
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 12.5,
                                color: "#3A4A45",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {en.text}
                            </p>
                          )}
                        </div>
                        {isOpen ? (
                          <ChevronUp size={15} color="#5C6E68" />
                        ) : (
                          <ChevronDown size={15} color="#5C6E68" />
                        )}
                      </button>
                      {isOpen && (
                        <div
                          style={{
                            padding: "0 12px 12px",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {editId === en.id ? (
                              <>
                                <textarea
                                  rows={3}
                                  value={editVal}
                                  onChange={(e) => setEditVal(clamp(e.target.value, LIMITS.long))}
                                  style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
                                />
                                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                  <button
                                    onClick={() => {
                                      onEditForYou(en.id, editVal.trim() || en.text);
                                      setEditId(null);
                                    }}
                                    style={{ ...primaryBtn, padding: "6px 10px", fontSize: 11 }}
                                  >
                                    {tc("common.save")}
                                  </button>
                                  <button
                                    onClick={() => setEditId(null)}
                                    style={{ ...secondaryBtn, padding: "6px 10px", fontSize: 11 }}
                                  >
                                    {tc("common.cancel")}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12.5,
                                  color: "#3A4A45",
                                  lineHeight: 1.5,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {en.text}
                              </p>
                            )}
                          </div>
                          {editId !== en.id && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <button
                                onClick={() => {
                                  setEditId(en.id);
                                  setEditVal(en.text);
                                }}
                                style={{
                                  background: "#FFFFFF",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 5,
                                  borderRadius: 8,
                                }}
                              >
                                <Edit3 size={12} color="#1B6B63" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(tc("files.confirmDelete")))
                                    onDeleteForYou(en.id);
                                }}
                                style={{
                                  background: "#F3DEE7",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 5,
                                  borderRadius: 8,
                                }}
                              >
                                <Trash2 size={12} color="#A6416B" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Podróż — packing checklist, 100% local. */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "#F3DEE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={16} color="#A6416B" />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#24312E" }}>
              {tx("trip.title")}
            </p>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tx("trip.desc")}
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={tripText}
              maxLength={LIMITS.name}
              placeholder={tx("trip.placeholder")}
              onChange={(e) => setTripText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTrip();
              }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addTrip}
              disabled={!tripText.trim()}
              style={{ ...primaryBtn, padding: "10px 14px", opacity: tripText.trim() ? 1 : 0.5 }}
            >
              {tx("trip.add")}
            </button>
          </div>
          <button
            onClick={importMeds}
            disabled={meds.length === 0}
            style={{
              ...secondaryBtn,
              width: "100%",
              marginBottom: 12,
              opacity: meds.length ? 1 : 0.5,
            }}
          >
            {meds.length ? tx("trip.importMeds") : tx("trip.noMeds")}
          </button>
          {tripItems.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: "#8B9C96" }}>{tx("trip.empty")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tripItems.map((it: any) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#EFF3F1",
                    borderRadius: 12,
                    padding: "9px 11px",
                  }}
                >
                  <button
                    onClick={() => onToggleTripItem(it.id)}
                    aria-pressed={it.done}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      border: it.done ? "none" : "1.5px solid #C3D2CD",
                      background: it.done ? "#1B6B63" : "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    {it.done && <Check size={13} color="#fff" />}
                  </button>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12.5,
                      color: it.done ? "#8B9C96" : "#24312E",
                      textDecoration: it.done ? "line-through" : "none",
                    }}
                  >
                    {it.label}
                  </span>
                  <button
                    onClick={() => onDeleteTripItem(it.id)}
                    style={{
                      background: "#F3DEE7",
                      border: "none",
                      cursor: "pointer",
                      padding: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={12} color="#A6416B" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "#DCEEEA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={16} color="#1B6B63" />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#24312E" }}>
              {t("forYou.travelTitle")}
            </p>
            {gpsStatus === "located" && !region && <Pill_ tone="teal">GPS ✓</Pill_>}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {t("forYou.travelDesc")}
          </p>
          <label style={{ display: "block", marginBottom: 12 }}>
            <span
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#5C6E68",
                marginBottom: 6,
              }}
            >
              {t("forYou.regionLabel")}
            </span>
            <select
              value={effectiveRegion}
              onChange={(e) => onChangeRegion(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {REGION_KEYS.map((r) => (
                <option key={r} value={r}>
                  {t("forYou.regions." + r)}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {regionInfo.numbers.map((n: any) => (
              <div
                key={n.number + n.labelKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#EFF3F1",
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#F3DEE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Phone size={15} color="#A6416B" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#24312E" }}>
                    {t("forYou." + n.labelKey)}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontFamily: "'Fraunces', serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: "#A6416B",
                    }}
                  >
                    {n.number}
                  </p>
                </div>
                <a
                  href={"tel:" + n.number}
                  style={{
                    background: "#A6416B",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: 11,
                    padding: "8px 13px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Phone size={12} /> {t("forYou.callButton")}
                </a>
              </div>
            ))}
          </div>
          {regionInfo.noteKey && (
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#8B9C96", lineHeight: 1.4 }}>
              ℹ️ {t("forYou." + regionInfo.noteKey)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
function ManageSubscriptionCard({ tx, license }: any) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 12,
          fontWeight: 700,
          color: "#8B9C96",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {tx("premium.subscription")}
      </p>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          const res = await openBillingPortal(license);
          if (!res.ok) {
            setErr(
              res.code === "portal_not_configured"
                ? tx("premium.portalNotConfigured")
                : res.code === "no_subscription" || res.code === "invalid_id"
                  ? tx("premium.portalNoSub")
                  : tx("premium.manageFailed"),
            );
            setBusy(false);
          }
        }}
        style={{ ...primaryGoldBtn, width: "100%", opacity: busy ? 0.7 : 1 }}
      >
        {tx("premium.manage")}
      </button>
      {err && <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "#A6416B" }}>{err}</p>}
    </div>
  );
}

function SettingsScreen({
  tc,
  t,
  tx,
  lang,
  onChangeLang,
  onBack,
  onExportJson,
  onExportZip,
  onImport,
  exportStatus,
  importStatus,
  isPremium,
  onOpenPremium,
  meds,
  onAddMed,
  onUpdateMed,
  onDeleteMed,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onRenameProfile,
  onDeleteProfile,
  pinHash,
  onSetPin,
  onSetRecovery,
  onClearPin,
  backupNow,
  license,
  licenseValid,
}: any) {
  // Zmiana nazwy profilu we własnym okienku — systemowe window.prompt bywa
  // niewygodne na telefonie (klawiatura zasłania pole, brak podglądu).
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newProfileName, setNewProfileName] = useState<any>("");
  const fileRef = useRef<any>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [medForm, setMedForm] = useState({ name: "", dose: "", times: "" });
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [timePick, setTimePick] = useState("08:00");
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );

  const requestPerm = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const r = await Notification.requestPermission();
      setNotifStatus(r);
    } catch {
      /* ignore */
    }
  };
  /** "7:20" -> "07:20". Godzina zawsze w formacie HH:MM. */
  const normalizeHM = (raw: string) => {
    const m = /^(\d{1,2})[:.](\d{1,2})$/.exec(String(raw).trim());
    if (!m) return "";
    const h = Math.min(23, Number(m[1]));
    const min = Math.min(59, Number(m[2]));
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };
  const medTimes = medForm.times
    .split(",")
    .map(normalizeHM)
    .filter(Boolean);

  const addPickedTime = () => {
    const t = normalizeHM(timePick);
    if (!t || medTimes.includes(t)) return;
    const next = [...medTimes, t].sort();
    setMedForm((f) => ({ ...f, times: next.join(",") }));
  };

  const removeTime = (t: string) => {
    const next = medTimes.filter((x) => x !== t);
    setMedForm((f) => ({ ...f, times: next.join(",") }));
  };

  const resetMedForm = () => {
    setMedForm({ name: "", dose: "", times: "" });
    setEditingMedId(null);
    setTimePick("08:00");
  };

  const submitMed = async () => {
    const name = clamp(medForm.name.trim(), LIMITS.name);
    const dose = clamp(medForm.dose.trim(), LIMITS.duration);
    const times = medTimes;
    if (!name || !times.length) return;

    if (editingMedId) {
      const existing = (meds || []).find((m: any) => m.id === editingMedId) || {};
      if (onUpdateMed) onUpdateMed({ ...existing, id: editingMedId, name, dose, times });
    } else {
      onAddMed({ id: "m" + Date.now(), name, dose, times });
    }
    resetMedForm();
    // Tak samo jak w kalendarzu: pytamy o zgodę od razu, przy dodawaniu,
    // żeby użytkownik nie sądził, że przypomnienie nie działa.
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      await requestPerm();
    }
  };

  return (
    <div>
      <TopBar title={tc("settings.title")} onBack={onBack} />
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tc("settings.language")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => onChangeLang(l.code)}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: lang === l.code ? "#1B6B63" : "#EFF3F1",
                  color: lang === l.code ? "#fff" : "#24312E",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profiles (Premium) — namespace all medical data by profile. */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#8B9C96",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                flex: 1,
              }}
            >
              {tx("profiles.title")}
            </p>
            {!isPremium && <Crown size={14} color="#B8863B" />}
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tx("profiles.desc")}
          </p>
          <div
            style={{
              filter: isPremium ? "none" : "blur(4px)",
              pointerEvents: isPremium ? "auto" : "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {renameId && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 8,
                    background: "#FFFFFF",
                    border: "1.5px solid #CDE0D9",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value.slice(0, 40))}
                    placeholder={tx("profiles.renamePrompt")}
                    style={{ ...inputStyle, flex: "1 1 150px", minWidth: 0 }}
                  />
                  <button
                    onClick={() => {
                      const n = renameValue.trim();
                      if (n) onRenameProfile(renameId, n);
                      setRenameId(null);
                    }}
                    style={{ ...primaryBtn, flex: "0 0 auto" }}
                  >
                    {tx("common.save")}
                  </button>
                  <button
                    onClick={() => setRenameId(null)}
                    style={{ ...secondaryBtn, flex: "0 0 auto" }}
                  >
                    {tx("cal.cancel")}
                  </button>
                </div>
              )}
              {(profiles || []).map((p: any) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: activeProfileId === p.id ? "#DCEEEA" : "#EFF3F1",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  <button
                    onClick={() => onSelectProfile(p.id)}
                    style={{
                      background: "none",
                      border: "none",
                      flex: 1,
                      minWidth: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#24312E",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {p.id === "default" && p.name === DEFAULT_PROFILE.name
                        ? tx("profile.default")
                        : p.name || tx("profile.default")}
                      {activeProfileId === p.id && (
                        <span
                          style={{
                            background: "#1B6B63",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          {tx("profiles.active")}
                        </span>
                      )}
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      setRenameId(p.id);
                      setRenameValue(
                        p.id === "default" && p.name === DEFAULT_PROFILE.name ? "" : p.name || "",
                      );
                    }}
                    aria-label={tx("profiles.renamePrompt")}
                    style={{
                      background: "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Edit3 size={12} color="#1B6B63" />
                  </button>
                  {(profiles || []).length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(tx("profiles.deleteConfirm", { name: p.name })))
                          onDeleteProfile(p.id);
                      }}
                      style={{
                        background: "#F3DEE7",
                        border: "none",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Trash2 size={12} color="#A6416B" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <input
                placeholder={tx("profiles.newName")}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value.slice(0, 40))}
                style={{ ...inputStyle, flex: "1 1 150px", minWidth: 0 }}
              />
              <button
                onClick={() => {
                  const n = newProfileName.trim();
                  if (n) {
                    onAddProfile(n);
                    setNewProfileName("");
                  }
                }}
                style={{ ...primaryBtn, flex: "0 0 auto", whiteSpace: "nowrap" }}
              >
                {tx("profiles.add")}
              </button>
            </div>
          </div>
          {!isPremium && (
            <button
              onClick={onOpenPremium}
              style={{
                position: "absolute",
                inset: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              aria-label={tx("premium.unlockAria")}
            />
          )}
        </div>

        <PinSettingsCard
          tx={tx}
          pinHash={pinHash}
          onSetPin={onSetPin}
          onSetRecovery={onSetRecovery}
          onClearPin={onClearPin}
          onBackup={backupNow}
        />

        {licenseValid && license && <ManageSubscriptionCard tx={tx} license={license} />}

        {/* Medication reminders */}

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tc("meds.title")}
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tc("meds.desc")}
          </p>
          {notifStatus !== "granted" && notifStatus !== "unsupported" && (
            <button
              onClick={requestPerm}
              style={{ ...secondaryBtn, width: "100%", marginBottom: 10 }}
            >
              {tc("meds.enableNotifs")}
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            <input
              placeholder={tc("meds.name")}
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: clamp(e.target.value, LIMITS.name) })}
              style={inputStyle}
            />
            <input
              placeholder={tc("meds.dose")}
              value={medForm.dose}
              onChange={(e) =>
                setMedForm({ ...medForm, dose: clamp(e.target.value, LIMITS.duration) })
              }
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
              <input
                type="time"
                value={timePick}
                onChange={(e) => setTimePick(e.target.value)}
                aria-label={tc("meds.timesPlaceholder")}
                style={{ ...inputStyle, flex: "1 1 auto", minWidth: 0 }}
              />
              <button
                onClick={addPickedTime}
                aria-label={tc("meds.addTime")}
                style={{
                  ...secondaryBtn,
                  flex: "0 0 auto",
                  width: "auto",
                  padding: "0 14px",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>
            {medTimes.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {medTimes.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#DCEEEA",
                      color: "#175048",
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {t}
                    <button
                      onClick={() => removeTime(t)}
                      aria-label={"× " + t}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                        color: "#175048",
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <button onClick={submitMed} style={{ ...primaryBtn, width: "100%" }}>
              {editingMedId ? tx("common.save") : tc("meds.add")}
            </button>
            {editingMedId && (
              <button onClick={resetMedForm} style={{ ...secondaryBtn, width: "100%" }}>
                {tx("cal.cancel")}
              </button>
            )}
            {meds.length > 0 && (
              <>
                <button
                  onClick={async () => {
                    const how = await shareOrDownloadMedsIcs(meds as any);
                    showToast(how === "shared" ? tx("cal.icsShared") : tx("meds.icsHint"));
                  }}
                  style={{
                    ...secondaryBtn,
                    width: "100%",
                    marginTop: 2,
                    borderStyle: "dashed",
                  }}
                >
                  {tc("meds.icsButton")}
                </button>
                <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.5, color: "#8B9C96" }}>
                  {tc("meds.icsHint")}
                </p>
              </>
            )}
          </div>
          {meds.length === 0 ? (
            <p style={{ fontSize: 12, color: "#8B9C96", textAlign: "center", margin: "6px 0" }}>
              {tc("meds.empty")}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {meds.map((m: any) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#EFF3F1",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
                      {m.name} {m.dose ? "· " + m.dose : ""}
                    </p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: "#5C6E68" }}>
                      {(m.times || []).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMedId(m.id);
                      setMedForm({
                        name: m.name || "",
                        dose: m.dose || "",
                        times: (m.times || []).join(","),
                      });
                      setTimePick((m.times && m.times[0]) || "08:00");
                    }}
                    aria-label={tx("meds.editAria")}
                    style={{
                      background: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Edit3 size={13} color="#1B6B63" />
                  </button>
                  <button
                    onClick={() => {
                      if (editingMedId === m.id) resetMedForm();
                      onDeleteMed(m.id);
                    }}
                    style={{
                      background: "#F3DEE7",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={13} color="#A6416B" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tc("settings.dataSection")}
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tc("settings.exportHint")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={onExportJson}
              style={{
                ...primaryBtn,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Download size={14} /> {tc("settings.exportJson")}
            </button>
            <button
              onClick={isPremium ? onExportZip : onOpenPremium}
              style={{
                ...primaryGoldBtn,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: isPremium ? 1 : 0.95,
                position: "relative",
              }}
            >
              {!isPremium && <Lock size={13} style={{ marginRight: 2 }} />}
              <Download size={14} /> {tc("settings.exportZip")}
              {!isPremium && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    background: "rgba(255,255,255,0.25)",
                    padding: "2px 6px",
                    borderRadius: 8,
                  }}
                >
                  PREMIUM
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json,application/zip,.zip"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current && fileRef.current.click()}
              style={{
                ...secondaryBtn,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Upload size={14} /> {tc("settings.importBackup")}
            </button>
          </div>
          {exportStatus && (
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#1B6B63", fontWeight: 600 }}>
              {exportStatus}
            </p>
          )}
          {importStatus && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 11.5,
                color: importStatus.ok ? "#1B6B63" : "#A6416B",
                fontWeight: 600,
              }}
            >
              {importStatus.msg}
            </p>
          )}
        </div>

        {/* Legal accordion */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tc("settings.legal")}
          </p>
          <button
            onClick={() => setLegalOpen((x) => !x)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#EFF3F1",
              border: "none",
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#24312E" }}>
              {tc("settings.terms")}
            </span>
            {legalOpen ? (
              <ChevronUp size={16} color="#5C6E68" />
            ) : (
              <ChevronDown size={16} color="#5C6E68" />
            )}
          </button>
          {legalOpen && (
            <div
              style={{
                marginTop: 10,
                background: "#EFF3F1",
                borderRadius: 12,
                padding: 12,
                fontSize: 12,
                color: "#3A4A45",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {tc("terms.body")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= PREMIUM (2 tiers) ================= */
function PremiumScreen({
  t,
  tc,
  tx,
  lang,
  isPremium,
  onActivate,
  onBack,
  initialTier = "annual",
}: any) {
  const [tier, setTier] = useState(initialTier);
  const [justActivated, setJustActivated] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<any>(null);

  // Real Stripe Checkout (test mode): ask the serverless endpoint for a session
  // URL, then hand the user over to Stripe's hosted payment page.
  const startCheckout = async () => {
    setCheckoutError(null);
    setCheckoutBusy(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Stripe error");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError((err && (err as any).message) || tx("premium.checkoutError"));
      setCheckoutBusy(false);
    }
  };

  const monthlyPrice = tc("premium.monthlyPrice");
  const annualPrice = tc("premium.annualPrice");
  const perMonth = tc("premium.perMonth");
  const perYear = tc("premium.perYear");

  const benefits = [
    { icon: Sparkles, title: t("premium.benefitAITitle"), desc: t("premium.benefitAIDesc") },
    { icon: FileText, title: t("premium.benefitPDFTitle"), desc: t("premium.benefitPDFDesc") },
    { icon: ScanLine, title: t("premium.benefitScanTitle"), desc: t("premium.benefitScanDesc") },
  ];

  if (isPremium || justActivated) {
    return (
      <div>
        <TopBar title={t("premium.badge")} onBack={onBack} />
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(184,134,59,0.4)",
            }}
          >
            <Crown size={34} color="#fff" fill="#fff" />
          </div>
          <h2
            style={{ fontFamily: "'Fraunces', serif", fontSize: 22, margin: 0, color: "#24312E" }}
          >
            {t("premium.activatedTitle")}
          </h2>
          <button
            onClick={onBack}
            style={{ ...primaryGoldBtn, marginTop: 22, padding: "13px 26px" }}
          >
            {t("premium.backToApp")}
          </button>
        </div>
      </div>
    );
  }

  const PlanCard = ({ id, title, price, per, badge, highlighted }: any) => {
    const on = tier === id;
    return (
      <button
        type="button"
        onClick={() => setTier(id)}
        aria-pressed={on}
        style={{
          position: "relative",
          flex: 1,
          background: on ? "#FFF6E4" : "#FFFFFF",
          border: on ? `2.5px solid ${GOLD}` : "1.5px solid #DCE5E1",
          borderRadius: 16,
          padding: "16px 12px",
          cursor: "pointer",
          textAlign: "center",
          transition: "all .15s ease",
          boxShadow: on
            ? "0 8px 20px rgba(184,134,59,0.30)"
            : highlighted
              ? "0 4px 12px rgba(36,49,46,0.08)"
              : "0 1px 3px rgba(36,49,46,0.05)",
        }}
      >
        {badge && (
          <span
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: GOLD,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        )}
        {on && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 18,
              height: 18,
              borderRadius: 999,
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={11} color="#fff" />
          </span>
        )}
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            fontWeight: 700,
            color: on ? "#7A5A28" : "#5C6E68",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "'Fraunces', serif",
            fontSize: 21,
            fontWeight: 600,
            color: on ? GOLD : "#24312E",
          }}
        >
          {price}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5C6E68" }}>{per}</p>
        {on && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 10,
              fontWeight: 700,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tx("premium.selected")}
          </p>
        )}
      </button>
    );
  };

  return (
    <div>
      <TopBar title={t("premium.badge")} onBack={onBack} />
      <div style={{ padding: "0 20px 30px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "#F3E8D3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Crown size={26} color={GOLD} fill={GOLD} />
          </div>
          <h2
            style={{ fontFamily: "'Fraunces', serif", fontSize: 21, margin: 0, color: "#24312E" }}
          >
            {t("premium.title")}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#5C6E68" }}>
            {t("premium.subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: "#F3E8D3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={GOLD} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#24312E" }}>
                    {b.title}
                  </p>
                  <p
                    style={{ margin: "2px 0 0", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.4 }}
                  >
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 18, marginTop: 4 }}>
          <PlanCard
            id="monthly"
            title={tc("premium.monthly")}
            price={monthlyPrice}
            per={perMonth}
          />
          <PlanCard
            id="annual"
            title={tc("premium.annual")}
            price={annualPrice}
            per={perYear}
            badge={tc("premium.save35")}
            highlighted
          />
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Pill_ tone="gold">
              {tier === "monthly"
                ? `${monthlyPrice} ${perMonth}`
                : `${annualPrice} ${perYear} · ${tc("premium.save35")}`}
            </Pill_>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={startCheckout}
              disabled={checkoutBusy}
              style={{
                ...primaryGoldBtn,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: checkoutBusy ? 0.7 : 1,
              }}
            >
              <CreditCard size={15} color="#fff" />
              {checkoutBusy
                ? "…"
                : `${tx("premium.selectPlan")} · ${tier === "monthly" ? monthlyPrice : annualPrice}`}
            </button>
            {checkoutError && (
              <p style={{ margin: 0, fontSize: 11.5, color: "#A6416B", textAlign: "center" }}>
                {checkoutError}
              </p>
            )}
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 10.5,
              color: "#8B9C96",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {tx("premium.securePayment")}
          </p>
          <PremiumRecovery tx={tx} onActivate={onActivate} />
        </div>
      </div>
    </div>
  );
}

/* ================= FREEMIUM MODAL (2 tiers, translated) ================= */
function FreemiumModal({ tc, t, tx, limit, onClose, onUpgrade }: any) {
  const [tier, setTier] = useState("annual");
  const tileStyle = (on: boolean): React.CSSProperties => ({
    flex: 1,
    background: on ? "#FFF6E4" : "#FFFFFF",
    borderRadius: 12,
    padding: "12px 8px",
    border: on ? `2.5px solid ${GOLD}` : "1.5px solid #E4DCCB",
    position: "relative",
    cursor: "pointer",
    textAlign: "center",
    boxShadow: on ? "0 6px 16px rgba(184,134,59,0.28)" : "none",
  });
  return (
    <ModalShell onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            background: "#F3E8D3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 20px rgba(184,134,59,0.35)",
          }}
        >
          <Crown size={30} color={GOLD} fill={GOLD} />
        </div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, margin: 0, color: "#24312E" }}>
          {t("premium.title")}
        </h2>
        <p style={{ margin: "10px 0 4px", fontSize: 13, color: "#5C6E68", lineHeight: 1.5 }}>
          {t("premium.subtitle")}
        </p>
        <ul
          style={{
            textAlign: "left",
            margin: "10px auto 16px",
            padding: 0,
            listStyle: "none",
            fontSize: 12.5,
            color: "#3A4A45",
            lineHeight: 1.8,
            maxWidth: 280,
          }}
        >
          <li>✓ {t("premium.benefitAITitle")}</li>
          <li>✓ {t("premium.benefitPDFTitle")}</li>
          <li>✓ {t("premium.benefitScanTitle")}</li>
        </ul>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, marginTop: 6 }}>
          <button
            type="button"
            onClick={() => setTier("monthly")}
            aria-pressed={tier === "monthly"}
            style={tileStyle(tier === "monthly")}
          >
            {tier === "monthly" && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: GOLD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={10} color="#fff" />
              </span>
            )}
            <p
              style={{
                margin: 0,
                fontSize: 10.5,
                color: "#7A5A28",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {tc("premium.monthly")}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: "'Fraunces', serif",
                fontSize: 16,
                fontWeight: 600,
                color: GOLD,
              }}
            >
              {tc("premium.monthlyPrice")}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#7A5A28" }}>
              {tc("premium.perMonth")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setTier("annual")}
            aria-pressed={tier === "annual"}
            style={tileStyle(tier === "annual")}
          >
            <span
              style={{
                position: "absolute",
                top: -8,
                right: 6,
                background: GOLD,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 999,
              }}
            >
              {tc("premium.save35")}
            </span>
            {tier === "annual" && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: GOLD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={10} color="#fff" />
              </span>
            )}
            <p
              style={{
                margin: 0,
                fontSize: 10.5,
                color: "#7A5A28",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {tc("premium.annual")}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: "'Fraunces', serif",
                fontSize: 16,
                fontWeight: 600,
                color: GOLD,
              }}
            >
              {tc("premium.annualPrice")}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#7A5A28" }}>
              {tc("premium.perYear")}
            </p>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => onUpgrade(tier)} style={{ ...primaryGoldBtn, width: "100%" }}>
            {tc("premium.choosePlan")}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#5C6E68",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: 6,
            }}
          >
            {tc("common.cancel")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ================= APP ROOT ================= */
function EpiluminaAppInner() {
  // Multi-profile (Premium) — all per-user data is namespaced by active profile id.
  const { profiles, activeId, setActiveId, addProfile, renameProfile, deleteProfile } =
    useProfiles();
  const [lang, setLang] = usePersistentState("epilumina.lang", "pl");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const [rawEntries, setEntries] = usePersistentState<any[]>(pkey(activeId, "entries"), []);
  // Always newest-first, whatever order they were stored in. An imported or
  // restored backup can be chronological, which used to make the dashboard show
  // the OLDEST seizure as "last seizure".
  const entries = useMemo(
    () =>
      [...(rawEntries || [])].sort((a: any, b: any) =>
        ((b.date || "") + "T" + (b.time || "00:00")).localeCompare(
          (a.date || "") + "T" + (a.time || "00:00"),
        ),
      ),
    [rawEntries],
  );
  const [progressJournal, setProgressJournal] = usePersistentState<any[]>(
    pkey(activeId, "progress"),
    [],
  );
  // Medical documents live in IndexedDB (no 5 MB localStorage cap on iOS).
  const {
    documents,
    addDocument: idbAddDocument,
    renameDocument: idbRenameDocument,
    deleteDocument: idbDeleteDocument,
  } = useIdbDocuments(activeId);
  const [calendarEvents, setCalendarEvents] = usePersistentState<any>(
    pkey(activeId, "calEvents"),
    [],
  );
  const [tripItems, setTripItems] = usePersistentState<any>(pkey(activeId, "trip"), []);
  const [forYouEntries, setForYouEntries] = usePersistentState<any>(pkey(activeId, "forYou"), []);
  // Premium comes ONLY from a licence verified server-side with Stripe.
  // The dev-only crown toggle is compiled out of production builds.
  const { license, isValid: licenseValid, activate: activateLicense } = useLicense();
  const [devPremium, setDevPremium] = usePersistentState("epilumina.devPremium", false);
  const isPremium = licenseValid || (import.meta.env.DEV && devPremium);
  const [manualRegion, setManualRegion] = usePersistentState<any>(pkey(activeId, "region"), null);
  const [pinHash, setPinHash, pinHydrated] = usePersistentState("epilumina.pinHash", "");
  const [pinRecovery, setPinRecovery] = usePersistentState("epilumina.pinRecovery", "");
  const [unlocked, setUnlocked] = useState(false);
  const [termsAccepted, setTermsAccepted, termsHydrated] = usePersistentState(
    "epilumina.termsAccepted",
    false,
  );
  const [premiumTier, setPremiumTier] = useState("annual");
  const [meds, setMeds] = usePersistentState<any>(pkey(activeId, "meds"), []);
  const [ketoReadings, setKetoReadings] = usePersistentState<any>(pkey(activeId, "keto"), []);

  const [autoRegion, setAutoRegion] = useState<any>(null);
  const [gpsStatus, setGpsStatus] = useState("pending");
  const [screen, setScreen] = useState("dashboard");
  const [openId, setOpenId] = useState<any>(null);
  const [editingId, setEditingId] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [showFreemium, setShowFreemium] = useState(false);
  const [showQuota, setShowQuota] = useState(false);
  const [exportStatus, setExportStatus] = useState<any>("");
  const [importStatus, setImportStatus] = useState<any>(null);

  const isDesktop = useIsDesktop();
  const FREE_ENTRY_LIMIT = 5;
  const t = useT(lang);
  const tc = useCommonT(lang);
  const tx = useExtraT(lang);

  const showToast = (msg: any) => {
    setToast(msg);
    window.clearTimeout((showToast as any)._tm);
    (showToast as any)._tm = window.setTimeout(() => setToast(null), 2600);
  };
  // Pierwsze uruchomienie: weź język z telefonu, ale nigdy nie nadpisuj
  // wyboru dokonanego wcześniej w aplikacji.
  useEffect(() => {
    try {
      if (window.localStorage.getItem("epilumina.lang")) return;
      const detected = detectUiLang();
      if (detected && detected !== lang) setLang(detected);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort: ask the browser not to evict this origin's local data.
  useEffect(() => {
    try {
      navigator.storage?.persist?.();
    } catch {
      /* ignore */
    }
  }, []);

  // Dziennik istnieje tylko na tym telefonie, więc co 30 dni przypominamy
  // o kopii zapasowej. Przypomnienie jest stałą kartą (nie znika po chwili),
  // można je odłożyć o kolejne 30 dni.
  const [backupDue, setBackupDue] = useState(false);
  useEffect(() => {
    try {
      const last = Number(window.localStorage.getItem("epilumina.lastBackupAt") || 0);
      const snooze = Number(window.localStorage.getItem("epilumina.backupSnoozeUntil") || 0);
      const days = last ? (Date.now() - last) / 86400000 : Infinity;
      const hasData = entries.length > 0 || (documents?.length || 0) > 0 || ketoReadings.length > 0;
      setBackupDue(hasData && days >= 30 && Date.now() > snooze);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length, documents?.length, ketoReadings.length]);

  const snoozeBackup = () => {
    try {
      window.localStorage.setItem(
        "epilumina.backupSnoozeUntil",
        String(Date.now() + 30 * 86400000),
      );
    } catch {
      /* ignore */
    }
    setBackupDue(false);
  };

  const markBackupDone = () => {
    try {
      window.localStorage.setItem("epilumina.lastBackupAt", String(Date.now()));
      window.localStorage.removeItem("epilumina.backupSnoozeUntil");
    } catch {
      /* ignore */
    }
    setBackupDue(false);
  };

  const backupBanner = backupDue ? (
    <div
      style={{
        margin: "0 20px 10px",
        background: "#FFF6E5",
        border: "1px solid #EFD9A8",
        borderRadius: 14,
        padding: 13,
      }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 12.5, fontWeight: 800, color: "#7A5A17" }}>
        {tx("backup.askTitle")}
      </p>
      <p style={{ margin: "0 0 10px", fontSize: 11.5, lineHeight: 1.55, color: "#6B5217" }}>
        {tx("backup.askBody")}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            void (isPremium ? handleExportZip() : handleExportJson());
          }}
          style={{
            flex: "1 1 150px",
            background: "#7A5A17",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tx("backup.download")}
        </button>
        <button
          onClick={snoozeBackup}
          style={{
            flex: "0 0 auto",
            background: "#FFFFFF",
            color: "#7A5A17",
            border: "1px solid #EFD9A8",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tx("backup.later")}
        </button>
      </div>
    </div>
  ) : null;
  // GPS auto-region
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const fallback = () => {
      try {
        setAutoRegion(detectRegionFromLocale());
      } catch {
        setAutoRegion("eu");
      }
      setGpsStatus("fallback");
    };
    if (!navigator.geolocation) return fallback();
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const r = detectRegionFromCoords(pos.coords.latitude, pos.coords.longitude);
          if (r) {
            setAutoRegion(r);
            setGpsStatus("located");
          } else {
            fallback();
          }
        },
        fallback,
        { timeout: 6000, maximumAge: 600000 },
      );
    } catch {
      fallback();
    }
  }, []);

  // Return from Stripe Checkout. The URL only carries a session id — Premium is
  // unlocked only after the server confirms with Stripe that it was paid.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch {
      return;
    }
    const sessionId = params.get("checkout_session");
    const payment = params.get("payment");
    if (!sessionId && !payment) return;
    try {
      window.history.replaceState({}, "", window.location.pathname);
    } catch {
      /* ignore */
    }
    if (payment === "cancelled") {
      showToast(tx("premium.paymentCancelled"));
      return;
    }
    if (!sessionId) return;
    showToast(tx("premium.paymentVerifying"));
    activateLicense(sessionId).then((ok) => {
      showToast(ok ? tx("premium.paymentOk") : tx("premium.paymentFailed"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quota event listener
  useEffect(() => {
    const handler = () => setShowQuota(true);
    window.addEventListener("epilumina:quota", handler);
    return () => window.removeEventListener("epilumina:quota", handler);
  }, []);

  // Register the reminder service worker once — best-effort background push
  // via Notification Triggers (Chrome Android) + catch-up on visibility.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
    const onVis = () => {
      try {
        navigator.serviceWorker.controller?.postMessage({ type: "catchup" });
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Medication reminders — foreground timer (fires while app tab is open) +
  // SW schedule (best-effort background via Notification Triggers).
  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    // Foreground catch-up while tab is open.
    const fired = new Set();
    const tick = () => {
      const now = new Date();
      const hm =
        String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const dayKey = now.toISOString().slice(0, 10);
      meds.forEach((m: any) => {
        (m.times || []).forEach((tt: string) => {
          const k = dayKey + "|" + m.id + "|" + tt;
          if (tt === hm && !fired.has(k)) {
            fired.add(k);
            void showLocalNotification(
              tc("meds.notifTitle"),
              fillTemplate(tc("meds.notifBody"), { name: m.name, dose: m.dose || "" }),
              "epi-med-" + m.id,
            );
          }
        });
      });
    };
    const id = window.setInterval(tick, 30000);
    tick();

    // Gdy aplikacja była zamknięta o godzinie dawki, nadrabiamy po otwarciu
    // (okno 4 godzin wstecz, jednorazowo na dobę dla każdej dawki).
    try {
      const seen = firedSet();
      const fresh: string[] = [];
      const nowD = new Date();
      const dayKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}-${String(
        nowD.getDate(),
      ).padStart(2, "0")}`;
      for (const m of meds) {
        for (const tt of m.times || []) {
          const t = /^(\d{1,2}):(\d{2})/.exec(String(tt));
          if (!t) continue;
          const due = new Date(
            nowD.getFullYear(),
            nowD.getMonth(),
            nowD.getDate(),
            Number(t[1]),
            Number(t[2]),
            0,
            0,
          ).getTime();
          if (due > nowD.getTime() || due < nowD.getTime() - 4 * 3600 * 1000) continue;
          const key = `med|${m.id}|${dayKey}|${tt}`;
          if (seen.has(key)) continue;
          fresh.push(key);
          void showLocalNotification(
            tc("meds.notifTitle"),
            fillTemplate(tc("meds.notifBody"), { name: m.name, dose: m.dose || "" }),
            "epi-med-" + m.id,
          );
        }
      }
      if (fresh.length) markFired(fresh);
    } catch {
      /* ignore */
    }

    // Push a 7-day schedule to the SW for background firing where supported.
    try {
      const reminders: any[] = [];
      const now = Date.now();
      for (let d = 0; d < 7; d++) {
        meds.forEach((m: any) => {
          (m.times || []).forEach((tt: any) => {
            const [hh, mm] = tt.split(":").map((n: string) => parseInt(n, 10));
            if (isNaN(hh) || isNaN(mm)) return;
            const dt = new Date();
            dt.setHours(hh, mm, 0, 0);
            dt.setDate(dt.getDate() + d);
            if (dt.getTime() > now + 30000) {
              reminders.push({
                id: m.id,
                ts: dt.getTime(),
                title: tc("meds.notifTitle"),
                body: fillTemplate(tc("meds.notifBody"), { name: m.name, dose: m.dose || "" }),
              });
            }
          });
        });
      }
      const post = () =>
        navigator.serviceWorker?.controller?.postMessage({ type: "schedule", reminders });
      if (navigator.serviceWorker?.controller) post();
      else
        navigator.serviceWorker?.ready.then(post).catch(() => {
          /* ignore */
        });
    } catch {
      /* ignore */
    }

    return () => window.clearInterval(id);
  }, [meds, tc]);

  const sortEntries = (list: any[]) =>
    [...list].sort((a, b) =>
      ((b.date || "") + "T" + (b.time || "00:00")).localeCompare(
        (a.date || "") + "T" + (a.time || "00:00"),
      ),
    );

  const goAdd = () => {
    if (!isPremium && entries.length >= FREE_ENTRY_LIMIT) {
      setShowFreemium(true);
      return;
    }
    setEditingId(null);
    setScreen("add");
  };

  const handleSaveEntry = (form: any) => {
    if (editingId) {
      setEntries((prev) =>
        sortEntries(prev.map((e) => (e.id === editingId ? { ...e, ...form } : e))),
      );
      setEditingId(null);
      setScreen("log");
      showToast(tc("settings.importSuccess"));
    } else {
      if (!isPremium && entries.length >= FREE_ENTRY_LIMIT) {
        setShowFreemium(true);
        return;
      }
      const entry = { ...form, id: "e" + Date.now() };
      setEntries((prev) => sortEntries([entry, ...prev]));
      setScreen("dashboard");
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setScreen("log");
    setOpenId(null);
  };
  const handleEditEntry = (id: any) => {
    setEditingId(id);
    setScreen("add");
  };

  const handleAddProgress = (text: any) =>
    setProgressJournal((prev) => [{ id: "p" + Date.now(), date: todayISO(), text }, ...prev]);
  const handleDeleteProgress = (id: string) =>
    setProgressJournal((prev) => prev.filter((p) => p.id !== id));
  const handleEditProgress = (id: string, text: any) =>
    setProgressJournal((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));

  const handleAddDocument = (doc: any) => {
    idbAddDocument(doc);
  };
  const handleRenameDocument = (id: string, name: string) => {
    idbRenameDocument(id, name);
  };
  const handleDeleteDocument = (id: string) => {
    idbDeleteDocument(id);
  };

  const handleAddCalendarEvent = (ev: any) => setCalendarEvents((prev: any) => [ev, ...prev]);
  const handleUpdateCalendarEvent = (ev: any) =>
    setCalendarEvents((prev: any) => prev.map((e: any) => (e.id === ev.id ? ev : e)));
  const handleDeleteCalendarEvent = (id: any) =>
    setCalendarEvents((prev: any) => prev.filter((e: any) => e.id !== id));

  const handleAddTripItem = (label: any) =>
    setTripItems((prev: any) =>
      prev.some((i: any) => i.label === label)
        ? prev
        : [
            ...prev,
            { id: "tr" + Date.now() + Math.random().toString(36).slice(2, 5), label, done: false },
          ],
    );
  const handleToggleTripItem = (id: any) =>
    setTripItems((prev: any) => prev.map((i: any) => (i.id === id ? { ...i, done: !i.done } : i)));
  const handleDeleteTripItem = (id: any) =>
    setTripItems((prev: any) => prev.filter((i: any) => i.id !== id));

  const handleAddForYou = (text: any) => {
    setForYouEntries((prev: any) => [{ id: "f" + Date.now(), date: todayISO(), text }, ...prev]);
    showToast(t("forYou.savedToast"));
  };
  const handleDeleteForYou = (id: any) =>
    setForYouEntries((prev: any) => prev.filter((e: any) => e.id !== id));
  const handleEditForYou = (id: any, text: any) =>
    setForYouEntries((prev: any) => prev.map((e: any) => (e.id === id ? { ...e, text } : e)));

  const handleAddKetoReading = (r: any) =>
    setKetoReadings((prev: any) => [r, ...prev].slice(0, 400));
  const handleDeleteKetoReading = (id: any) =>
    setKetoReadings((prev: any) => prev.filter((r: any) => r.id !== id));

  const handleAddMed = (m: any) => setMeds((prev: any) => [m, ...prev]);
  const handleUpdateMed = (m: any) =>
    setMeds((prev: any) => prev.map((x: any) => (x.id === m.id ? { ...x, ...m } : x)));
  const handleDeleteMed = (id: any) => setMeds((prev: any) => prev.filter((m: any) => m.id !== id));

  // DEV only: the crown toggles Premium for testing. In production it just opens the Premium screen.
  const handleToggleCrown = import.meta.env.DEV
    ? () => {
        const next = !devPremium;
        setDevPremium(next);
        showToast(next ? t("devToastPremiumOn") : t("devToastPremiumOff"));
      }
    : () => setScreen("premium");

  const openEntry = (id: any) => {
    setOpenId(id);
    setScreen("detail");
  };
  const currentEntry = entries.find((e) => e.id === openId);
  const editingEntry = editingId ? entries.find((e) => e.id === editingId) : null;

  const navigate = (key: any) => {
    if (key === "add") return goAdd();
    if (key === "diet" && !isPremium) {
      setShowFreemium(true);
      return;
    }
    setScreen(key);
  };

  // Full backup: every profile, all seizure entries, calendar events, medication
  // reminders, diet data, settings and every stored attachment.
  const buildPayload = () => buildFullBackup();

  const _download = (blob: Blob, name: string) => downloadBlob(blob, name);

  const handleExportJson = async () => {
    try {
      await downloadFullBackupJson();
      markBackupDone();
      setExportStatus(tc("settings.exportSuccess"));
      window.setTimeout(() => setExportStatus(""), 3500);
    } catch {
      setExportStatus("");
    }
  };

  const handleExportZip = async () => {
    try {
      const zip = new JSZip();
      const payload = await buildPayload();
      zip.file("epilumina.json", JSON.stringify(payload, null, 2));
      // human-readable CSV
      const csvRows = [
        ["Data", "Godzina", "Typ", "Czas trwania", "Nasilenie", "Objawy", "Wyzwalacze", "Notatki"],
      ];
      entries.forEach((e) =>
        csvRows.push([
          e.date || "",
          e.time || "",
          t("types." + e.typeKey),
          e.duration || "",
          String(e.severity || ""),
          (e.symptomKeys || []).map((k: string) => t("symptoms." + k)).join(" | "),
          (e.triggerKeys || []).map((k: string) => t("triggers." + k)).join(" | "),
          (e.notes || "").replace(/\n/g, " "),
        ]),
      );
      const csv = csvRows
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      zip.file("Historia_Choroby.csv", "\ufeff" + csv);
      // human-readable HTML
      const esc = (s: string) =>
        String(s ?? "").replace(
          /[&<>"']/g,
          (c: string) =>
            (
              ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
                string,
                string
              >
            )[c],
        );
      const rows = entries
        .map(
          (e) =>
            `<tr><td>${esc(e.date)} ${esc(e.time)}</td><td>${esc(t("types." + e.typeKey))}</td><td>${esc(e.duration)}</td><td>${e.severity}</td><td>${esc((e.symptomKeys || []).map((k: string) => t("symptoms." + k)).join(", "))}</td><td>${esc((e.triggerKeys || []).map((k: string) => t("triggers." + k)).join(", "))}</td><td>${esc(e.notes)}</td></tr>`,
        )
        .join("");
      zip.file(
        "Dziennik.html",
        `<!doctype html><meta charset="utf-8"><title>Epilumina — Dziennik</title><style>body{font-family:system-ui;padding:24px;color:#24312E}h1{color:#1B6B63;font-family:Georgia,serif}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #DCE5E1;padding:6px 8px;text-align:left;vertical-align:top}th{background:#DCEEEA;color:#175048}</style><h1>Epilumina — Historia Choroby</h1><p>Wygenerowano: ${new Date().toLocaleString()}</p><table><thead><tr><th>Data</th><th>Typ</th><th>Czas</th><th>Nasilenie</th><th>Objawy</th><th>Wyzwalacze</th><th>Notatki</th></tr></thead><tbody>${rows}</tbody></table>`,
      );
      // documents folder — every attachment of every profile, as real files
      const docsFolder = zip.folder("Dokumenty_Medyczne");
      (payload.documents || []).forEach((d, i) => {
        if (!d || !d.dataUrl) return;
        const m = /^data:([^;]+);base64,(.*)$/.exec(d.dataUrl);
        if (!m) return;
        const base = ((d.profileId || "default") + "_" + (d.name || `plik_${i + 1}`))
          .replace(/[^\p{L}\p{N}._-]+/gu, "_")
          .slice(0, 120);
        try {
          (docsFolder as any).file(base, m[2], { base64: true });
        } catch {
          /* ignore */
        }
      });
      const blob = await zip.generateAsync({ type: "blob" });
      _download(blob, "Epilumina_Kopia_Zapasowa.zip");
      markBackupDone();
      setExportStatus(tc("settings.exportSuccess"));
      window.setTimeout(() => setExportStatus(""), 3500);
    } catch {
      setExportStatus("");
    }
  };

  const handleImport = async (
    file:
      | string
      | number[]
      | Blob
      | ArrayBuffer
      | Uint8Array<ArrayBufferLike>
      | NodeJS.ReadableStream
      | Promise<
          | string
          | number[]
          | Blob
          | ArrayBuffer
          | Uint8Array<ArrayBufferLike>
          | NodeJS.ReadableStream
        >,
  ) => {
    try {
      // Detect ZIP by magic bytes (PK\x03\x04)
      const head = new Uint8Array(await (file as any).slice(0, 4).arrayBuffer());
      const isZip = head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
      let data;
      if (isZip) {
        const zip = await JSZip.loadAsync(file);
        const jsonFile = zip.file("epilumina.json");
        if (!jsonFile) throw new Error("no epilumina.json");
        data = JSON.parse(await jsonFile.async("string"));
      } else {
        data = JSON.parse(await (file as any).text());
      }
      await restoreFullBackup(data);
      setImportStatus({ ok: true, msg: tc("settings.importSuccess") });
      // Reload so every screen reads the restored data from storage.
      window.setTimeout(() => {
        try {
          window.location.reload();
        } catch {
          /* ignore */
        }
      }, 900);
    } catch {
      setImportStatus({ ok: false, msg: tc("settings.importError") });
    }
    window.setTimeout(() => setImportStatus(null), 4000);
  };

  let screenEl = null;
  if (screen === "dashboard") {
    screenEl = (
      <Dashboard
        t={t}
        tc={tc}
        tx={tx}
        lang={lang}
        calendarEvents={calendarEvents}
        onChangeLang={setLang}
        entries={entries}
        onNavigate={navigate}
        onOpenEntry={openEntry}
        isPremium={isPremium}
        onToggleCrown={handleToggleCrown}
        onOpenSettings={() => setScreen("settings")}
        patientName={
          activeId === "default" ? "" : profiles.find((p) => p.id === activeId)?.name || ""
        }
      />
    );
  } else if (screen === "log") {
    screenEl = (
      <LogScreen
        t={t}
        tc={tc}
        lang={lang}
        entries={entries}
        onOpenEntry={openEntry}
        onBack={() => setScreen("dashboard")}
        progressJournal={progressJournal}
        onAddProgress={handleAddProgress}
        onDeleteEntry={handleDeleteEntry}
        onEditEntry={handleEditEntry}
        onDeleteProgress={handleDeleteProgress}
        onEditProgress={handleEditProgress}
      />
    );
  } else if (screen === "detail") {
    screenEl = (
      <DetailScreen
        t={t}
        tc={tc}
        lang={lang}
        entry={currentEntry}
        onBack={() => setScreen("log")}
        onDelete={handleDeleteEntry}
        onEdit={handleEditEntry}
      />
    );
  } else if (screen === "add") {
    screenEl = (
      <AddEntryScreen
        t={t}
        tc={tc}
        onBack={() => {
          setEditingId(null);
          setScreen(editingId ? "log" : "dashboard");
        }}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
      />
    );
  } else if (screen === "stats") {
    screenEl = (
      <StatsScreen
        t={t}
        tc={tc}
        tx={tx}
        lang={lang}
        patientName={
          activeId === "default" ? "" : profiles.find((p) => p.id === activeId)?.name || ""
        }
        ketoReadings={ketoReadings}
        entries={entries}
        documents={documents}
        onAddDocument={handleAddDocument}
        onRenameDocument={handleRenameDocument}
        onDeleteDocument={handleDeleteDocument}
        progressJournal={progressJournal}
        isPremium={isPremium}
        onOpenPremium={() => setScreen("premium")}
        calendarEvents={calendarEvents}
        onAddCalendarEvent={handleAddCalendarEvent}
        onUpdateCalendarEvent={handleUpdateCalendarEvent}
        onDeleteCalendarEvent={handleDeleteCalendarEvent}
        meds={meds}
      />
    );
  } else if (screen === "forYou") {
    screenEl = (
      <ForYouScreen
        t={t}
        tc={tc}
        tx={tx}
        forYouEntries={forYouEntries}
        onAddForYou={handleAddForYou}
        onDeleteForYou={handleDeleteForYou}
        onEditForYou={handleEditForYou}
        region={manualRegion}
        autoRegion={autoRegion}
        gpsStatus={gpsStatus}
        onChangeRegion={(r: any) => setManualRegion(REGION_KEYS.includes(r) ? r : null)}
        meds={meds}
        tripItems={tripItems}
        onAddTripItem={handleAddTripItem}
        onToggleTripItem={handleToggleTripItem}
        onDeleteTripItem={handleDeleteTripItem}
      />
    );
  } else if (screen === "diet") {
    screenEl = (
      <KetoScreen
        tc={tc}
        lang={lang}
        profileId={activeId}
        isPremium={isPremium}
        onOpenPremium={() => setScreen("premium")}
        readings={ketoReadings}
        onAddReading={handleAddKetoReading}
        onDeleteReading={handleDeleteKetoReading}
      />
    );
  } else if (screen === "premium") {
    screenEl = (
      <PremiumScreen
        t={t}
        tc={tc}
        tx={tx}
        initialTier={premiumTier}
        lang={lang}
        isPremium={isPremium}
        onActivate={activateLicense}
        onBack={() => setScreen("dashboard")}
      />
    );
  } else if (screen === "settings") {
    screenEl = (
      <SettingsScreen
        tc={tc}
        t={t}
        tx={tx}
        lang={lang}
        onChangeLang={setLang}
        onBack={() => setScreen("dashboard")}
        onExportJson={handleExportJson}
        onExportZip={handleExportZip}
        onImport={handleImport}
        exportStatus={exportStatus}
        importStatus={importStatus}
        isPremium={isPremium}
        onOpenPremium={() => setScreen("premium")}
        meds={meds}
        onAddMed={handleAddMed}
        onUpdateMed={handleUpdateMed}
        onDeleteMed={handleDeleteMed}
        profiles={profiles}
        activeProfileId={activeId}
        onSelectProfile={setActiveId}
        onAddProfile={addProfile}
        onRenameProfile={renameProfile}
        onDeleteProfile={deleteProfile}
        pinHash={pinHash}
        onSetPin={(h: any) => {
          setPinHash(h);
          setUnlocked(true);
        }}
        onSetRecovery={(h: any) => setPinRecovery(h)}
        onClearPin={() => {
          setPinHash("");
          setPinRecovery("");
          setUnlocked(true);
        }}
        backupNow={() => {
          if (isPremium) void handleExportZip();
          else void handleExportJson();
        }}
        license={license}
        licenseValid={licenseValid}
      />
    );
  }

  // Sidebar (tablet/desktop only)
  const navItems = [
    { key: "dashboard", icon: Home, label: t("nav.home") },
    { key: "log", icon: BookOpen, label: t("nav.log") },
    { key: "add", icon: Plus, label: t("nav.add") },
    { key: "diet", icon: Salad, label: t("nav.diet") },
    { key: "stats", icon: BarChart3, label: t("nav.stats") },
    { key: "forYou", icon: Heart, label: t("nav.forYou") },
    { key: "settings", icon: SettingsIcon, label: tc("settings.title") },
  ];
  const activeKey = screen === "detail" ? "log" : screen;

  if (pinHydrated && pinHash && !unlocked) {
    return (
      <PinLockScreen
        tx={tx}
        pinHash={pinHash}
        recoveryHash={pinRecovery}
        onUnlock={() => setUnlocked(true)}
        onRecover={() => {
          // Odblokowanie po kodzie odzyskiwania (albo po PIN-ie sprzed
          // wprowadzenia kodów). Blokadę zdejmujemy, dane zostają nietknięte.
          setPinHash("");
          setPinRecovery("");
          setUnlocked(true);
        }}
      />
    );
  }

  if (isDesktop) {
    return (
      <div
        className="epi-minh"
        style={{ background: "#DCE5E1", display: "flex", fontFamily: "'Lexend', sans-serif" }}
      >
        <aside
          className="epi-fullh"
          style={{
            width: 240,
            background: "#FFFFFF",
            borderRight: "1px solid #DCE5E1",
            padding: "22px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            position: "sticky",
            top: 0,
          }}
        >
          <div
            style={{ padding: "0 8px 18px", borderBottom: "1px solid #EFF3F1", marginBottom: 10 }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Fraunces', serif",
                fontSize: 20,
                fontWeight: 600,
                color: "#1B6B63",
              }}
            >
              Epilumina
            </p>
          </div>
          {navItems.map((it) => {
            const Icon = it.icon;
            const active = activeKey === it.key;
            return (
              <button
                key={it.key}
                onClick={() => navigate(it.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: active ? "#DCEEEA" : "transparent",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: active ? "#1B6B63" : "#5C6E68",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon size={16} /> {it.label}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", padding: 8 }}>
            <PremiumCrownButton onClick={handleToggleCrown} isPremium={isPremium} />
          </div>
        </aside>
        <main
          style={{
            flex: 1,
            minWidth: 0,
            background: "#EFF3F1",
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {backupBanner}
            {screenEl}
          </div>
        </main>
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#24312E",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 14,
              padding: "11px 18px",
              boxShadow: "0 8px 24px rgba(20,30,28,0.35)",
              zIndex: 100,
            }}
          >
            {toast}
          </div>
        )}
        {showFreemium && (
          <FreemiumModal
            tc={tc}
            t={t}
            tx={tx}
            limit={FREE_ENTRY_LIMIT}
            onClose={() => setShowFreemium(false)}
            onUpgrade={(tier: any) => {
              setShowFreemium(false);
              setPremiumTier(tier || "annual");
              setScreen("premium");
            }}
          />
        )}
        {showQuota && <QuotaModal tc={tc} onClose={() => setShowQuota(false)} />}
        {termsHydrated && !termsAccepted && (
          <TermsModal tc={tc} onAccept={() => setTermsAccepted(true)} onImport={handleImport} />
        )}
      </div>
    );
  }

  return (
    <div
      className="epi-minh"
      style={{ background: "#DCE5E1", display: "flex", justifyContent: "center" }}
    >
      <div
        className="epi-minh"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#EFF3F1",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Lexend', sans-serif",
          position: "relative",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 12, paddingBottom: 8 }}>
          {backupBanner}
          {screenEl}
        </div>
        {screen !== "premium" && (
          <BottomNav
            current={screen === "detail" ? "log" : screen === "settings" ? "dashboard" : screen}
            onNavigate={navigate}
            t={t}
            isPremium={isPremium}
          />
        )}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 86,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#24312E",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 14,
              padding: "11px 18px",
              boxShadow: "0 8px 24px rgba(20,30,28,0.35)",
              zIndex: 100,
              maxWidth: "85vw",
              textAlign: "center",
            }}
          >
            {toast}
          </div>
        )}
        {showFreemium && (
          <FreemiumModal
            tc={tc}
            t={t}
            tx={tx}
            limit={FREE_ENTRY_LIMIT}
            onClose={() => setShowFreemium(false)}
            onUpgrade={(tier: any) => {
              setShowFreemium(false);
              setPremiumTier(tier || "annual");
              setScreen("premium");
            }}
          />
        )}
        {showQuota && <QuotaModal tc={tc} onClose={() => setShowQuota(false)} />}
        {termsHydrated && !termsAccepted && (
          <TermsModal tc={tc} onAccept={() => setTermsAccepted(true)} onImport={handleImport} />
        )}
      </div>
    </div>
  );
}

export default function EpiluminaApp() {
  return (
    <EpiluminaErrorBoundary>
      <EpiluminaAppInner />
    </EpiluminaErrorBoundary>
  );
}
