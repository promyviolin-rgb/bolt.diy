/* Epilumina service worker — best-effort background reminders.
 * True background push requires a server; this uses Notification Triggers
 * (Chrome origin trial) plus catch-up on activation / message.
 * No network calls, no analytics — 100% on-device.
 */
const STORE = "epilumina-reminders-v1";
const CACHE = "epilumina-shell-v3";

/* Cache'owanie powłoki aplikacji. Wcześniej CACHE było zadeklarowane, ale
 * nigdzie nieużywane — service worker nie miał żadnego handlera "fetch", więc
 * każde uruchomienie PWA pobierało cały JavaScript z sieci od nowa. Stąd
 * "miganie" ikony i wolny start.
 *
 * Strategia:
 *   /assets/*  (nazwy z hashem)  -> cache-first, bo plik o tej nazwie nigdy się
 *                                   nie zmienia; drugie uruchomienie = offline
 *   nawigacja  (HTML)            -> network-first z fallbackiem na cache, żeby
 *                                   po wdrożeniu nowej wersji nie utknąć na starej
 *   reszta GET                   -> cache-first z dociąganiem w tle
 */
self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      } catch (_) {
        /* ignore */
      }
      await self.clients.claim();
    })(),
  );
});

function isAsset(url) {
  return url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/");
}

async function cachePut(request, response) {
  try {
    const copy = response.clone();
    const cache = await caches.open(CACHE);
    await cache.put(request, copy);
  } catch (_) {
    /* quota / opaque */
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Pliki z hashem: cache-first.
  if (isAsset(url)) {
    e.respondWith(
      (async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res && res.ok) void cachePut(req, res);
        return res;
      })().catch(() => caches.match(req)),
    );
    return;
  }

  // Dokumenty: network-first, żeby nowe wdrożenie było widoczne od razu.
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res && res.ok) void cachePut(req, res);
          return res;
        } catch (_) {
          const hit = (await caches.match(req)) || (await caches.match("/"));
          if (hit) return hit;
          throw _;
        }
      })(),
    );
    return;
  }

  // Reszta: cache-first.
  e.respondWith(
    (async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) void cachePut(req, res);
      return res;
    })().catch(() => caches.match(req)),
  );
});

// Receive schedule from page: { type:"schedule", reminders:[{id,title,body,ts}]}
self.addEventListener("message", async (e) => {
  const data = e.data || {};
  if (data.type === "schedule" && Array.isArray(data.reminders)) {
    await scheduleAll(data.reminders);
  } else if (data.type === "catchup") {
    await catchupNow();
  } else if (data.type === "clear") {
    await clearAll();
  }
});

async function scheduleAll(reminders) {
  // Best-effort: use showNotification with `showTrigger` where supported (Chrome Android w/ trial).
  // Fallback: store in IDB and fire on next activation / visibility.
  await idbSet("reminders", reminders);
  if ("TimestampTrigger" in self) {
    for (const r of reminders) {
      try {
        await self.registration.showNotification(r.title, {
          body: r.body,
          tag: "epilumina-med-" + r.id + "-" + r.ts,
          showTrigger: new TimestampTrigger(r.ts),
          data: { id: r.id, ts: r.ts },
          icon: "/icon-192.png",
          badge: "/badge.png",
        });
      } catch (_) {
        /* trigger unsupported → rely on catchup */
      }
    }
  }
}

async function catchupNow() {
  const reminders = (await idbGet("reminders")) || [];
  const now = Date.now();
  const fired = (await idbGet("fired")) || {};
  const remaining = [];
  for (const r of reminders) {
    const key = r.id + "|" + r.ts;
    if (r.ts <= now && r.ts >= now - 12 * 3600 * 1000 && !fired[key]) {
      try {
        await self.registration.showNotification(r.title, {
          body: r.body,
          tag: "epilumina-catchup-" + key,
          icon: "/icon-192.png",
          badge: "/badge.png",
        });
        fired[key] = 1;
      } catch (_) {
        /* ignore */
      }
    }
    if (r.ts > now) remaining.push(r);
  }
  await idbSet("fired", fired);
  await idbSet("reminders", remaining);
}

async function clearAll() {
  await idbSet("reminders", []);
  const notifs = await self.registration.getNotifications();
  notifs.forEach((n) => {
    if ((n.tag || "").startsWith("epilumina-")) n.close();
  });
}

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((cs) => {
      const c = cs[0];
      if (c) return c.focus();
      return self.clients.openWindow("/");
    }),
  );
});

/* Tiny IDB helpers (no external deps) */
function openDb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(STORE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function idbGet(k) {
  const db = await openDb();
  return new Promise((res) => {
    const tx = db.transaction("kv", "readonly").objectStore("kv").get(k);
    tx.onsuccess = () => res(tx.result);
    tx.onerror = () => res(undefined);
  });
}
async function idbSet(k, v) {
  const db = await openDb();
  return new Promise((res) => {
    const tx = db.transaction("kv", "readwrite").objectStore("kv").put(v, k);
    tx.onsuccess = () => res(true);
    tx.onerror = () => res(false);
  });
}
