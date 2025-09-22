import { calcMetrics } from '@/lib/calc';
import { optimizeRecipe, Row, OptimizeTarget } from '@/lib/optimize';
import { IngredientData } from '@/types/ingredients';

export interface RecipeMetrics {
  totalWeight: number;
  sugarPercentage: number;
  fatPercentage: number;
  proteinPercentage: number;
  sweetness: number;
  complexity: number;
  totalSolids: number;
  msnf: number;
  pac: number;
  afp: number;
  sp: number;
}

export interface FlavorProfile {
  sweetness: number;
  creaminess: number;
  richness: number;
  complexity: number;
  balance: number;
  intensity: number;
}

export interface MLPrediction {
  successScore: number;
  flavorProfile: FlavorProfile;
  recommendations: string[];
  similarRecipes: string[];
  confidence: number;
}

export interface IngredientSimilarity {
  ingredient: string;
  similarity: number;
  reason: string;
}

interface OptimizationSuggestion {
  ingredient: string;
  currentAmount: number;
  suggestedAmount: number;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

export class MLService {
  predictRecipeSuccess(_: any): MLPrediction { 
    return {
      successScore: 0.75,
      flavorProfile: {
        sweetness: 0.7,
        creaminess: 0.8,
        richness: 0.6,
        complexity: 0.5,
        balance: 0.7,
        intensity: 0.6
      },
      recommendations: ['Add vanilla for enhanced flavor', 'Consider balancing sweetness'],
      similarRecipes: ['Classic Vanilla', 'Traditional Base'],
      confidence: 70
    };
  }

  findSimilarIngredients(_: IngredientData): IngredientSimilarity[] { 
    return [
      { ingredient: 'Similar ingredient 1', similarity: 0.8, reason: 'Similar category' },
      { ingredient: 'Similar ingredient 2', similarity: 0.6, reason: 'Similar function' }
    ]; 
  }

  calculateRecipeMetrics(recipe: { rows: { ing: IngredientData; grams: number }[] } | { [key: string]: number }) {
    // Handle legacy format
    if ('rows' in recipe && Array.isArray(recipe.rows)) {
      return calcMetrics(recipe.rows);
    } else {
      // Convert legacy format to new format - for now just return dummy data
      const total = Object.values(recipe as { [key: string]: number }).reduce((sum, val) => sum + (val || 0), 0);
      return {
        total_g: total,
        water_g: total * 0.7, sugars_g: total * 0.15, fat_g: total * 0.08, msnf_g: total * 0.05, other_g: total * 0.02,
        water_pct: 70, sugars_pct: 15, fat_pct: 8, msnf_pct: 5, other_pct: 2,
        ts_add_g: total * 0.3, ts_mass_g: total * 0.3, ts_add_pct: 30, ts_mass_pct: 30,
        sp: 18, pac: 25
      };
    }
  }

  optimizeRecipe(seed: Row[], targets: OptimizeTarget) {
    return optimizeRecipe(seed, targets, 250, 1);
  }

  getModelPerformance() {
    return { accuracy: 0.85, totalPredictions: 1250, modelVersion: 'v2.0' };
  }

  reverseEngineer(input: {
    productType: 'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet';
    known?: Partial<{ fat_pct:number; sugars_pct:number; msnf_pct:number; ts_add_pct:number; sp:number; pac:number }>;
    palette: IngredientData[];
    totalMass?: number;
  }) {
    const total = input.totalMass ?? 1000;
    const rows: Row[] = input.palette.map(ing => ({ ing, grams: 0 }));

    // seed sugars (70/10/20 split if available)
    const suc = rows.find(r => r.ing.id.includes('sucrose'));
    const dex = rows.find(r => r.ing.id.includes('dextrose'));
    const glu = rows.find(r => r.ing.id.includes('glucose_de60'));

    const targetSugPct = input.known?.sugars_pct ?? 18;
    const targetSugG = (targetSugPct / 100) * total;

    if (suc && dex && glu) {
      suc.grams = targetSugG * 0.70 / ((suc.ing.sugars_pct||100)/100);
      dex.grams = targetSugG * 0.10 / ((dex.ing.sugars_pct||100)/100);
      glu.grams = targetSugG * 0.20 / ((glu.ing.sugars_pct||100)/100);
    } else if (suc) {
      suc.grams = targetSugG / ((suc.ing.sugars_pct||100)/100);
    }

    // hit fat via cream/milk
    const fatPct = input.known?.fat_pct ?? 8;
    const fatG = (fatPct/100)*total;
    const cream = rows.find(r => r.ing.id==='cream_25');
    const milk = rows.find(r => r.ing.id==='milk_3');
    if (cream && milk) {
      cream.grams = Math.min(total, fatG / (cream.ing.fat_pct/100));
      const used = cream.grams;
      milk.grams = Math.max(0, total - rows.reduce((a,r)=>a + (r.grams||0),0));
    } else if (milk) {
      milk.grams = total - rows.reduce((a,r)=>a + (r.grams||0),0);
    }

    // optimize against % targets
    const targets: OptimizeTarget = {
      ts_add_pct: input.known?.ts_add_pct,
      sugars_pct: input.known?.sugars_pct,
      fat_pct:    input.known?.fat_pct,
      msnf_pct:   input.known?.msnf_pct,
      sp:         input.known?.sp,
      pac:        input.known?.pac,
    };

    const out = optimizeRecipe(rows, targets, 200, 5);
    return { rows: out, metrics: calcMetrics(out) };
  }
}

export const mlService = new MLService();