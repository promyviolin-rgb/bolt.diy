// Automatic GPS-based emergency numbers — no manual per-country configuration.
// Continental buckets only (EU 112, USA 911, Mexico 911, Thailand full stack).
// Individual EU countries (France, Spain, ...) all resolve to the EU bucket
// with the pan-European 112 number.
export type RegionCode = "eu" | "usa" | "mexico" | "thailand";

export interface EmergencyNumber {
  labelKey: string; // key inside forYou.* translations
  number: string;
}

export const REGION_NUMBERS: Record<RegionCode, { numbers: EmergencyNumber[]; noteKey?: string }> =
  {
    eu: {
      numbers: [{ labelKey: "emergencyGeneric", number: "112" }],
      noteKey: "euNote",
    },
    usa: {
      numbers: [{ labelKey: "usaLabel", number: "911" }],
    },
    mexico: {
      numbers: [{ labelKey: "mexicoLabel", number: "911" }],
    },
    thailand: {
      numbers: [
        { labelKey: "thailandAmbulance", number: "1669" },
        { labelKey: "thailandPolice", number: "191" },
        { labelKey: "thailandFire", number: "199" },
        { labelKey: "thailandTourist", number: "1155" },
      ],
    },
  };

/** Rough bounding boxes — enough to pick the right emergency bucket. */
export function detectRegionFromCoords(lat: number, lon: number): RegionCode | null {
  // Thailand
  if (lat >= 5 && lat <= 20.6 && lon >= 97 && lon <= 105.9) return "thailand";
  // Mexico
  if (lat >= 14 && lat <= 32.8 && lon >= -118.5 && lon <= -86.5) return "mexico";
  // Continental USA + Alaska + Hawaii
  if (
    (lat >= 24.3 && lat <= 49.5 && lon >= -125 && lon <= -66.5) ||
    (lat >= 51 && lat <= 72 && lon >= -170 && lon <= -129) ||
    (lat >= 18.5 && lat <= 22.5 && lon >= -161 && lon <= -154)
  ) {
    return "usa";
  }
  // Europe (incl. UK/Scandinavia) → 112
  if (lat >= 34.5 && lat <= 72 && lon >= -25 && lon <= 45) return "eu";
  return null;
}

/** Fallback when GPS is unavailable or denied. */
export function detectRegionFromLocale(): RegionCode {
  if (typeof navigator === "undefined") return "eu";
  const loc = (navigator.language || "").toLowerCase();
  if (loc === "es-mx") return "mexico";
  if (loc.startsWith("th")) return "thailand";
  if (loc === "en-us" || loc === "en" || loc.startsWith("en-us")) return "usa";
  return "eu";
}
