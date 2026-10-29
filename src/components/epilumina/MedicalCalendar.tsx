/* eslint-disable */
/* EPILUMINA — Kalendarz medyczny. 100% on-device.
 * Miesięczna siatka z kropkami zdarzeń + dodawanie wydarzeń z przypomnieniem
 * przez systemowe Notification API (działa lokalnie, bez serwera).
 */
import { isUpcoming } from "@/lib/epilumina-calendar";
import { firedSet, markFired, shareOrDownloadIcs, showLocalNotification } from "@/lib/epilumina-notify";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Bell,
  X,
  Check,
  Pencil,
} from "lucide-react";

const TEAL = "#1B6B63";
const BERRY = "#A6416B";
const GOLD = "#B8863B";
const LOCALE_MAP = { pl: "pl-PL", en: "en-GB", de: "de-DE", zh: "zh-CN", es: "es-ES", fr: "fr-FR" };

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => iso(new Date());

const inputStyle: any = {
  width: "100%",
  border: "1px solid #DCE5E1",
  background: "#FFFFFF",
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 14,
  color: "#24312E",
  boxSizing: "border-box",
  outline: "none",
};

function Card({ children, style }: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 1px 3px rgba(36,49,46,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Time input isolated in its own state so iPadOS 15 Safari never loses focus:
 * the value is only pushed upwards on change, never reformatted or clamped. */
function TimeInput({ value, onChange, ariaLabel }: any) {
  return (
    <input
      type="time"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, minHeight: 44 }}
    />
  );
}

