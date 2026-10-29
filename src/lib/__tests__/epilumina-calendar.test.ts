import { describe, expect, it } from "vitest";
import { isUpcoming } from "../epilumina-calendar";

const now = new Date(2026, 9, 14, 12, 0, 0); // 14 Oct 2026, 12:00 local

describe("isUpcoming", () => {
  it("hides an event whose date and time already passed", () => {
    expect(isUpcoming({ date: "2026-10-14", time: "11:59" }, now)).toBe(false);
  });
  it("shows an event later today", () => {
    expect(isUpcoming({ date: "2026-10-14", time: "12:30" }, now)).toBe(true);
  });
  it("treats an event without time as 00:00 (so today's untimed event is past at noon)", () => {
    expect(isUpcoming({ date: "2026-10-14" }, now)).toBe(false);
    expect(isUpcoming({ date: "2026-10-15" }, now)).toBe(true);
  });
  it("falls back to date comparison for an unparsable time", () => {
    expect(isUpcoming({ date: "2026-10-20", time: "xx" }, now)).toBe(true);
    expect(isUpcoming({ date: "2026-10-01", time: "xx" }, now)).toBe(false);
  });
});
