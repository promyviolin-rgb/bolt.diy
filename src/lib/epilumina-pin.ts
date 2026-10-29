/* EPILUMINA — PIN i kod odzyskiwania (100% na urządzeniu).
 *
 * Problem, który to rozwiązuje: użytkownik zapomina 4-cyfrowy PIN i traci
 * dostęp do dziennika. Bez serwera nie ma jak go odblokować zdalnie, więc
 * jedyne uczciwe rozwiązanie to KOD ODZYSKIWANIA wręczany przy zakładaniu PIN-u.
 *
 * Zasady:
 *  - sam PIN nigdy nie leży w storage — trzymamy tylko skrót (djb2 z solą),
 *  - kod odzyskiwania też jest trzymany jako skrót, z inną solą,
 *  - kod jest losowy i jednorazowo pokazywany; użytkownik ma go zapisać,
 *  - kto nie ma ani PIN-u, ani kodu, nie odblokuje aplikacji — i tak ma być.
 *
 * To blokada ekranu, nie szyfrowanie: dane w localStorage nie są zaszyfrowane
 * (aplikacja mówi to wprost użytkownikowi).
 */

const PIN_SALT = "epilumina.pin.v1:";
const RECOVERY_SALT = "epilumina.recovery.v1:";

/** Mały, nieodwracalny skrót — PIN i kod nie leżą w storage jawnie. */
function digest(salt: string, value: string) {
  let h = 5381;
  const s = salt + value;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36);
}

/** Skrót 4-cyfrowego PIN-u (zgodny ze starszymi wersjami aplikacji). */
export function hashPin(pin: string) {
  return digest(PIN_SALT, pin);
}

/** Bez znaków, które myli się przy przepisywaniu: I/O/0/1. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

/** Losowy kod odzyskiwania, np. "K7M3-9QPT". */
export function makeRecoveryCode(): string {
  const out: string[] = [];
  const cryptoObj = typeof crypto !== "undefined" ? crypto : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const buf = new Uint32Array(CODE_LENGTH);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < CODE_LENGTH; i++) out.push(ALPHABET[buf[i] % ALPHABET.length]);
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) {
      out.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    }
  }
  const raw = out.join("");
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** "k7m3 9qpt" / "K7M3-9QPT" → "K7M39QPT" — do porównania ze skrótem. */
export function normalizeRecovery(input: string) {
  return String(input || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

/** Skrót kodu odzyskiwania (bez myślnika i spacji). */
export function hashRecovery(code: string) {
  return digest(RECOVERY_SALT, normalizeRecovery(code));
}

/** Czy wpisany kod pasuje do zapisanego skrótu. */
export function checkRecovery(input: string, storedHash: string) {
  if (!storedHash) return false;
  const entered = normalizeRecovery(input);
  if (entered.length !== CODE_LENGTH) return false;
  return hashRecovery(entered) === storedHash;
}
