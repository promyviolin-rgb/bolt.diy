/* Premium licence — granted ONLY after the server confirmed with Stripe that a
 * checkout/subscription was paid. The URL alone never unlocks anything.
 * The licence is re-checked with the server on each launch (when online).
 *
 * On activation the server registers a random device id with the subscription,
 * so one code cannot unlock an unlimited number of devices. The limit is
 * enforced fail-open: if Stripe is unreachable, activation still succeeds.
 */
import { useCallback, useEffect } from "react";
import { usePersistentState } from "./use-persistent-state";

/** How many devices one subscription may activate. */
export const MAX_DEVICES = 3;

export type License = {
  sessionId: string;
  customerId?: string | null;
  tier: "monthly" | "annual";
  expiresAt: number;
  verifiedAt: number;
};

export type ActivateResult = { ok: boolean; deviceLimit?: boolean };

type VerifyResult =
  | { ok: true; license: License }
  | { ok: false; definitive: boolean; deviceLimit?: boolean };

const DEVICE_KEY = "epilumina.deviceId";

/** Stable random id for this browser — not a fingerprint, just a random label. */
export function deviceId(): string {
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = "d" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export async function verifySession(sessionId: string, register = false): Promise<VerifyResult> {
  try {
    const res = await fetch("/api/verify-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, deviceId: deviceId(), register }),
    });
    const data = await res.json().catch(() => ({}));
    if (data && data.deviceLimit === true) {
      return { ok: false, definitive: true, deviceLimit: true };
    }
    if (res.ok && data.paid === true && typeof data.expiresAt === "number") {
      return {
        ok: true,
        license: {
          sessionId: data.sessionId,
          customerId: typeof data.customerId === "string" ? data.customerId : null,
          tier: data.tier,
          expiresAt: data.expiresAt,
          verifiedAt: Date.now(),
        },
      };
    }
    // 400/404 or paid:false → the server definitively says "not paid".
    return { ok: false, definitive: res.ok || res.status === 400 || res.status === 404 };
  } catch {
    return { ok: false, definitive: false }; // offline — keep any cached licence
  }
}

export function isLicenseValid(l: License | null | undefined) {
  return (
    !!l &&
    typeof l.expiresAt === "number" &&
    l.expiresAt > Date.now() &&
    /^(?:cs_(?:test|live)|sub|si)_/.test(l.sessionId || "")
  );
}

export function useLicense() {
  const [license, setLicense, hydrated] = usePersistentState<License | null>(
    "epilumina.license",
    null,
  );

  // Re-verify a stored licence with the server on launch. Never registers a
  // device — that happens only on an explicit activation.
  useEffect(() => {
    if (!hydrated || !license?.sessionId) return;
    let cancelled = false;
    verifySession(license.sessionId, false).then((r) => {
      if (cancelled) return;
      if (r.ok) setLicense(r.license);
      else if (r.definitive) setLicense(null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const activate = useCallback(
    async (sessionId: string): Promise<ActivateResult> => {
      const r = await verifySession(sessionId, true);
      if (r.ok) setLicense(r.license);
      return { ok: r.ok, deviceLimit: !r.ok && r.deviceLimit === true };
    },
    [setLicense],
  );

  return { license, isValid: isLicenseValid(license), activate, setLicense, hydrated };
}

/** Opens the Stripe Billing Portal. The server derives the customer from the
 * verified purchase id, so a forged customerId can't open someone else's portal.
 * Zwraca kod błędu, żeby ekran mógł powiedzieć, co dokładnie nie zadziałało. */
export async function openBillingPortal(
  license: License,
): Promise<{ ok: boolean; code?: string }> {
  try {
    const res = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: license.sessionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (
      res.ok &&
      typeof data.url === "string" &&
      data.url.startsWith("https://billing.stripe.com/")
    ) {
      window.location.href = data.url;
      return { ok: true };
    }
    return { ok: false, code: String(data?.code || "portal_failed") };
  } catch {
    return { ok: false, code: "offline" };
  }
}
