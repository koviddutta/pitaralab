// Epic 0: Core calculation engine with proper Total Solids formula

import { IngredientData, getIngredientByName } from './ingredientLibrary';

export interface RecipeMetrics {
  water: number;
  sugars: number;
  fat: number;
  msnf: number;
  other_solids: number;
  ts_additive: number;    // TS = sugars + fat + msnf + other_solids
  ts_mass_balance: number; // TS = 100% - water%
  sp: number;             // Sweetness Power
  pac: number;            // Anti-freezing Power (was AFP)
  total_weight: number;
  cost_per_batch: number;
  sp_contributions: { [ingredient: string]: number };
  pac_contributions: { [ingredient: string]: number };
}

export interface ValidationResult {
  ts_difference: number;  // Difference between additive and mass-balance TS
  ts_warning: boolean;    // True if difference > 0.5%
  messages: string[];
}

/**
 * Calculate comprehensive recipe metrics with proper TS formulas
 */
export function calculateRecipeMetrics(
  recipe: { [ingredient: string]: number },
  evaporationPct: number = 0
): RecipeMetrics & ValidationResult {
  let totalWater = 0;
  let totalSugars = 0;
  let totalFat = 0;
  let totalMsnf = 0;
  let totalOtherSolids = 0;
  let totalSp = 0;
  let totalPac = 0;
  let totalWeight = 0;
  let totalCost = 0;
  
  const spContributions: { [ingredient: string]: number } = {};
  const pacContributions: { [ingredient: string]: number } = {};
  const messages: string[] = [];

  // Calculate totals for each ingredient
  Object.entries(recipe).forEach(([ingredientName, amount]) => {
    if (amount <= 0) return;
    
    const ingredient = getIngredientByName(ingredientName);
    if (!ingredient) {
      messages.push(`Warning: Unknown ingredient "${ingredientName}" - using default values`);
      return;
    }

    totalWeight += amount;
    
    // Water content (before evaporation)
    const waterContent = (amount * ingredient.water_pct) / 100;
    totalWater += waterContent;
    
    // Sugars
    const sugarContent = (amount * (ingredient.sugars_pct || 0)) / 100;
    totalSugars += sugarContent;
    
    // Fat
    const fatContent = (amount * ingredient.fat_pct) / 100;
    totalFat += fatContent;
    
    // MSNF
    const msnfContent = (amount * (ingredient.msnf_pct || 0)) / 100;
    totalMsnf += msnfContent;
    
    // Other solids
    const otherSolidsContent = (amount * (ingredient.other_solids_pct || 0)) / 100;
    totalOtherSolids += otherSolidsContent;
    
    // SP contribution
    const spContribution = sugarContent * (ingredient.sp_coeff || 0);
    totalSp += spContribution;
    spContributions[ingredientName] = spContribution;
    
    // PAC contribution
    const pacContribution = sugarContent * (ingredient.pac_coeff || 0) / 100;
    totalPac += pacContribution;
    pacContributions[ingredientName] = pacContribution;
    
    // Cost
    totalCost += (amount / 1000) * (ingredient.cost_per_kg || 0);
  });

  // Apply evaporation to water content
  if (evaporationPct > 0) {
    const evaporatedWater = totalWater * (evaporationPct / 100);
    totalWater -= evaporatedWater;
    totalWeight -= evaporatedWater; // Reduce total weight by evaporated water
    messages.push(`Evaporation: ${evaporatedWater.toFixed(1)}g water removed (${evaporationPct}%)`);
  }

  // Calculate Total Solids using both methods
  const tsAdditive = totalSugars + totalFat + totalMsnf + totalOtherSolids;
  const tsMassBalance = totalWeight - totalWater;
  const tsDifference = Math.abs(tsAdditive - tsMassBalance);
  const tsWarning = tsDifference > (totalWeight * 0.005); // Warning if >0.5%

  if (tsWarning) {
    messages.push(`TS methods differ by ${((tsDifference/totalWeight)*100).toFixed(1)}% - check ingredient data`);
  }

  // Convert to percentages where needed
  const waterPct = totalWeight > 0 ? (totalWater / totalWeight) * 100 : 0;
  const sugarsPct = totalWeight > 0 ? (totalSugars / totalWeight) * 100 : 0;
  const fatPct = totalWeight > 0 ? (totalFat / totalWeight) * 100 : 0;
  const msnfPct = totalWeight > 0 ? (totalMsnf / totalWeight) * 100 : 0;
  const otherSolidsPct = totalWeight > 0 ? (totalOtherSolids / totalWeight) * 100 : 0;
  const tsAdditivePct = totalWeight > 0 ? (tsAdditive / totalWeight) * 100 : 0;
  const tsMassBalancePct = totalWeight > 0 ? (tsMassBalance / totalWeight) * 100 : 0;

  return {
    water: waterPct,
    sugars: sugarsPct,
    fat: fatPct,
    msnf: msnfPct,
    other_solids: otherSolidsPct,
    ts_additive: tsAdditivePct,
    ts_mass_balance: tsMassBalancePct,
    sp: totalSp,
    pac: totalPac,
    total_weight: totalWeight,
    cost_per_batch: totalCost,
    sp_contributions: spContributions,
    pac_contributions: pacContributions,
    ts_difference: tsDifference,
    ts_warning: tsWarning,
    messages
  };
}

