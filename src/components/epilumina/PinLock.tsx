/* Optional 4-digit PIN lock — 100% on-device (localStorage), ES2015-safe.
 * Disabled by default: without a stored PIN the app boots straight to the dashboard.
 */
import { useState } from "react";
import { Lock, Delete, KeyRound } from "lucide-react";
import { checkRecovery, hashPin, hashRecovery, makeRecoveryCode } from "@/lib/epilumina-pin";

type T = (k: string, v?: Record<string, string | number>) => string;

const TEAL = "#1B6B63";

/** Do porównania przepisanego kodu: bez myślników, spacji i wielkości liter. */
function normalizeRetyped(v: string) {
  return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export { hashPin };

function Keypad({
  value,
  onChange,
  onSubmit,
  tx,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (pin: string) => void;
  tx: T;
}) {
  const press = (d: string) => {
    if (value.length >= 4) return;
    const next = value + d;
    onChange(next);
    if (next.length === 4) window.setTimeout(() => onSubmit(next), 120);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, margin: "18px 0 22px" }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: i < value.length ? TEAL : "#D5E0DC",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          maxWidth: 260,
          margin: "0 auto",
        }}
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} style={keyStyle}>
            {d}
          </button>
        ))}
        <span />
        <button onClick={() => press("0")} style={keyStyle}>
          0
        </button>
        <button
          onClick={() => onChange(value.slice(0, -1))}
          style={{ ...keyStyle, background: "transparent", boxShadow: "none" }}
          aria-label={tx("pin.delete")}
        >
          <Delete size={18} color="#5C6E68" />
        </button>
      </div>
    </div>
  );
}

const keyStyle: any = {
  border: "none",
  borderRadius: 16,
  padding: "14px 0",
  fontSize: 20,
  fontWeight: 700,
  color: "#24312E",
  background: "#FFFFFF",
  boxShadow: "0 1px 3px rgba(36,49,46,0.08)",
  cursor: "pointer",
};

