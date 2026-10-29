/* Multi-profile storage — Premium unlocks additional profiles.
 * Free users always transparently use the "default" profile.
 * All medical data keys are namespaced as `epilumina.<profileId>.<name>`.
 */
import { useEffect } from "react";
import { usePersistentState } from "./use-persistent-state";

export type Profile = { id: string; name: string; createdAt: string };

export const DEFAULT_PROFILE: Profile = {
  id: "default",
  name: "Pacjent",
  createdAt: "2024-01-01T00:00:00Z",
};

/** One-time migration: copy legacy `epilumina.<key>` values → `epilumina.default.<key>`. */
export function migrateLegacyProfileKeys() {
  if (typeof window === "undefined") return;
  // v2: diet data (meal in progress, custom foods) moved to per-profile keys.
  try {
    if (!window.localStorage.getItem("epilumina.migrated.v2")) {
      for (const k of ["ketoMeal", "customFoods"]) {
        const val = window.localStorage.getItem("epilumina." + k);
        const dst = "epilumina.default." + k;
        if (val !== null && window.localStorage.getItem(dst) === null)
          window.localStorage.setItem(dst, val);
        window.localStorage.removeItem("epilumina." + k);
      }
      window.localStorage.setItem("epilumina.migrated.v2", "1");
    }
  } catch {
    /* ignore */
  }
  // v3: remove the old demo entries that used to be seeded on first launch.
  removeDemoEntries();
  const flag = "epilumina.migrated.v1";
  try {
    if (window.localStorage.getItem(flag)) return;
    const legacy = ["entries", "progress", "docs", "forYou", "meds", "region"];
    for (const k of legacy) {
      const src = "epilumina." + k;
      const dst = "epilumina.default." + k;
      const val = window.localStorage.getItem(src);
      if (val !== null && window.localStorage.getItem(dst) === null) {
        window.localStorage.setItem(dst, val);
      }
    }
    window.localStorage.setItem(flag, "1");
  } catch {
    /* ignore */
  }
}

/** Compose a profile-scoped storage key. */
export function pkey(profileId: string, name: string) {
  return `epilumina.${profileId || "default"}.${name}`;
}

/** Read/write the profile list + active id. Both global (not per-profile). */
export function useProfiles() {
  const [profiles, setProfiles] = usePersistentState<Profile[]>("epilumina.profiles", [
    DEFAULT_PROFILE,
  ]);
  const [activeId, setActiveId] = usePersistentState<string>("epilumina.activeProfile", "default");

  useEffect(() => {
    migrateLegacyProfileKeys();
  }, []);

  // Guarantee at least one profile exists (no privileged "main" profile).
  useEffect(() => {
    if (profiles.length === 0) setProfiles([DEFAULT_PROFILE]);
  }, [profiles, setProfiles]);

  const active = profiles.find((p) => p.id === activeId) || DEFAULT_PROFILE;

  const addProfile = (name: string) => {
    const id = "p" + Date.now();
    setProfiles((prev) => [
      ...prev,
      { id, name: name.trim() || "Profile", createdAt: new Date().toISOString() },
    ]);
    setActiveId(id);
    return id;
  };

  const renameProfile = (id: string, name: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    );
  };

  const deleteProfile = (id: string) => {
    // Every profile is equal — the only rule is that one must remain.
    if (profiles.length <= 1) return;
    // wipe all data keys for this profile
    try {
      const prefix = `epilumina.${id}.`;
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || "default");
  };

  return { profiles, active, activeId, setActiveId, addProfile, renameProfile, deleteProfile };
}

const DEMO_ENTRIES = [
  { id: "e1", date: "2026-07-01", time: "07:42" },
  { id: "e2", date: "2026-06-27", time: "15:10" },
  { id: "e3", date: "2026-06-19", time: "21:05" },
];
const DEMO_PROGRESS = [{ id: "p1", date: "2026-06-20" }];

/** One-time (flag `epilumina.migrated.v3`): drop former demo rows from every profile. */
export function removeDemoEntries(storage: Storage = window.localStorage) {
  const flag = "epilumina.migrated.v3";
  try {
    if (storage.getItem(flag)) return;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && /^epilumina\.(?:[^.]+\.)?(entries|progress)$/.test(k)) keys.push(k);
    }
    for (const k of keys) {
      const demo = k.endsWith(".entries") ? DEMO_ENTRIES : DEMO_PROGRESS;
      let list: unknown;
      try {
        list = JSON.parse(storage.getItem(k) || "null");
      } catch {
        continue;
      }
      if (!Array.isArray(list)) continue;
      const kept = list.filter(
        (e: any) =>
          !demo.some(
            (d: any) =>
              e && e.id === d.id && e.date === d.date && (!("time" in d) || e.time === d.time),
          ),
      );
      if (kept.length !== list.length) storage.setItem(k, JSON.stringify(kept));
    }
    storage.setItem(flag, "1");
  } catch {
    /* ignore */
  }
}
