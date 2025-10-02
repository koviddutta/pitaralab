import { describe, it, expect } from "vitest";
import { computeTotals, splitSugars } from "../src/lib/calc/core";

describe("calc core", () => {
  it("computes totals for a simple base", () => {
    const ingredients = [
      { name: "Milk 3%", grams: 600, composition: { sugars: 0, fat: 3, msnf: 8.5, other: 0, water: 88.5 } },
      { name: "Sucrose", grams: 120, composition: { sugars: 100, fat: 0, msnf: 0, other: 0, water: 0 } },
      { name: "SMP", grams: 35, composition: { sugars: 0, fat: 1, msnf: 93, other: 0, water: 3.5 } },
    ];
    const t = computeTotals(ingredients);
    expect(Math.round(t.totalSolids)).toBeGreaterThan(200);
    expect(Math.round(t.water)).toBeGreaterThan(500);
  });

  it("splits sugars 70/10/20", () => {
    const s = splitSugars(200);
    expect(s.sucrose + s.dextrose + s.glucoseSyrup).toBe(200);
    expect(s.sucrose).toBe(140);
  });
});
