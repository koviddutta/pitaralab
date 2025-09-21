
import { Ingredient, RecipeMetrics, RecipeTargets, OptimizationSuggestion } from './types';

export const calculateRecipeMetrics = (
  recipe: { [key: string]: number },
  ingredients: Ingredient[]
): RecipeMetrics => {
  const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + amount, 0);
  
  let totalFat = 0;
  let totalMSNF = 0;
  let totalPAC = 0;
  let totalPOD = 0;
  let totalSP = 0;
  let totalCost = 0;

  Object.entries(recipe).forEach(([ingredientName, amount]) => {
    const ingredient = ingredients.find(ing => ing.name === ingredientName);
    if (ingredient && amount > 0) {
      const ratio = amount / 1000;
      totalFat += (ingredient.fat * amount) / 100;
      totalMSNF += (ingredient.msnf * amount) / 100;
      totalPAC += (ingredient.pac * amount) / 100;
      totalPOD += (ingredient.pod * amount) / 100;
      totalSP += (ingredient.sp * amount) / 100;
      totalCost += ingredient.cost * ratio;
    }
  });

  const fatPercentage = (totalFat / totalWeight) * 100;
  const msnfPercentage = (totalMSNF / totalWeight) * 100;
  const pacPercentage = (totalPAC / totalWeight) * 100;
  const totalSolids = fatPercentage + msnfPercentage;
  const sweetness = (recipe['Sugar'] / totalWeight) * 100;

  return {
    totalSolids,
    fat: fatPercentage,
    msnf: msnfPercentage,
    pac: pacPercentage,
    sweetness,
    cost: totalCost,
    totalWeight
  };
};

export const checkTargets = (metrics: RecipeMetrics, targets: RecipeTargets) => {
  return {
    totalSolids: metrics.totalSolids >= targets.totalSolids.min && metrics.totalSolids <= targets.totalSolids.max,
    fat: metrics.fat >= targets.fat.min && metrics.fat <= targets.fat.max,
    msnf: metrics.msnf >= targets.msnf.min && metrics.msnf <= targets.msnf.max,
    pac: metrics.pac >= targets.pac.min && metrics.pac <= targets.pac.max,
    sweetness: metrics.sweetness >= targets.sweetness.min && metrics.sweetness <= targets.sweetness.max
  };
};

export const generateOptimizationSuggestions = (
  targetResults: { [key: string]: boolean },
  metrics: RecipeMetrics,
  targets: RecipeTargets,
  recipe: { [key: string]: number },
  updateRecipe: (ingredient: string, value: string) => void
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  
  if (!targetResults.fat) {
    if (metrics.fat < targets.fat.min) {
      suggestions.push({
        type: 'warning',
        message: "Increase heavy cream by 50-100ml to boost fat content",
        action: () => updateRecipe('Heavy Cream', String(recipe['Heavy Cream'] + 75))
      });
    } else {
      suggestions.push({
        type: 'warning',
        message: "Reduce heavy cream by 50ml and increase milk to lower fat",
        action: () => {
          updateRecipe('Heavy Cream', String(recipe['Heavy Cream'] - 50));
          updateRecipe('Whole Milk', String(recipe['Whole Milk'] + 50));
        }
      });
    }
  }
  
  if (!targetResults.msnf && metrics.msnf < targets.msnf.min) {
    suggestions.push({
      type: 'info',
      message: "Add milk powder or increase milk content for more MSNF",
      action: () => updateRecipe('Whole Milk', String(recipe['Whole Milk'] + 30))
    });
  }
  
  if (!targetResults.sweetness) {
    if (metrics.sweetness < targets.sweetness.min) {
      suggestions.push({
        type: 'success',
        message: "Increase sugar by 10-20g for target sweetness",
        action: () => updateRecipe('Sugar', String(recipe['Sugar'] + 15))
      });
    } else {
      suggestions.push({
        type: 'success',
        message: "Reduce sugar by 10-15g to lower sweetness",
        action: () => updateRecipe('Sugar', String(recipe['Sugar'] - 12))
      });
    }
  }

  return suggestions;
};
