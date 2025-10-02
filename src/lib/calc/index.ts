// src/lib/calc/index.ts
export type IngredientData = {
  id: string;
  name: string;
  water_pct: number;
  fat_pct: number;
  sugars_pct: number;
  msnf_pct: number;
  other_solids_pct: number;
  sp_coeff: number;
  pac_coeff: number;
  category: string;
};

/**
 * Each row = one ingredient and how many grams of it are in the batch.
 * The ingredient percentages (water_pct, fat_pct, etc.) are "per 100 g".
 */
export type BatchRow = {
  ing: IngredientData;
  grams: number;
};

function weightedAvg(rows: BatchRow[], pick: (r: BatchRow) => number): number {
  const total = rows.reduce((s, r) => s + r.grams, 0);
  if (total <= 0) return 0;
  const sum = rows.reduce((s, r) => s + r.grams * pick(r), 0);
  return sum / total;
}

/**
 * Matches your test logic:
 * - ts_add_pct = weighted average of total solids (fat + sugars + msnf + other)
 * - msnf_pct / fat_pct / sugars_pct = weighted average of each field
 * - sp  = weighted avg of (sugars_pct * sp_coeff)
 * - pac = weighted avg of (sugars_pct * pac_coeff)
 */
export function calcMetrics(rows: BatchRow[]) {
  if (!rows || rows.length === 0) {
    return {
      ts_add_pct: 0,
      msnf_pct: 0,
      fat_pct: 0,
      sugars_pct: 0,
      sp: 0,
      pac: 0,
    };
  }

  const ts_add_pct = weightedAvg(
    rows,
    (r) =>
      (r.ing.fat_pct ?? 0) +
      (r.ing.sugars_pct ?? 0) +
      (r.ing.msnf_pct ?? 0) +
      (r.ing.other_solids_pct ?? 0)
  );

  const msnf_pct = weightedAvg(rows, (r) => r.ing.msnf_pct ?? 0);
  const fat_pct = weightedAvg(rows, (r) => r.ing.fat_pct ?? 0);
  const sugars_pct = weightedAvg(rows, (r) => r.ing.sugars_pct ?? 0);

  const sp = weightedAvg(
    rows,
    (r) => (r.ing.sugars_pct ?? 0) * (r.ing.sp_coeff ?? 1)
  );

  const pac = weightedAvg(
    rows,
    (r) => (r.ing.sugars_pct ?? 0) * (r.ing.pac_coeff ?? 0)
  );

  return { ts_add_pct, msnf_pct, fat_pct, sugars_pct, sp, pac };
}

// If other files in your app import from this module,
// you can also re-export helpers here if you need them later:
// export { weightedAvg };
