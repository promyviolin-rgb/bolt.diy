/* Full on-device backup: every localStorage key of the app (profiles, settings,
 * seizure history, calendar events, diet, medication reminders, trips, PIN
 * settings...) plus every document/attachment stored in IndexedDB.
 * Nothing is ever sent anywhere and nothing is ever cleared on error.
 */
import { idbListAllDocs, idbPutDoc } from "./epilumina-idb";

export const BACKUP_SCHEMA = 2;
const PREFIX = "epilumina.";

export type BackupPayload = {
  app: "epilumina";
  schema: number;
  exportedAt: string;
  local: Record<string, unknown>;
  documents: any[];
};

/** Snapshot of every `epilumina.*` localStorage entry. */
export function collectLocal(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const raw = window.localStorage.getItem(k);
      if (raw === null) continue;
      try {
        out[k] = JSON.parse(raw);
      } catch {
        out[k] = raw;
      }
    }
  } catch {
    /* storage unavailable */
  }
  return out;
}

/** Complete backup payload (localStorage + IndexedDB attachments). */
export async function buildFullBackup(): Promise<BackupPayload> {
  let documents: any[] = [];
  try {
    documents = await idbListAllDocs();
  } catch {
    documents = [];
  }
  return {
    app: "epilumina",
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    local: collectLocal(),
    documents,
  };
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** One-click emergency download (used by the error screen too). */
export async function downloadFullBackupJson(prefix = "epilumina-backup") {
  const payload = await buildFullBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${prefix}-${new Date().toISOString().slice(0, 10)}.json`);
}

const SAFE_KEY = /^[A-Za-z0-9._-]+$/;

/** Restore a backup into localStorage + IndexedDB. Returns restored key count. */
export async function restoreFullBackup(data: any): Promise<number> {
  if (!data || data.app !== "epilumina") throw new Error("invalid payload");
  let restored = 0;

  // Schema 2 — full snapshot.
  if (data.local && typeof data.local === "object") {
    for (const [k, v] of Object.entries(data.local)) {
      if (!k.startsWith(PREFIX) || !SAFE_KEY.test(k)) continue;
      try {
        window.localStorage.setItem(k, JSON.stringify(v));
        restored++;
      } catch {
        /* quota — keep going */
      }
    }
  } else {
    // Schema 1 — legacy payload with flat arrays for the default profile.
    const map: Record<string, unknown> = {
      "epilumina.default.entries": data.entries,
      "epilumina.default.progress": data.progress,
      "epilumina.default.meds": data.meds,
      "epilumina.default.region": data.region,
      "epilumina.premium": data.premium,
      "epilumina.lang": data.lang,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v === undefined) continue;
      try {
        window.localStorage.setItem(k, JSON.stringify(v));
        restored++;
      } catch {
        /* ignore */
      }
    }
  }

  if (Array.isArray(data.documents)) {
    for (const d of data.documents) {
      if (!d || typeof d !== "object") continue;
      try {
        await idbPutDoc({
          ...d,
          id: d.id || "d" + Date.now() + Math.random().toString(36).slice(2, 6),
          profileId: d.profileId || "default",
        });
        restored++;
      } catch {
        /* ignore */
      }
    }
  }

  if (restored === 0) throw new Error("empty payload");
  return restored;
}
