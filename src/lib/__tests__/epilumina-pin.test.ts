import { describe, expect, it } from "vitest";
import {
  checkRecovery,
  hashPin,
  hashRecovery,
  makeRecoveryCode,
  normalizeRecovery,
} from "../epilumina-pin";

describe("hashPin", () => {
  it("nie zapisuje PIN-u jawnie", () => {
    const h = hashPin("1234");
    expect(h).not.toContain("1234");
    expect(h.startsWith("h")).toBe(true);
  });
  it("jest stabilny i różny dla różnych PIN-ów", () => {
    expect(hashPin("1234")).toBe(hashPin("1234"));
    expect(hashPin("1234")).not.toBe(hashPin("4321"));
  });
});

describe("makeRecoveryCode", () => {
  it("ma format XXXX-XXXX i bezpieczny alfabet", () => {
    for (let i = 0; i < 40; i++) {
      const c = makeRecoveryCode();
      expect(c).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    }
  });
  it("jest losowy", () => {
    const set = new Set(Array.from({ length: 30 }, () => makeRecoveryCode()));
    expect(set.size).toBe(30);
  });
});

describe("normalizeRecovery", () => {
  it("usuwa myślniki, spacje i wielkość liter", () => {
    expect(normalizeRecovery(" k7m3-9qpt ")).toBe("K7M39QPT");
    expect(normalizeRecovery("K7M3 9QPT")).toBe("K7M39QPT");
  });
  it("obcina nadmiar znaków", () => {
    expect(normalizeRecovery("ABCDEFGHJKLMNOP")).toHaveLength(8);
  });
});

describe("checkRecovery", () => {
  const code = "K7M3-9QPT";
  const stored = hashRecovery(code);

  it("przyjmuje kod w dowolnym zapisie", () => {
    expect(checkRecovery("k7m3-9qpt", stored)).toBe(true);
    expect(checkRecovery("K7M39QPT", stored)).toBe(true);
    expect(checkRecovery(" K7M3 9QPT ", stored)).toBe(true);
  });

  it("odrzuca zły kod i kod niepełny", () => {
    expect(checkRecovery("K7M3-9QPX", stored)).toBe(false);
    expect(checkRecovery("K7M3", stored)).toBe(false);
    expect(checkRecovery("", stored)).toBe(false);
  });

  it("odrzuca wszystko, gdy nie ma zapisanego kodu (stary PIN)", () => {
    expect(checkRecovery("K7M3-9QPT", "")).toBe(false);
  });
});
