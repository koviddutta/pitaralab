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
 * Validate ingredient data completeness
 */
export function validateIngredientData(ing: IngredientData): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  if (!ing.name || !ing.id) {
    warnings.push('Missing ingredient name or ID');
  }
  
  if (ing.water_pct === undefined || ing.fat_pct === undefined) {
    warnings.push('Missing basic composition data (water, fat)');
  }
  
  const total = (ing.water_pct || 0) + (ing.fat_pct || 0) + (ing.sugars_pct || 0) + 
                (ing.msnf_pct || 0) + (ing.other_solids_pct || 0);
  
  if (Math.abs(total - 100) > 1) {
    warnings.push(`Composition doesn't sum to 100% (currently ${total.toFixed(1)}%)`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}