function EventModal({ tx, initial, onClose, onSave }: any) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [date, setDate] = useState(initial ? initial.date : todayISO());
  const [time, setTime] = useState(initial ? initial.time : "10:00");
  const [remind, setRemind] = useState(initial ? !!initial.remind : false);
  const [remindTime, setRemindTime] = useState(
    initial && initial.remindTime ? initial.remindTime : "09:00",
  );

  const save = () => {
    const n = name.trim().slice(0, 80);
    if (!n) return;
    onSave({
      id: initial ? initial.id : "ev" + Date.now(),
      name: n,
      date,
      time: time || "00:00",
      remind,
      remindTime: remind ? remindTime || time : null,
    });
  };

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
        zIndex: 320,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: 20,
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3
            style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: "#24312E" }}
          >
            {tx("cal.newEvent")}
          </h3>
          <button
            onClick={onClose}
            aria-label={tx("cal.cancel")}
            style={{
              background: "#EFF3F1",
              border: "none",
              borderRadius: 10,
              padding: 7,
              cursor: "pointer",
            }}
          >
            <X size={15} color="#5C6E68" />
          </button>
        </div>

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
            {tx("cal.name")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tx("cal.namePh")}
            style={inputStyle}
          />
        </label>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <label style={{ flex: 1 }}>
            <span
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#5C6E68",
                marginBottom: 6,
              }}
            >
              {tx("cal.date")}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, minHeight: 44 }}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#5C6E68",
                marginBottom: 6,
              }}
            >
              {tx("cal.time")}
            </span>
            <TimeInput value={time} onChange={setTime} ariaLabel={tx("cal.time")} />
          </label>
        </div>

        <div style={{ background: "#EFF3F1", borderRadius: 14, padding: 12, marginBottom: 14 }}>
          <button
            onClick={() => setRemind((r) => !r)}
            aria-pressed={remind}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                width: 42,
                height: 24,
                borderRadius: 999,
                background: remind ? TEAL : "#C8D4D0",
                position: "relative",
                flexShrink: 0,
                transition: "background .15s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: remind ? 21 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#fff",
                  transition: "left .15s",
                }}
              />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#24312E", textAlign: "left" }}>
              {tx("cal.remind")}
            </span>
          </button>
          {remind && (
            <label style={{ display: "block", marginTop: 10 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#5C6E68",
                  marginBottom: 6,
                }}
              >
                {tx("cal.remindTime")}
              </span>
              <TimeInput
                value={remindTime}
                onChange={setRemindTime}
                ariaLabel={tx("cal.remindTime")}
              />
            </label>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "#fff",
              color: "#5C6E68",
              border: "1px solid #DCE5E1",
              borderRadius: 14,
              padding: 13,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tx("cal.cancel")}
          </button>
          <button
            onClick={save}
            disabled={!name.trim()}
            style={{
              flex: 1,
              background: TEAL,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: 13,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            {tx("cal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedicalCalendar({
  tx,
  lang,
  events = [],
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  entries = [],
  progressJournal = [],
  meds = [],
}: any) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayISO());
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );
  const timers = useRef<any>([]);

  const locale = (LOCALE_MAP as any)[lang] || "en-GB";

  const marks = useMemo(() => {
    const m = {};
    const put = (date: string, kind: string) => {
      if (!date) return;
      ((m as any)[date] = (m as any)[date] || new Set()).add(kind);
    };
    entries.forEach((e: any) => put(e.date, "seizure"));
    progressJournal.forEach((p: any) => put(p.date, "note"));
    events.forEach((e: any) => put(e.date, "event"));
    if (meds.length > 0) {
      // medication days: mark the current month's days (daily doses)
      const y = cursor.getFullYear(),
        mo = cursor.getMonth();
      const days = new Date(y, mo + 1, 0).getDate();
      for (let d = 1; d <= days; d++) put(iso(new Date(y, mo, d)), "med");
    }
    return m;
  }, [entries, progressJournal, events, meds, cursor]);

  // Schedule real system notifications for reminders while the app is running.
  useEffect(() => {
    timers.current.forEach((t: any) => window.clearTimeout(t));
    timers.current = [];
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = Date.now();
    events.forEach((ev: any) => {
      if (!ev.remind || !ev.remindTime) return;
      const target = new Date(`${ev.date}T${ev.remindTime}:00`).getTime();
      const delay = target - now;
      if (delay > 0 && delay < 24 * 3600 * 1000) {
        const id = window.setTimeout(() => {
          void showLocalNotification(
            tx("cal.notifTitle", { name: ev.name }),
            tx("cal.notifBody", { time: ev.time }),
            "epi-cal-" + ev.id,
          );
        }, delay);
        timers.current.push(id);
      }
    });
    return () => {
      timers.current.forEach((t: any) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [events, perm, tx]);

  // Gdy aplikacja była zamknięta w momencie przypomnienia, nadrabiamy po
  // otwarciu — jednorazowo, z okna ostatnich 12 godzin.
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = Date.now();
    const fired = firedSet();
    const fresh: string[] = [];
    events.forEach((ev: any) => {
      if (!ev.remind || !ev.remindTime || !ev.date) return;
      const target = new Date(`${ev.date}T${ev.remindTime}:00`).getTime();
      if (Number.isNaN(target)) return;
      if (target > now || target < now - 12 * 3600 * 1000) return;
      const key = `cal|${ev.id}|${ev.date}|${ev.remindTime}`;
      if (fired.has(key)) return;
      fresh.push(key);
      void showLocalNotification(
        tx("cal.notifTitle", { name: ev.name }),
        tx("cal.notifBody", { time: ev.time }),
        "epi-cal-" + ev.id,
      );
    });
    if (fresh.length) markFired(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const [icsBusy] = useState(false);
  const [icsMsg, setIcsMsg] = useState("");

  const askPerm = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const r = await Notification.requestPermission();
      setPerm(r);
    } catch {
      /* ignore */
    }
  };

  const y = cursor.getFullYear(),
    mo = cursor.getMonth();
  const firstDay = new Date(y, mo, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(iso(new Date(y, mo, d)));

  const weekLabels = useMemo(() => {
    const base = new Date(2024, 0, 1); // Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }).slice(0, 2),
    );
  }, [locale]);

  const dayEvents = events
    .filter((e: any) => e.date === selected)
    .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
  // Only events still ahead of the current moment (past ones drop off the list).
  const upcoming = events
    .filter((e: any) => isUpcoming(e))
    .sort((a: any, b: any) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
    .slice(0, 6);

  const DOT = { seizure: BERRY, event: TEAL, note: GOLD, med: "#8B9C96" };

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#DCEEEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CalIcon size={17} color={TEAL} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#24312E" }}>
              {tx("cal.title")}
            </h3>
            <span
              style={{
                background: "#F3E8D3",
                color: GOLD,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.4,
                padding: "3px 7px",
                borderRadius: 999,
              }}
            >
              PREMIUM
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.4 }}>
            {tx("cal.desc")}
          </p>
        </div>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <button
            onClick={() => setCursor(new Date(y, mo - 1, 1))}
            aria-label="prev"
            style={{
              background: "#EFF3F1",
              border: "none",
              borderRadius: 10,
              padding: 7,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={15} color="#5C6E68" />
          </button>
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#24312E",
              textTransform: "capitalize",
            }}
          >
            {firstDay.toLocaleDateString(locale, { month: "long", year: "numeric" })}
          </p>
          <button
            onClick={() => setCursor(new Date(y, mo + 1, 1))}
            aria-label="next"
            style={{
              background: "#EFF3F1",
              border: "none",
              borderRadius: 10,
              padding: 7,
              cursor: "pointer",
            }}
          >
            <ChevronRight size={15} color="#5C6E68" />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {weekLabels.map((w, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#8B9C96",
                textTransform: "uppercase",
                paddingBottom: 4,
              }}
            >
              {w}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={"e" + i} />;
            const isToday = date === todayISO();
            const isSel = date === selected;
            const kinds = (marks as any)[date] ? Array.from((marks as any)[date]) : ([] as any[]);
            return (
              <button
                key={date}
                onClick={() => setSelected(date)}
                style={{
                  aspectRatio: "1 / 1",
                  minHeight: 38,
                  borderRadius: 11,
                  border: isToday ? `1.5px solid ${TEAL}` : "1px solid transparent",
                  background: isSel ? "#DCEEEA" : "#F6F9F8",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isSel || isToday ? 700 : 500,
                    color: "#24312E",
                  }}
                >
                  {Number(date.slice(8, 10))}
                </span>
                <span style={{ display: "flex", gap: 2, height: 5 }}>
                  {kinds.slice(0, 4).map((k) => (
                    <span
                      key={k}
                      style={{ width: 4, height: 4, borderRadius: 3, background: (DOT as any)[k] }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {[
            ["seizure", tx("cal.legendSeizure")],
            ["event", tx("cal.legendEvent")],
            ["note", tx("cal.legendNote")],
            ["med", tx("cal.legendMed")],
          ].map(([k, label]) => (
            <span
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10.5,
                color: "#5C6E68",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 4, background: (DOT as any)[k] }} />{" "}
              {label}
            </span>
          ))}
        </div>
      </Card>

      <button
        onClick={() => setShowModal(true)}
        style={{
          width: "100%",
          marginTop: 10,
          background: TEAL,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: 13,
          fontSize: 13.5,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <Plus size={15} /> {tx("cal.add")}
      </button>

      {perm !== "granted" && perm !== "unsupported" && (
        <button
          onClick={askPerm}
          style={{
            width: "100%",
            marginTop: 8,
            background: "#fff",
            color: "#5C6E68",
            border: "1px solid #DCE5E1",
            borderRadius: 14,
            padding: 11,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Bell size={14} /> {perm === "denied" ? tx("cal.notifDenied") : tx("cal.notifAsk")}
        </button>
      )}
      {perm === "granted" && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            color: TEAL,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Check size={12} /> {tx("cal.notifOn")}
        </p>
      )}

      <button
        onClick={async () => {
          if (icsBusy) return;
          // Najpierw próbujemy systemowego okna "Udostępnij" — wtedy wystarczy
          // wybrać Kalendarz i wydarzenie dopisze się od razu. Dopiero gdy
          // telefon tego nie potrafi, pobieramy plik i tłumaczymy, co zrobić.
          const how = await shareOrDownloadIcs(events as any);
          setIcsMsg(how === "shared" ? tx("cal.icsShared") : tx("cal.icsAfter"));
          window.setTimeout(() => setIcsMsg(""), 12000);
        }}
        disabled={icsBusy}
        style={{
          width: "100%",
          marginTop: 8,
          background: "#F2F7F5",
          color: "#17504A",
          border: "1px dashed #B9D2CB",
          borderRadius: 14,
          padding: 11,
          fontSize: 12.5,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <CalIcon size={14} /> {tx("cal.icsButton")}
      </button>
      <p style={{ margin: "6px 2px 0", fontSize: 10.5, lineHeight: 1.5, color: "#8B9C96" }}>
        {tx("cal.icsHint")}
      </p>
      {icsMsg && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11.5,
            lineHeight: 1.5,
            color: "#7A5A17",
            background: "#FFF6E5",
            border: "1px solid #EFD9A8",
            borderRadius: 10,
            padding: "9px 11px",
          }}
        >
          {icsMsg}
        </p>
      )}

      <Card style={{ marginTop: 12 }}>
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
          {tx("cal.dayEvents")}
        </p>
        {dayEvents.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "#8B9C96" }}>{tx("cal.empty")}</p>
        ) : (
          dayEvents.map((ev: any) => (
            <div
              key={ev.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid #EFF3F1",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
                  {ev.name}
                </p>
                <p style={{ margin: "1px 0 0", fontSize: 11, color: "#5C6E68" }}>
                  {ev.time}
                  {ev.remind && ev.remindTime ? ` · 🔔 ${ev.remindTime}` : ""}
                </p>
              </div>
              <button
                onClick={() => setEditEvent(ev)}
                aria-label={tx("cal.newEvent")}
                style={{
                  background: "#EFF3F1",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                }}
              >
                <Pencil size={13} color={TEAL} />
              </button>
              <button
                onClick={() => onDeleteEvent(ev.id)}
                aria-label={tx("cal.delete")}
                style={{
                  background: "#F3DEE7",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                }}
              >
                <Trash2 size={13} color={BERRY} />
              </button>
            </div>
          ))
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
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
          {tx("cal.upcoming")}
        </p>
        {upcoming.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "#8B9C96" }}>{tx("cal.empty")}</p>
        ) : (
          upcoming.map((ev: any) => (
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
                {new Date(ev.date + "T00:00:00").toLocaleDateString(locale, {
                  day: "2-digit",
                  month: "short",
                })}{" "}
                · {ev.time}
              </span>
            </div>
          ))
        )}
      </Card>

      {(showModal || editEvent) && (
        <EventModal
          tx={tx}
          initial={editEvent}
          onClose={() => {
            setShowModal(false);
            setEditEvent(null);
          }}
          onSave={(ev: any) => {
            if (editEvent && onUpdateEvent) onUpdateEvent(ev);
            else onAddEvent(ev);
            setShowModal(false);
            setEditEvent(null);
            setSelected(ev.date);
            if (
              ev.remind &&
              typeof Notification !== "undefined" &&
              Notification.permission !== "granted"
            )
              askPerm();
          }}
        />
      )}
    </div>
  );
}
