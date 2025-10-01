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
  
  // Fruit-specific: sugar breakdown (glucose + fructose + sucrose ≈ 100%)
  sugar_split?: { glucose?: number; fructose?: number; sucrose?: number };
  brix_estimate?: number;     // typical °Brix
  acidity_citric_pct?: number; // % citric acid equivalent
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
    id: 'fructose',
    name: 'Fructose',
    category: 'sugar',
    water_pct: 0,
    fat_pct: 0,
    sugars_pct: 100,
    sp_coeff: 1.73,
    pac_coeff: 190,
    cost_per_kg: 120
  },
  { 
    id: 'invert_sugar',
    name: 'Invert Sugar',
    category: 'sugar',
    water_pct: 25,
    fat_pct: 0,
    sugars_pct: 75,
    sp_coeff: 1.25,
    pac_coeff: 190,
    cost_per_kg: 65
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
  // Sugar toolbox additions
  {
    id: 'maltodextrin_de19',
    name: 'Maltodextrin DE19',
    category: 'sugar',
    water_pct: 5,
    fat_pct: 0,
    sugars_pct: 95,
    de: 19,
    sp_coeff: 0.05,
    pac_coeff: 12,
    other_solids_pct: 0,
    cost_per_kg: 48,
    notes: ['Adds body without sweetness', 'Typical dosage: 2-4%']
  },
  {
    id: 'inulin_hp',
    name: 'Inulin HP',
    category: 'other',
    water_pct: 5,
    fat_pct: 0,
    sugars_pct: 0,
    other_solids_pct: 95,
    sp_coeff: 0,
    pac_coeff: 5,
    cost_per_kg: 280,
    notes: ['Prebiotic fiber', 'Improves texture', 'Max dosage: 3-5%']
  },
  {
    id: 'polydextrose',
    name: 'Polydextrose',
    category: 'other',
    water_pct: 10,
    fat_pct: 0,
    sugars_pct: 0,
    other_solids_pct: 90,
    sp_coeff: 0.1,
    pac_coeff: 8,
    cost_per_kg: 320,
    notes: ['Sugar replacer', 'Adds bulk and body', 'Max dosage: 4-6%']
  },
  {
    id: 'sorbitol',
    name: 'Sorbitol',
    category: 'sugar',
    water_pct: 0,
    fat_pct: 0,
    sugars_pct: 100,
    sp_coeff: 0.60,
    pac_coeff: 180,
    cost_per_kg: 150,
    notes: ['Sugar alcohol', 'Humectant', 'May cause laxative effect >10g/serve']
  },
  {
    id: 'glycerol',
    name: 'Glycerol (Glycerin)',
    category: 'other',
    water_pct: 0,
    fat_pct: 0,
    sugars_pct: 0,
    other_solids_pct: 100,
    sp_coeff: 0.6,
    pac_coeff: 75,
    cost_per_kg: 95,
    notes: ['Humectant', 'Prevents ice crystal formation', 'Max dosage: 2-3%']
  },
  // Dairy
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
  // Stabilizers
  { 
    id: 'stabilizer', 
    name: 'Stabilizer Blend', 
    category: 'stabilizer',
    water_pct: 0, 
    fat_pct: 0, 
    other_solids_pct: 100,
    cost_per_kg: 850,
    notes: ['Typical dosage: 0.3-0.6%', 'Blend of LBG, guar, carrageenan']
  },
  {
    id: 'lbg',
    name: 'Locust Bean Gum (LBG)',
    category: 'stabilizer',
    water_pct: 10,
    fat_pct: 0,
    other_solids_pct: 90,
    cost_per_kg: 950,
    notes: ['Hydrate at 70-85°C', 'Synergistic with carrageenan', 'Dosage: 0.1-0.3%']
  },
  {
    id: 'guar_gum',
    name: 'Guar Gum',
    category: 'stabilizer',
    water_pct: 10,
    fat_pct: 0,
    other_solids_pct: 90,
    cost_per_kg: 420,
    notes: ['Hydrate at room temp', 'Quick viscosity build', 'Dosage: 0.1-0.25%']
  },
  {
    id: 'carrageenan',
    name: 'Carrageenan (Iota)',
    category: 'stabilizer',
    water_pct: 12,
    fat_pct: 0,
    other_solids_pct: 88,
    cost_per_kg: 780,
    notes: ['Hydrate at 75-80°C', 'Prevents wheying off', 'Dosage: 0.02-0.1%']
  },
  // Fruits with sugar splits
  {
    id: 'mango_alphonso',
    name: 'Mango Pulp (Alphonso)',
    category: 'fruit',
    water_pct: 82.3,
    fat_pct: 0.4,
    sugars_pct: 14.8,
    other_solids_pct: 2.5,
    sugar_split: { glucose: 2, fructose: 4.5, sucrose: 8.3 },
    brix_estimate: 18,
    acidity_citric_pct: 0.3,
    cost_per_kg: 180,
    notes: ['King of fruits', 'Rich aroma']
  },
  {
    id: 'strawberry',
    name: 'Strawberry Puree',
    category: 'fruit',
    water_pct: 90.95,
    fat_pct: 0.3,
    sugars_pct: 7.68,
    other_solids_pct: 1.07,
    sugar_split: { glucose: 2.0, fructose: 2.4, sucrose: 3.28 },
    brix_estimate: 9,
    acidity_citric_pct: 0.8,
    cost_per_kg: 240,
    notes: ['High acidity', 'Delicate flavor']
  },
  {
    id: 'raspberry',
    name: 'Raspberry Puree',
    category: 'fruit',
    water_pct: 85.75,
    fat_pct: 0.65,
    sugars_pct: 9.5,
    other_solids_pct: 4.1,
    sugar_split: { glucose: 2.35, fructose: 2.45, sucrose: 4.7 },
    brix_estimate: 11,
    acidity_citric_pct: 1.5,
    cost_per_kg: 580,
    notes: ['Very acidic', 'Intense flavor', 'Seeds present']
  },
  {
    id: 'banana',
    name: 'Banana Puree',
    category: 'fruit',
    water_pct: 74.91,
    fat_pct: 0.33,
    sugars_pct: 22.84,
    other_solids_pct: 1.92,
    sugar_split: { glucose: 4.98, fructose: 4.85, sucrose: 13.01 },
    brix_estimate: 25,
    acidity_citric_pct: 0.1,
    cost_per_kg: 120,
    notes: ['Low acidity', 'Rich body', 'Browning prone']
  },
  {
    id: 'pineapple',
    name: 'Pineapple Puree',
    category: 'fruit',
    water_pct: 86.0,
    fat_pct: 0.12,
    sugars_pct: 11.82,
    other_solids_pct: 2.06,
    sugar_split: { glucose: 2.0, fructose: 1.85, sucrose: 7.97 },
    brix_estimate: 13,
    acidity_citric_pct: 0.65,
    cost_per_kg: 160,
    notes: ['Tropical aroma', 'Bromelain enzyme present']
  },
  {
    id: 'lemon',
    name: 'Lemon Juice',
    category: 'fruit',
    water_pct: 92.31,
    fat_pct: 0.3,
    sugars_pct: 2.52,
    other_solids_pct: 4.87,
    sugar_split: { glucose: 0.5, fructose: 0.6, sucrose: 1.42 },
    brix_estimate: 8,
    acidity_citric_pct: 5.0,
    cost_per_kg: 95,
    notes: ['Very high acidity', 'Brightens flavors', 'Use sparingly']
  },
  {
    id: 'orange',
    name: 'Orange Juice',
    category: 'fruit',
    water_pct: 88.3,
    fat_pct: 0.2,
    sugars_pct: 9.35,
    other_solids_pct: 2.15,
    sugar_split: { glucose: 2.25, fructose: 2.55, sucrose: 4.55 },
    brix_estimate: 11,
    acidity_citric_pct: 0.9,
    cost_per_kg: 110,
    notes: ['Citrus burst', 'Balance sweet-tart']
  },
  {
    id: 'passion_fruit',
    name: 'Passion Fruit Pulp',
    category: 'fruit',
    water_pct: 72.93,
    fat_pct: 0.7,
    sugars_pct: 11.2,
    other_solids_pct: 15.17,
    sugar_split: { glucose: 3.6, fructose: 4.2, sucrose: 3.4 },
    brix_estimate: 14,
    acidity_citric_pct: 2.8,
    cost_per_kg: 420,
    notes: ['Intense aroma', 'High fiber/seeds', 'Exotic flavor']
  },
  {
    id: 'litchi',
    name: 'Litchi Pulp',
    category: 'fruit',
    water_pct: 81.76,
    fat_pct: 0.44,
    sugars_pct: 16.53,
    other_solids_pct: 1.27,
    sugar_split: { glucose: 5.8, fructose: 6.2, sucrose: 4.53 },
    brix_estimate: 19,
    acidity_citric_pct: 0.4,
    cost_per_kg: 220,
    notes: ['Floral notes', 'Delicate', 'Low acidity']
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
