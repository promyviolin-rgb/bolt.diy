import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type Slot<T> = { k: string; v: T };

/**
 * SSR-safe localStorage-backed state.
 * Reads from localStorage after mount (avoids hydration mismatch),
 * then persists every change. 100% on-device — no backend.
 *
 * The value is tagged with the key it belongs to, so switching keys
 * (e.g. switching patient profile) can never write the previous profile's
 * data into the new profile's storage slot.
 *
 * On QuotaExceededError the code dispatches a "epilumina:quota" CustomEvent
 * so the app can render a friendly modal (see EpiluminaApp).
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const initialRef = useRef<T>(initial);
  const [slot, setSlot] = useState<Slot<T>>({ k: "", v: initial });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next = initialRef.current;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        next = JSON.parse(raw, (k, v) => {
          if (k === "__proto__" || k === "constructor" || k === "prototype") return undefined;
          return v;
        }) as T;
      }
    } catch {
      // corrupted value — keep defaults
    }
    setSlot({ k: key, v: next });
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    if (slot.k !== key) return; // value still belongs to a previous key
    try {
      window.localStorage.setItem(key, JSON.stringify(slot.v));
    } catch (err: any) {
      const name = err && (err.name || "");
      const isQuota =
        name === "QuotaExceededError" ||
        name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        (typeof err?.code === "number" && (err.code === 22 || err.code === 1014));
      if (isQuota && typeof window !== "undefined") {
        try {
          window.dispatchEvent(new CustomEvent("epilumina:quota", { detail: { key } }));
        } catch {
          /* ignore */
        }
      }
    }
  }, [key, slot, hydrated]);

  const setState = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setSlot((prev) => ({
      k: prev.k,
      v: typeof action === "function" ? (action as (p: T) => T)(prev.v) : action,
    }));
  }, []);

  return [slot.v, setState, hydrated];
}
