/**
 * Utility to convert between legacy and modern ingredient formats
 * Ensures consistent calculations across all calculator components
 */

import { IngredientData, getIngredientByName, getSeedIngredients } from './ingredientLibrary';

/**
 * Convert legacy recipe format {[name: string]: number} to modern format
 */
export function convertLegacyRecipeToRows(
  recipe: { [key: string]: number }
): Array<{ ing: IngredientData; grams: number }> {
  const availableIngredients = getSeedIngredients();
  
  return Object.entries(recipe).map(([name, grams]) => {
    // Try to find exact match first
    let ing = getIngredientByName(name);
    
    // If not found, try fuzzy matching
    if (!ing) {
      const nameLower = name.toLowerCase();
      ing = availableIngredients.find(i => 
        i.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(i.name.toLowerCase()) ||
        i.id.toLowerCase() === nameLower.replace(/\s+/g, '_')
      );
    }
    
    // If still not found, create a default ingredient with milk-like properties
    if (!ing) {
      ing = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        category: 'other',
        water_pct: 88,
        fat_pct: 3,
        sugars_pct: 5,
        other_solids_pct: 0,
        sp_coeff: 0.5,
        pac_coeff: 50,
      };
    }
    
    return { ing, grams: grams || 0 };
  });
}

/**
 * Smart ingredient name matching with common aliases
 */
export function matchIngredientName(searchName: string): IngredientData | null {
  const aliases: { [key: string]: string } = {
    'sugar': 'Sucrose',
    'table sugar': 'Sucrose',
    'white sugar': 'Sucrose',
    'dextrose monohydrate': 'Dextrose',
    'glucose': 'Glucose Syrup DE60',
    'corn syrup': 'Glucose Syrup DE60',
    'milk': 'Milk 3% fat',
    'whole milk': 'Milk 3% fat',
    'cream': 'Cream 25% fat',
    'heavy cream': 'Heavy Cream',
    'whipping cream': 'Cream 25% fat',
    'skim milk powder': 'Skim Milk Powder',
    'nonfat dry milk': 'Skim Milk Powder',
    'stabilizer': 'Stabilizer Blend',
    'egg yolk': 'Egg Yolks',
    'vanilla': 'Vanilla Extract',
  };
  
  const searchLower = searchName.toLowerCase();
  const resolvedName = aliases[searchLower] || searchName;
  
  return getIngredientByName(resolvedName);
}

/**
 * Validate ingredient data completeness - ENHANCED with NaN checks
 */
export function validateIngredientData(ing: IngredientData): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check for missing critical data
  if (!ing.name || !ing.id) {
    warnings.push('Missing ingredient name or ID');
  }
  
  if (ing.water_pct === undefined || ing.fat_pct === undefined) {
    warnings.push('Missing basic composition data (water, fat)');
  }
  
  // Check for NaN or invalid numbers (CRITICAL FIX)
  const numericFields = {
    'water_pct': ing.water_pct,
    'fat_pct': ing.fat_pct,
    'sugars_pct': ing.sugars_pct,
    'msnf_pct': ing.msnf_pct,
    'other_solids_pct': ing.other_solids_pct,
    'sp_coeff': ing.sp_coeff,
    'pac_coeff': ing.pac_coeff
  };
  
  for (const [field, value] of Object.entries(numericFields)) {
    if (value !== undefined && (isNaN(value) || !isFinite(value))) {
      warnings.push(`${field} is NaN or infinite - this will break calculations! Defaulting to 0.`);
    }
  }
  
  // Sugar coefficient validation (prevent NaN in SP/PAC calculations)
  if (ing.category === 'sugar' || (ing.sugars_pct && ing.sugars_pct > 0)) {
    if (ing.sp_coeff === undefined || isNaN(ing.sp_coeff)) {
      warnings.push(`Missing or invalid sp_coeff for sugar ingredient - SP calculations will be inaccurate. Defaulting to 1.0 (sucrose baseline).`);
    }
    if (ing.pac_coeff === undefined || isNaN(ing.pac_coeff)) {
      warnings.push(`Missing or invalid pac_coeff for sugar ingredient - PAC calculations will be inaccurate. Defaulting to 100 (sucrose baseline).`);
    }
  }
  
  // Composition sum validation
  const total = (ing.water_pct || 0) + (ing.fat_pct || 0) + (ing.sugars_pct || 0) + 
                (ing.msnf_pct || 0) + (ing.other_solids_pct || 0);
  
  if (isNaN(total)) {
    warnings.push('Total composition is NaN - check all percentage fields!');
  } else if (Math.abs(total - 100) > 1) {
    warnings.push(`Composition doesn't sum to 100% (currently ${total.toFixed(1)}%)`);
  }
  
  // Fruit sugar split validation
  if (ing.category === 'fruit' && ing.sugar_split) {
    const { glucose = 0, fructose = 0, sucrose = 0 } = ing.sugar_split;
    const splitTotal = glucose + fructose + sucrose;
    if (isNaN(splitTotal)) {
      warnings.push('Fruit sugar split contains NaN values');
    } else if (splitTotal > 0 && Math.abs(splitTotal - 100) > 5) {
      warnings.push(`Fruit sugar split should sum to ~100% (currently ${splitTotal.toFixed(1)}%)`);
    }
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}