/** Full-screen lock shown at startup when a PIN is configured. */
export function PinLockScreen({
  pinHash,
  recoveryHash = "",
  onUnlock,
  onRecover,
  tx,
}: {
  pinHash: string;
  recoveryHash?: string;
  onUnlock: () => void;
  onRecover?: () => void;
  tx: T;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [askRecovery, setAskRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const tryRecover = () => {
    if (checkRecovery(code, recoveryHash)) {
      setCodeError("");
      if (onRecover) onRecover();
      else onUnlock();
      return;
    }
    setCodeError(tx("pin.recoveryWrong"));
    setCode("");
  };
  const submit = (pin: string) => {
    if (hashPin(pin) === pinHash) {
      onUnlock();
      return;
    }
    setError(tx("pin.wrong"));
    setValue("");
  };
  return (
    <div
      className="epi-minh"
      style={{
        background: "#EFF3F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Lexend', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: "#DCEEEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Lock size={22} color={TEAL} />
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "'Fraunces', serif",
            fontSize: 22,
            fontWeight: 600,
            color: TEAL,
          }}
        >
          Epilumina
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#5C6E68" }}>{tx("pin.enter")}</p>
        <Keypad
          tx={tx}
          value={value}
          onChange={(v: string) => {
            setValue(v);
            setError("");
          }}
          onSubmit={submit}
        />
        {error && (
          <p style={{ margin: "14px 0 0", fontSize: 12, fontWeight: 700, color: "#A6416B" }}>
            {error}
          </p>
        )}

        {!askRecovery && (
          <button
            onClick={() => {
              setAskRecovery(true);
              setCode("");
              setCodeError("");
            }}
            style={{
              marginTop: 18,
              background: "transparent",
              border: "none",
              color: "#5C6E68",
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {tx("pin.forgot")}
          </button>
        )}

        {askRecovery && recoveryHash && (
          <div
            style={{
              marginTop: 16,
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 14,
              textAlign: "left",
              boxShadow: "0 1px 3px rgba(36,49,46,0.08)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "#8B9C96",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <KeyRound size={12} /> {tx("pin.recoveryAsk")}
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid #DCE5E1",
                borderRadius: 10,
                padding: "11px 12px",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                textAlign: "center",
                color: "#24312E",
                textTransform: "uppercase",
                outline: "none",
              }}
            />
            {codeError && (
              <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "#A6416B" }}>
                {codeError}
              </p>
            )}
            <button
              onClick={tryRecover}
              style={{
                marginTop: 10,
                width: "100%",
                background: TEAL,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tx("pin.recoveryUnlock")}
            </button>
            <button
              onClick={() => setAskRecovery(false)}
              style={{
                marginTop: 8,
                width: "100%",
                background: "#EFF3F1",
                color: "#3A4A45",
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tx("pin.cancel")}
            </button>
          </div>
        )}

        {askRecovery && !recoveryHash && (
          <div
            style={{
              marginTop: 16,
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 14,
              textAlign: "left",
              boxShadow: "0 1px 3px rgba(36,49,46,0.08)",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.55, color: "#5C6E68" }}>
              {tx("pin.recoveryNone")}
            </p>
            <button
              onClick={() => onRecover && onRecover()}
              style={{
                width: "100%",
                background: "#A6416B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              {tx("pin.recoveryNoneBtn")}
            </button>
            <button
              onClick={() => setAskRecovery(false)}
              style={{
                width: "100%",
                background: "#EFF3F1",
                color: "#3A4A45",
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tx("pin.cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Settings card: toggle PIN protection and change the code. */
export function PinSettingsCard({
  pinHash,
  onSetPin,
  onSetRecovery,
  onClearPin,
  onBackup,
  tx,
}: {
  pinHash: string;
  onSetPin: (h: string) => void;
  onSetRecovery?: (h: string) => void;
  onClearPin: () => void;
  onBackup?: () => void;
  tx: T;
}) {
  const [mode, setMode] = useState<null | "set" | "confirm" | "recovery">(null);
  const [first, setFirst] = useState("");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [recovery, setRecovery] = useState("");
  const [retyped, setRetyped] = useState("");
  const enabled = !!pinHash;

  const start = () => {
    setMode("set");
    setFirst("");
    setValue("");
    setMsg("");
  };
  const cancel = () => {
    setMode(null);
    setFirst("");
    setValue("");
    setMsg("");
    setRecovery("");
    setRetyped("");
  };

  const submit = (pin: string) => {
    if (mode === "set") {
      setFirst(pin);
      setValue("");
      setMode("confirm");
      setMsg(tx("pin.repeat"));
      return;
    }
    if (pin !== first) {
      setValue("");
      setMode("set");
      setFirst("");
      setMsg(tx("pin.mismatch"));
      return;
    }
    // PIN poprawny — generujemy kod odzyskiwania i pokazujemy go RAZ.
    setRecovery(makeRecoveryCode());
    setRetyped("");
    setMsg("");
    setMode("recovery");
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 1px 3px rgba(36,49,46,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#8B9C96",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {tx("pin.title")}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#5C6E68", lineHeight: 1.5 }}>
            {tx("pin.desc")}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          aria-label={tx("pin.title")}
          onClick={() => {
            if (enabled) {
              onClearPin();
              cancel();
            } else start();
          }}
          style={{
            width: 46,
            height: 27,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: enabled ? TEAL : "#D5E0DC",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: enabled ? 22 : 3,
              width: 21,
              height: 21,
              borderRadius: 999,
              background: "#fff",
              transition: "left .15s",
            }}
          />
        </button>
      </div>

      {enabled && mode === null && (
        <button
          onClick={start}
          style={{
            marginTop: 12,
            width: "100%",
            border: "none",
            borderRadius: 12,
            padding: "10px 0",
            background: "#EFF3F1",
            color: TEAL,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tx("pin.change")}
        </button>
      )}

      {mode === "recovery" && (
        <div style={{ marginTop: 14 }}>
          <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
            {tx("pin.recoveryTitle")}
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, lineHeight: 1.55, color: "#5C6E68" }}>
            {tx("pin.recoveryIntro")}
          </p>
          <div
            style={{
              background: "#F2F7F5",
              border: "1.5px dashed #9BB0AA",
              borderRadius: 12,
              padding: "14px 10px",
              textAlign: "center",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 4,
              color: TEAL,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              userSelect: "all",
            }}
          >
            {recovery}
          </div>

          <div
            style={{
              marginTop: 12,
              background: "#FFF6E5",
              border: "1px solid #EFD9A8",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#7A5A17" }}>
              {tx("pin.warnTitle")}
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                fontSize: 11.5,
                lineHeight: 1.55,
                color: "#6B5217",
              }}
            >
              <li>{tx("pin.warn1")}</li>
              <li>{tx("pin.warn2")}</li>
              <li>{tx("pin.warn3")}</li>
            </ul>
            {onBackup && (
              <button
                onClick={onBackup}
                style={{
                  marginTop: 10,
                  width: "100%",
                  background: "#FFFFFF",
                  color: "#7A5A17",
                  border: "1px solid #EFD9A8",
                  borderRadius: 10,
                  padding: "10px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tx("pin.backup")}
              </button>
            )}
          </div>

          <p style={{ margin: "14px 0 6px", fontSize: 11.5, fontWeight: 700, color: "#24312E" }}>
            {tx("pin.retype")}
          </p>
          <input
            value={retyped}
            onChange={(e) => setRetyped(e.target.value.toUpperCase().slice(0, 12))}
            placeholder="XXXX-XXXX"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border:
                retyped && normalizeRetyped(retyped) !== normalizeRetyped(recovery)
                  ? "1.5px solid #C0392B"
                  : "1.5px solid #DCE5E1",
              borderRadius: 10,
              padding: "11px 12px",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 3,
              textAlign: "center",
              color: "#24312E",
              textTransform: "uppercase",
              outline: "none",
            }}
          />
          {retyped && normalizeRetyped(retyped) !== normalizeRetyped(recovery) && (
            <p style={{ margin: "8px 0 0", fontSize: 11.5, fontWeight: 700, color: "#A6416B" }}>
              {tx("pin.retypeMismatch")}
            </p>
          )}

          <button
            disabled={normalizeRetyped(retyped) !== normalizeRetyped(recovery)}
            onClick={() => {
              onSetPin(hashPin(first));
              if (onSetRecovery) onSetRecovery(hashRecovery(recovery));
              cancel();
            }}
            style={{
              marginTop: 12,
              width: "100%",
              background: TEAL,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 700,
              cursor:
                normalizeRetyped(retyped) !== normalizeRetyped(recovery) ? "not-allowed" : "pointer",
              opacity: normalizeRetyped(retyped) !== normalizeRetyped(recovery) ? 0.45 : 1,
            }}
          >
            {tx("pin.recoveryConfirm")}
          </button>
          <button
            onClick={cancel}
            style={{
              marginTop: 8,
              width: "100%",
              background: "#EFF3F1",
              color: "#3A4A45",
              border: "none",
              borderRadius: 12,
              padding: "11px 0",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tx("pin.cancel")}
          </button>
        </div>
      )}

      {mode !== null && mode !== "recovery" && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#24312E" }}>
            {mode === "set" ? tx("pin.set") : tx("pin.repeat")}
          </p>
          <Keypad tx={tx} value={value} onChange={setValue} onSubmit={submit} />
          {msg && (
            <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "#A6416B", fontWeight: 700 }}>
              {msg}
            </p>
          )}
          <button
            onClick={cancel}
            style={{
              marginTop: 12,
              background: "transparent",
              border: "none",
              color: "#5C6E68",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tx("pin.cancel")}
          </button>
        </div>
      )}
    </div>
  );
}
