import { describe, expect, it } from "vitest";
import { KETO_FOODS, foodSearchIndex } from "../epilumina-keto-foods";

const byId = (id: string) => KETO_FOODS.find((f) => f.id === id)!;

describe("foodSearchIndex aliases", () => {
  it("finds the doughnut by every spelling", () => {
    const idx = foodSearchIndex(byId("donut"));
    for (const q of ["donut", "doughnut", "dónut"]) expect(idx).toContain(q);
  });
  it("finds apple pie by 'apfelkuchen'", () => {
    expect(foodSearchIndex(byId("applepie"))).toContain("apfelkuchen");
  });
  it("does not duplicate names already in the index", () => {
    const words = foodSearchIndex(byId("donut")).split(" ");
    expect(words.filter((w) => w === "dónut")).toHaveLength(1);
  });
});
