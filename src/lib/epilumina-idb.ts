/* IndexedDB storage for medical documents (scans / PDFs).
 * Avoids the ~5 MB localStorage cap on iOS. 100% on-device, no network.
 */
import { useCallback, useEffect, useState } from "react";

const DB_NAME = "epilumina-docs";
const STORE = "docs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("profileId", "profileId", { unique: false });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => res(req.result as T);
    req.onerror = () => rej(req.error);
  });
}

export async function idbListDocs(profileId: string): Promise<any[]> {
  const all = await tx<any[]>("readonly", (s) => s.getAll());
  return (all || [])
    .filter((d) => (d.profileId || "default") === profileId)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

/** Every stored document across all profiles — used by the full backup. */
export async function idbListAllDocs(): Promise<any[]> {
  try {
    const all = await tx<any[]>("readonly", (s) => s.getAll());
    return all || [];
  } catch {
    return [];
  }
}
export async function idbPutDoc(doc: any): Promise<void> {
  await tx("readwrite", (s) => s.put(doc));
}
export async function idbDeleteDoc(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

/** React hook: documents for the active profile, stored in IndexedDB. */
export function useIdbDocuments(profileId: string) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      const list = await idbListDocs(profileId);
      setDocuments(list);
    } catch {
      setDocuments([]);
    }
    setReady(true);
  }, [profileId]);

  useEffect(() => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      // One-time migration of legacy localStorage documents into IndexedDB.
      try {
        const lsKey = `epilumina.${profileId}.docs`;
        const raw = window.localStorage.getItem(lsKey);
        if (raw) {
          const legacy = JSON.parse(raw);
          if (Array.isArray(legacy) && legacy.length > 0) {
            for (const d of legacy) {
              await idbPutDoc({
                ...d,
                id: d.id || "d" + Date.now() + Math.random().toString(36).slice(2, 6),
                profileId,
              });
            }
          }
          window.localStorage.removeItem(lsKey);
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, reload]);

  const addDocument = useCallback(
    async (doc: any) => {
      const rec = {
        ...doc,
        id: "d" + Date.now() + Math.random().toString(36).slice(2, 6),
        profileId,
      };
      try {
        await idbPutDoc(rec);
      } catch {
        /* ignore */
      }
      setDocuments((prev) => [rec, ...prev]);
    },
    [profileId],
  );

  const renameDocument = useCallback(async (id: string, name: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, name } : d));
      const target = next.find((d) => d.id === id);
      if (target)
        idbPutDoc(target).catch(() => {
          /* ignore */
        });
      return next;
    });
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await idbDeleteDoc(id);
    } catch {
      /* ignore */
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { documents, ready, addDocument, renameDocument, deleteDocument, reload };
}
