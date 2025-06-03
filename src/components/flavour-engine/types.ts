
export interface Ingredient {
  name: string;
  pac: number; // Protein as Casein
  pod: number; // Protein Other than Dairy
  afp: number; // Anti-Freeze Protein
  fat: number;
  msnf: number; // Milk Solids Non-Fat
  cost: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface RecipeTargets {
  totalSolids: { min: number; max: number };
  fat: { min: number; max: number };
  msnf: { min: number; max: number };
  pac: { min: number; max: number };
  sweetness: { min: number; max: number };
}

export interface RecipeMetrics {
  totalSolids: number;
  fat: number;
  msnf: number;
  pac: number;
  sweetness: number;
  cost: number;
  totalWeight: number;
}

export interface OptimizationSuggestion {
  type: 'warning' | 'info' | 'success';
  message: string;
  action: () => void;
}
