
import React, { useState } from 'react';
import { Brain, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Ingredient {
  name: string;
  pac: number; // Protein as Casein
  pod: number; // Protein Other than Dairy
  afp: number; // Anti-Freeze Protein
  fat: number;
  msnf: number; // Milk Solids Non-Fat
  cost: number;
  confidence: 'high' | 'medium' | 'low';
}

interface RecipeTargets {
  totalSolids: { min: number; max: number };
  fat: { min: number; max: number };
  msnf: { min: number; max: number };
  pac: { min: number; max: number };
  sweetness: { min: number; max: number };
}

const FlavourEngine = () => {
  const [ingredients] = useState<Ingredient[]>([
    { name: 'Heavy Cream', pac: 2.8, pod: 0.2, afp: 0.1, fat: 35, msnf: 5.5, cost: 4.5, confidence: 'high' },
    { name: 'Whole Milk', pac: 2.7, pod: 0.3, afp: 0.05, fat: 3.5, msnf: 8.5, cost: 2.2, confidence: 'high' },
    { name: 'Sugar', pac: 0, pod: 0, afp: 0, fat: 0, msnf: 0, cost: 3.0, confidence: 'high' },
    { name: 'Egg Yolks', pac: 15.7, pod: 0.8, afp: 0.3, fat: 31.9, msnf: 1.1, cost: 8.0, confidence: 'medium' },
    { name: 'Stabilizer', pac: 0, pod: 85, afp: 2.5, fat: 0, msnf: 0, cost: 12.0, confidence: 'medium' }
  ]);

  const [recipe, setRecipe] = useState<{[key: string]: number}>({
    'Heavy Cream': 500,
    'Whole Milk': 250,
    'Sugar': 120,
    'Egg Yolks': 100,
    'Stabilizer': 2
  });

  const [targets] = useState<RecipeTargets>({
    totalSolids: { min: 36, max: 42 },
    fat: { min: 14, max: 18 },
    msnf: { min: 9, max: 12 },
    pac: { min: 3.2, max: 4.5 },
    sweetness: { min: 14, max: 18 }
  });

  const calculateRecipeMetrics = () => {
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + amount, 0);
    
    let totalFat = 0;
    let totalMSNF = 0;
    let totalPAC = 0;
    let totalPOD = 0;
    let totalAFP = 0;
    let totalCost = 0;

    Object.entries(recipe).forEach(([ingredientName, amount]) => {
      const ingredient = ingredients.find(ing => ing.name === ingredientName);
      if (ingredient && amount > 0) {
        const ratio = amount / 1000; // Convert to kg for calculations
        totalFat += (ingredient.fat * amount) / 100;
        totalMSNF += (ingredient.msnf * amount) / 100;
        totalPAC += (ingredient.pac * amount) / 100;
        totalPOD += (ingredient.pod * amount) / 100;
        totalAFP += (ingredient.afp * amount) / 100;
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

  const metrics = calculateRecipeMetrics();

  const checkTargets = () => {
    const results = {
      totalSolids: metrics.totalSolids >= targets.totalSolids.min && metrics.totalSolids <= targets.totalSolids.max,
      fat: metrics.fat >= targets.fat.min && metrics.fat <= targets.fat.max,
      msnf: metrics.msnf >= targets.msnf.min && metrics.msnf <= targets.msnf.max,
      pac: metrics.pac >= targets.pac.min && metrics.pac <= targets.pac.max,
      sweetness: metrics.sweetness >= targets.sweetness.min && metrics.sweetness <= targets.sweetness.max
    };
    
    return results;
  };

  const targetResults = checkTargets();
  const allTargetsMet = Object.values(targetResults).every(result => result);

  const generateOptimizationSuggestions = () => {
    const suggestions = [];
    
    if (!targetResults.fat) {
      if (metrics.fat < targets.fat.min) {
        suggestions.push("Increase heavy cream by 50-100ml to boost fat content");
      } else {
        suggestions.push("Reduce heavy cream by 50ml and increase milk to lower fat");
      }
    }
    
    if (!targetResults.msnf) {
      if (metrics.msnf < targets.msnf.min) {
        suggestions.push("Add milk powder or increase milk content for more MSNF");
      }
    }
    
    if (!targetResults.sweetness) {
      if (metrics.sweetness < targets.sweetness.min) {
        suggestions.push("Increase sugar by 10-20g for target sweetness");
      } else {
        suggestions.push("Reduce sugar by 10-15g to lower sweetness");
      }
    }
    
    if (!targetResults.pac) {
      if (metrics.pac < targets.pac.min) {
        suggestions.push("Add more egg yolks or milk protein for PAC targets");
      }
    }

    return suggestions;
  };

  const suggestions = generateOptimizationSuggestions();

  const updateRecipe = (ingredient: string, value: string) => {
    setRecipe(prev => ({
      ...prev,
      [ingredient]: Number(value) || 0
    }));
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Flavour Engine
        </CardTitle>
        <CardDescription>
          Data-driven recipe optimization for ice cream and gelato development
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recipe Inputs */}
          <div className="lg:col-span-1">
            <Label className="text-base font-semibold mb-4 block">Recipe Formulation</Label>
            <div className="space-y-3">
              {Object.entries(recipe).map(([ingredient, amount]) => (
                <div key={ingredient}>
                  <Label className="text-sm text-gray-600">{ingredient} (g/ml)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => updateRecipe(ingredient, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Metrics & Analysis */}
          <div className="lg:col-span-1">
            <Label className="text-base font-semibold mb-4 block">Chemistry Analysis</Label>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Solids</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.totalSolids.toFixed(1)}%</span>
                    {targetResults.totalSolids ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-500">Target: {targets.totalSolids.min}-{targets.totalSolids.max}%</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fat Content</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.fat.toFixed(1)}%</span>
                    {targetResults.fat ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-500">Target: {targets.fat.min}-{targets.fat.max}%</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MSNF</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.msnf.toFixed(1)}%</span>
                    {targetResults.msnf ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-500">Target: {targets.msnf.min}-{targets.msnf.max}%</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PAC</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.pac.toFixed(1)}%</span>
                    {targetResults.pac ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-500">Target: {targets.pac.min}-{targets.pac.max}%</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sweetness</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.sweetness.toFixed(1)}%</span>
                    {targetResults.sweetness ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
                <div className="text-xs text-gray-500">Target: {targets.sweetness.min}-{targets.sweetness.max}%</div>
              </div>

              <Separator />

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Batch Cost</span>
                  <span className="font-semibold text-blue-800">₹{metrics.cost.toFixed(2)}</span>
                </div>
                <div className="text-xs text-blue-600">Total Weight: {metrics.totalWeight}g</div>
              </div>
            </div>
          </div>

          {/* AI Optimization */}
          <div className="lg:col-span-1">
            <Label className="text-base font-semibold mb-4 block">AI Optimization</Label>
            
            <div className={`p-4 rounded-lg mb-4 ${allTargetsMet ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {allTargetsMet ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <Target className="h-5 w-5 text-red-600" />
                }
                <span className={`font-semibold ${allTargetsMet ? 'text-green-800' : 'text-red-800'}`}>
                  {allTargetsMet ? 'Recipe Balanced!' : 'Needs Optimization'}
                </span>
              </div>
              <p className={`text-sm ${allTargetsMet ? 'text-green-700' : 'text-red-700'}`}>
                {allTargetsMet ? 
                  'All chemistry targets met. Ready for production!' : 
                  'Some parameters are out of target range.'
                }
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Optimization Suggestions
                </Label>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={allTargetsMet}
            >
              <Brain className="h-4 w-4 mr-2" />
              Auto-Optimize Recipe
            </Button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs font-medium text-gray-600">Development Status</Label>
              <div className="text-sm mt-1">
                <div className="flex justify-between">
                  <span>R&D Cycle:</span>
                  <span className="font-medium">~2 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-medium">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlavourEngine;