/**
 * Classify recipe based on closest product type fit
 */
export function classifyRecipe(metrics: RecipeMetrics): 'white_base' | 'finished_gelato' | 'fruit_gelato' | 'sorbet' {
  const { ts_additive: ts, sugars, fat, msnf, sp, pac } = metrics;

  // Calculate distance to each product type
  const distances = {
    white_base: calculateDistance(ts, sugars, fat, msnf, sp, pac, [34.5, 17.5, 5, 9.5, 17, 25]),
    finished_gelato: calculateDistance(ts, sugars, fat, msnf, sp, pac, [41.5, 20, 11.5, 9.5, 17, 25]),
    fruit_gelato: calculateDistance(ts, sugars, fat, msnf, sp, pac, [37, 23, 6.5, 5, 22, 27]),
    sorbet: calculateDistance(ts, sugars, fat, msnf, sp, pac, [37, 28.5, 0, 0, 24, 30.5])
  };

  // Return the product type with minimum distance
  return Object.keys(distances).reduce((a, b) => 
    distances[a] < distances[b] ? a : b
  ) as 'white_base' | 'finished_gelato' | 'fruit_gelato' | 'sorbet';
}

function calculateDistance(ts: number, sugars: number, fat: number, msnf: number, sp: number, pac: number, target: number[]): number {
  const weights = [1, 1, 1, 1, 0.5, 0.5]; // Weight different parameters
  const values = [ts, sugars, fat, msnf, sp, pac];
  return values.reduce((sum, value, i) => sum + weights[i] * Math.pow(value - target[i], 2), 0);
}

/**
 * Generate actionable validation messages
 */
export function generateValidationMessages(
  metrics: RecipeMetrics, 
  targets: { [key: string]: [number, number] },
  productType: string
): string[] {
  const messages: string[] = [];
  
  // PAC validation
  if (targets.pac) {
    const [minPac, maxPac] = targets.pac;
    if (metrics.pac < minPac) {
      const deficit = minPac - metrics.pac;
      messages.push(`PAC low (${metrics.pac.toFixed(1)}, target ${minPac}–${maxPac}). Try: +${Math.ceil(deficit * 0.1)}–${Math.ceil(deficit * 0.2)}g dextrose or −${Math.ceil(deficit * 0.15)}g sucrose.`);
    } else if (metrics.pac > maxPac) {
      const excess = metrics.pac - maxPac;
      messages.push(`PAC high (${metrics.pac.toFixed(1)}, target ${minPac}–${maxPac}). Try: −${Math.ceil(excess * 0.1)}–${Math.ceil(excess * 0.2)}g dextrose or +${Math.ceil(excess * 0.15)}g sucrose.`);
    }
  }

  // Total Solids validation
  if (targets.total_solids) {
    const [minTs, maxTs] = targets.total_solids;
    if (metrics.ts_additive > maxTs) {
      messages.push(`TS high (${metrics.ts_additive.toFixed(1)}%). Reduce stabilizer/cocoa solids or add water by 1–2%.`);
    } else if (metrics.ts_additive < minTs) {
      messages.push(`TS low (${metrics.ts_additive.toFixed(1)}%). Increase solids or reduce water content.`);
    }
  }

  // Sugar validation with product-specific advice
  if (targets.sugar) {
    const [minSugar, maxSugar] = targets.sugar;
    if (metrics.sugars > maxSugar && productType === 'white_base') {
      messages.push(`Sugar high for White Base (${metrics.sugars.toFixed(1)}%, target ${minSugar}–${maxSugar}%). Consider moving to Finished Gelato preset.`);
    }
  }

  return messages;
}

/**
 * 70-10-20 Sugar Spectrum Calculator
 */
export function calculateSugarSpectrum(totalSugarWeight: number): { [sugarType: string]: number } {
  return {
    'Sucrose': totalSugarWeight * 0.70,        // 70% disaccharides
    'Dextrose': totalSugarWeight * 0.10,       // 10% monosaccharides  
    'Glucose Syrup DE60': totalSugarWeight * 0.20  // 20% polysaccharides
  };
}
