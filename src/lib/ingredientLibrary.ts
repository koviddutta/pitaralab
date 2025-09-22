// Epic 1: Ingredient Schema & Seed Data (local only)

export type IngredientData = {
  id: string;
  name: string;
  category: 'dairy'|'sugar'|'stabilizer'|'fruit'|'flavor'|'fat'|'other';
  water_pct: number;          // %
  fat_pct: number;            // %
  msnf_pct?: number;          // % (dairy only)
  other_solids_pct?: number;  // % (stabilizers, cocoa solids, salts, fiber)
  sugars_pct?: number;        // % total sugars
  sp_coeff?: number;          // relative sweetness (sucrose=1.00)
  pac_coeff?: number;         // anti-freezing coeff (sucrose≈100 baseline)
  de?: number;                // for glucose syrups (e.g., 60)
  lactose_pct?: number;       // dairy specificity
  density_g_per_ml?: number;
  cost_per_kg?: number;
  notes?: string[];
};

export const DEFAULT_INGREDIENTS: IngredientData[] = [
  { 
    id: 'sucrose', 
    name: 'Sucrose', 
    category: 'sugar',
    water_pct: 0, 
    fat_pct: 0, 
    sugars_pct: 100, 
    sp_coeff: 1.00, 
    pac_coeff: 100,
    cost_per_kg: 45 
  },
  { 
    id: 'dextrose', 
    name: 'Dextrose', 
    category: 'sugar',
    water_pct: 0, 
    fat_pct: 0, 
    sugars_pct: 100, 
    sp_coeff: 0.74, 
    pac_coeff: 190,
    cost_per_kg: 55 
  },
  { 
    id: 'glucose_de60', 
    name: 'Glucose Syrup DE60', 
    category: 'sugar',
    water_pct: 20, 
    fat_pct: 0, 
    sugars_pct: 80, 
    de: 60, 
    sp_coeff: 0.50, 
    pac_coeff: 118, 
    other_solids_pct: 0,
    cost_per_kg: 38 
  },
  { 
    id: 'lactose', 
    name: 'Lactose', 
    category: 'sugar',
    water_pct: 0, 
    fat_pct: 0, 
    sugars_pct: 100, 
    sp_coeff: 0.16, 
    pac_coeff: 62,
    cost_per_kg: 85 
  },
  { 
    id: 'milk_3', 
    name: 'Milk 3% fat', 
    category: 'dairy',
    water_pct: 88.7, 
    fat_pct: 3, 
    msnf_pct: 8.5,
    lactose_pct: 4.8,
    cost_per_kg: 25 
  },
  { 
    id: 'cream_25', 
    name: 'Cream 25% fat', 
    category: 'dairy',
    water_pct: 68.2, 
    fat_pct: 25, 
    msnf_pct: 6.8,
    lactose_pct: 3.8,
    cost_per_kg: 120 
  },
  { 
    id: 'smp', 
    name: 'Skim Milk Powder', 
    category: 'dairy',
    water_pct: 3.5, 
    fat_pct: 1, 
    msnf_pct: 93,
    lactose_pct: 51,
    cost_per_kg: 180 
  },
  { 
    id: 'stabilizer', 
    name: 'Stabilizer Blend', 
    category: 'stabilizer',
    water_pct: 0, 
    fat_pct: 0, 
    other_solids_pct: 100,
    cost_per_kg: 850 
  },
  // Indian pastes (from your data pack)
  { 
    id: 'gulab_jamun_paste', 
    name: 'Gulab Jamun Paste', 
    category: 'flavor',
    water_pct: 41.6, 
    sugars_pct: 42.52, 
    fat_pct: 5.4, 
    msnf_pct: 8.1, 
    other_solids_pct: 3.38,
    sp_coeff: 0.85,
    pac_coeff: 125,
    cost_per_kg: 320 
  },
  { 
    id: 'gulab_jamun', 
    name: 'Gulab Jamun (pieces)', 
    category: 'flavor',
    water_pct: 30, 
    sugars_pct: 51.9, 
    fat_pct: 6, 
    msnf_pct: 8, 
    other_solids_pct: 4.1,
    sp_coeff: 0.90,
    pac_coeff: 135,
    cost_per_kg: 280 
  },
  { 
    id: 'rabri', 
    name: 'Rabri', 
    category: 'flavor',
    water_pct: 53.6, 
    sugars_pct: 14.36, 
    fat_pct: 18, 
    msnf_pct: 9.56, 
    other_solids_pct: 7.84,
    sp_coeff: 0.75,
    pac_coeff: 95,
    cost_per_kg: 450 
  },
  { 
    id: 'jalebi', 
    name: 'Jalebi', 
    category: 'flavor',
    water_pct: 38.55, 
    sugars_pct: 34.55, 
    fat_pct: 6.36, 
    msnf_pct: 2.36, 
    other_solids_pct: 18.18,
    sp_coeff: 0.95,
    pac_coeff: 145,
    cost_per_kg: 350 
  },
  { 
    id: 'cocoa_dp', 
    name: 'Cocoa Powder (Dutch)', 
    category: 'flavor',
    water_pct: 0, 
    sugars_pct: 0.5, 
    fat_pct: 23, 
    other_solids_pct: 62.4,
    sp_coeff: 0.1,
    pac_coeff: 15,
    cost_per_kg: 680 
  },
  {
    id: 'heavy_cream',
    name: 'Heavy Cream',
    category: 'dairy',
    water_pct: 57.3,
    fat_pct: 38,
    msnf_pct: 4.7,
    lactose_pct: 2.8,
    cost_per_kg: 180
  },
  {
    id: 'whole_milk',
    name: 'Whole Milk',
    category: 'dairy',
    water_pct: 87.4,
    fat_pct: 3.7,
    msnf_pct: 8.9,
    lactose_pct: 4.9,
    cost_per_kg: 28
  },
  {
    id: 'egg_yolks',
    name: 'Egg Yolks',
    category: 'other',
    water_pct: 50.4,
    fat_pct: 31.9,
    other_solids_pct: 17.7,
    sp_coeff: 0.1,
    pac_coeff: 25,
    cost_per_kg: 450
  },
  {
    id: 'vanilla_extract',
    name: 'Vanilla Extract',
    category: 'flavor',
    water_pct: 65,
    fat_pct: 0,
    other_solids_pct: 35,
    sp_coeff: 0.2,
    pac_coeff: 30,
    cost_per_kg: 3200
  }
];

// Ingredient lookup functions
export const getIngredientById = (id: string): IngredientData | null => {
  return DEFAULT_INGREDIENTS.find(ing => ing.id === id) || null;
};

export const getIngredientByName = (name: string): IngredientData | null => {
  return DEFAULT_INGREDIENTS.find(ing => 
    ing.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

export const getIngredientsByCategory = (category: IngredientData['category']): IngredientData[] => {
  return DEFAULT_INGREDIENTS.filter(ing => ing.category === category);
};

// Sugar spectrum classification
export const classifySugarType = (ingredient: IngredientData): 'disaccharide' | 'monosaccharide' | 'polysaccharide' | 'other' => {
  if (ingredient.id === 'sucrose' || ingredient.id === 'lactose') return 'disaccharide';
  if (ingredient.id === 'dextrose' || ingredient.name.toLowerCase().includes('fructose')) return 'monosaccharide';
  if (ingredient.de && ingredient.de < 50) return 'polysaccharide';
  if (ingredient.name.toLowerCase().includes('glucose') || ingredient.name.toLowerCase().includes('syrup')) return 'polysaccharide';
  return 'other';
};

export function getSeedIngredients(): IngredientData[] {
  return DEFAULT_INGREDIENTS;
}