import { IngredientData } from '@/types/ingredients';

export type Metrics = {
  total_g: number;

  water_g: number; sugars_g: number; fat_g: number; msnf_g: number; other_g: number;
  water_pct: number; sugars_pct: number; fat_pct: number; msnf_pct: number; other_pct: number;

  ts_add_g: number; ts_mass_g: number;
  ts_add_pct: number; ts_mass_pct: number;

  sp: number;   // ~12–28 typical
  pac: number;  // ~22–33 typical (aka AFP)
};

export type CalcOptions = { evaporation_pct?: number };

export function calcMetrics(
  rows: { ing: IngredientData; grams: number }[],
  opts: CalcOptions = {}
): Metrics {
  const total_g = rows.reduce((a, r) => a + (r.grams || 0), 0);

  let water_g=0, sugars_g=0, fat_g=0, msnf_g=0, other_g=0;
  for (const { ing, grams } of rows) {
    const g = grams || 0;
    water_g += g * (ing.water_pct || 0) / 100;
    sugars_g += g * (ing.sugars_pct || 0) / 100;
    fat_g    += g * ( ing.fat_pct   || 0) / 100;
    msnf_g   += g * (ing.msnf_pct   || 0) / 100;
    other_g  += g * (ing.other_solids_pct || 0) / 100;
  }

  // Evaporation reduces water, then percentages use final mass
  const evap = Math.max(0, Math.min(100, opts.evaporation_pct ?? 0));
  const water_evap_g = water_g * (1 - evap / 100);
  const total_after_evap_g = total_g - (water_g - water_evap_g);
  const pct = (x: number) => total_after_evap_g > 0 ? (x / total_after_evap_g) * 100 : 0;

  const ts_add_g  = sugars_g + fat_g + msnf_g + other_g;
  const ts_mass_g = total_after_evap_g - water_evap_g;

  // SP & PAC from weight fraction of sugars on final mass × coeff × 100
  const coeff = {
    sucrose:       { sp: 1.00, pac: 1.00 },
    dextrose:      { sp: 0.74, pac: 1.90 },
    fructose:      { sp: 1.73, pac: 1.90 },
    invert:        { sp: 1.25, pac: 1.90 },
    lactose:       { sp: 0.16, pac: 1.00 },
    glucose_de60:  { sp: 0.50, pac: 1.18 }
  };

  let sp = 0, pac = 0;
  for (const { ing, grams } of rows) {
    const g = grams || 0;
    const sug_g = g * (ing.sugars_pct || 0) / 100;
    if (sug_g <= 0 || total_after_evap_g <= 0) continue;

    if (ing.category === 'fruit' && ing.sugar_split) {
      const s = ing.sugar_split;
      const norm = (s.glucose ?? 0) + (s.fructose ?? 0) + (s.sucrose ?? 0) || 100;
      const g_glu = sug_g * ((s.glucose  ?? 0)/norm);
      const g_fru = sug_g * ((s.fructose ?? 0)/norm);
      const g_suc = sug_g * ((s.sucrose  ?? 0)/norm);

      sp  += (g_glu/total_after_evap_g) * coeff.dextrose.sp * 100
           + (g_fru/total_after_evap_g) * coeff.fructose.sp * 100
           + (g_suc/total_after_evap_g) * coeff.sucrose.sp  * 100;
      pac += (g_glu/total_after_evap_g) * coeff.dextrose.pac * 100
           + (g_fru/total_after_evap_g) * coeff.fructose.pac * 100
           + (g_suc/total_after_evap_g) * coeff.sucrose.pac  * 100;
    } else {
      const id = (ing.id || '').toLowerCase();
      const c =
        coeff[id as keyof typeof coeff] ||
        (id.includes('dextrose') || id.includes('glucose') ? coeff.dextrose :
         id.includes('fructose') ? coeff.fructose :
         id.includes('invert')   ? coeff.invert :
         id.includes('lactose')  ? coeff.lactose :
         id.includes('glucose_de60') ? coeff.glucose_de60 : coeff.sucrose);
      sp  += (sug_g / total_after_evap_g) * c.sp  * 100;
      pac += (sug_g / total_after_evap_g) * c.pac * 100;
    }
  }

  return {
    total_g: total_after_evap_g,

    water_g: water_evap_g, sugars_g, fat_g, msnf_g, other_g,
    water_pct: pct(water_evap_g), sugars_pct: pct(sugars_g), fat_pct: pct(fat_g),
    msnf_pct: pct(msnf_g), other_pct: pct(other_g),

    ts_add_g, ts_mass_g, ts_add_pct: pct(ts_add_g), ts_mass_pct: pct(ts_mass_g),

    sp, pac
  };
}