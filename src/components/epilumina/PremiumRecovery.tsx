// Purchase recovery — the Premium licence lives only on this device, so a
// customer who paid but never made it back from Stripe (closed tab, new phone,
// another browser) can paste a Stripe identifier or the licence code copied
// from another device and unlock Premium again.
//
// 100% on-device: the identifier is the only thing sent, and only to our own
// /api/verify-checkout-session endpoint, which confirms it with Stripe.
import { useState } from "react";

// Checkout session, subscription or subscription item — whichever is easiest to find.
const REF_ID = /^(?:cs_(?:test|live)|sub|si)_[A-Za-z0-9]{6,200}$/;

export default function PremiumRecovery({ tx, onActivate }: any) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async () => {
    const id = value.trim();
    if (!REF_ID.test(id)) {
      setOk(false);
      setMsg(tx("premium.recoverInvalid"));
      return;
    }
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      // The server decides — never this component.
      const res = await onActivate(id);
      setOk(!!res?.ok);
      setMsg(
        res?.deviceLimit
          ? tx("premium.deviceLimit")
          : res?.ok
            ? tx("premium.paymentOk")
            : tx("premium.paymentFailed"),
      );
    } catch {
      setOk(false);
      setMsg(tx("premium.paymentFailed"));
    }
    setBusy(false);
  };

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #EFF3F1" }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#24312E" }}>
        {tx("premium.recoverTitle")}
      </p>
      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#5C6E68", lineHeight: 1.45 }}>
        {tx("premium.recoverHint")}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 220))}
          placeholder="cs_… / sub_… / si_…"
          spellCheck={false}
          autoComplete="off"
          aria-label={tx("premium.recoverTitle")}
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid #E1E7E4",
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 12,
            color: "#24312E",
            outline: "none",
          }}
        />
        <button
          onClick={submit}
          disabled={busy || !value.trim()}
          style={{
            background: "#EFF3F1",
            color: "#1B6B63",
            border: "none",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: busy || !value.trim() ? "default" : "pointer",
            opacity: busy || !value.trim() ? 0.6 : 1,
          }}
        >
          {busy ? "…" : tx("premium.recoverButton")}
        </button>
      </div>
      {msg && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            fontWeight: 600,
            color: ok ? "#1B6B63" : "#A6416B",
          }}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
