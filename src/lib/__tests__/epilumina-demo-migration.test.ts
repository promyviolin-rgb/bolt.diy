// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { removeDemoEntries } from "../epilumina-profiles";

describe("removeDemoEntries (migration v3)", () => {
  beforeEach(() => localStorage.clear());

  it("removes former demo entries but keeps the user's own", () => {
    localStorage.setItem(
      "epilumina.default.entries",
      JSON.stringify([
        { id: "e1", date: "2026-07-01", time: "07:42" },
        { id: "u1", date: "2026-07-02", time: "08:00" },
      ]),
    );
    localStorage.setItem(
      "epilumina.default.progress",
      JSON.stringify([{ id: "p1", date: "2026-06-20" }]),
    );
    removeDemoEntries();
    expect(JSON.parse(localStorage.getItem("epilumina.default.entries")!)).toEqual([
      { id: "u1", date: "2026-07-02", time: "08:00" },
    ]);
    expect(JSON.parse(localStorage.getItem("epilumina.default.progress")!)).toEqual([]);
    expect(localStorage.getItem("epilumina.migrated.v3")).toBe("1");
  });

  it("runs only once", () => {
    localStorage.setItem("epilumina.migrated.v3", "1");
    const rows = [{ id: "e1", date: "2026-07-01", time: "07:42" }];
    localStorage.setItem("epilumina.default.entries", JSON.stringify(rows));
    removeDemoEntries();
    expect(JSON.parse(localStorage.getItem("epilumina.default.entries")!)).toEqual(rows);
  });
});
