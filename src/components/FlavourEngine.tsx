
import React, { useState, useRef } from 'react';
import { Brain, Zap, Target, AlertTriangle, CheckCircle, Upload, Download, Save, Sparkles } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ingredients] = useState<Ingredient[]>([
    { name: 'Heavy Cream', pac: 2.8, pod: 0.2, afp: 0.1, fat: 35, msnf: 5.5, cost: 4.5, confidence: 'high' },
    { name: 'Whole Milk', pac: 2.7, pod: 0.3, afp: 0.05, fat: 3.5, msnf: 8.5, cost: 2.2, confidence: 'high' },
    { name: 'Sugar', pac: 0, pod: 0, afp: 0, fat: 0, msnf: 0, cost: 3.0, confidence: 'high' },
    { name: 'Egg Yolks', pac: 15.7, pod: 0.8, afp: 0.3, fat: 31.9, msnf: 1.1, cost: 8.0, confidence: 'medium' },
    { name: 'Stabilizer', pac: 0, pod: 85, afp: 2.5, fat: 0, msnf: 0, cost: 12.0, confidence: 'medium' },
    { name: 'Vanilla Extract', pac: 0, pod: 0, afp: 0, fat: 0, msnf: 0, cost: 25.0, confidence: 'high' },
    { name: 'Cocoa Powder', pac: 19.6, pod: 1.2, afp: 0.2, fat: 10.8, msnf: 3.4, cost: 15.0, confidence: 'medium' }
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

  const [isOptimizing, setIsOptimizing] = useState(false);

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
        const ratio = amount / 1000;
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

  const suggestions = generateOptimizationSuggestions();

  const updateRecipe = (ingredient: string, value: string) => {
    setRecipe(prev => ({
      ...prev,
      [ingredient]: Number(value) || 0
    }));
  };

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply all suggestions automatically
    suggestions.forEach(suggestion => {
      if (suggestion.action) {
        suggestion.action();
      }
    });
    
    setIsOptimizing(false);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Ingredient', 'Amount (g/ml)', 'PAC (%)', 'POD (%)', 'AFP (%)', 'Fat (%)', 'MSNF (%)', 'Cost (₹/kg)'],
      ...Object.entries(recipe).map(([name, amount]) => {
        const ingredient = ingredients.find(ing => ing.name === name);
        return [
          name,
          amount,
          ingredient?.pac || 0,
          ingredient?.pod || 0,
          ingredient?.afp || 0,
          ingredient?.fat || 0,
          ingredient?.msnf || 0,
          ingredient?.cost || 0
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ice_cream_recipe.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        // Parse CSV and update recipe (simplified implementation)
        console.log('CSV uploaded:', csvData);
      };
      reader.readAsText(file);
    }
  };

  const getMetricColor = (isInRange: boolean) => {
    return isInRange ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200';
  };

  const getMetricIconColor = (isInRange: boolean) => {
    return isInRange ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-50 to-indigo-100 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          AI Flavour Engine
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
        </CardTitle>
        <CardDescription className="text-lg">
          Data-driven recipe optimization for ice cream and gelato development
        </CardDescription>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Recipe
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recipe Inputs */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Save className="h-5 w-5 text-purple-600" />
              <Label className="text-lg font-semibold">Recipe Formulation</Label>
            </div>
            <div className="space-y-4">
              {Object.entries(recipe).map(([ingredient, amount]) => (
                <div key={ingredient} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">{ingredient}</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => updateRecipe(ingredient, e.target.value)}
                    className="bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Amount (g/ml)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Metrics & Analysis */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-indigo-600" />
              <Label className="text-lg font-semibold">Chemistry Analysis</Label>
            </div>
            <div className="space-y-4">
              {[
                { key: 'totalSolids', label: 'Total Solids', unit: '%', target: targets.totalSolids },
                { key: 'fat', label: 'Fat Content', unit: '%', target: targets.fat },
                { key: 'msnf', label: 'MSNF', unit: '%', target: targets.msnf },
                { key: 'pac', label: 'PAC', unit: '%', target: targets.pac },
                { key: 'sweetness', label: 'Sweetness', unit: '%', target: targets.sweetness }
              ].map(({ key, label, unit, target }) => {
                const value = metrics[key as keyof typeof metrics] as number;
                const isInRange = targetResults[key as keyof typeof targetResults];
                
                return (
                  <div key={key} className={`p-4 rounded-lg border bg-gradient-to-r ${getMetricColor(isInRange)} transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{value.toFixed(1)}{unit}</span>
                        {isInRange ? 
                          <CheckCircle className={`h-5 w-5 ${getMetricIconColor(isInRange)}`} /> : 
                          <AlertTriangle className={`h-5 w-5 ${getMetricIconColor(isInRange)}`} />
                        }
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Target: {target.min}-{target.max}{unit}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isInRange ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, (value / target.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator className="my-4" />

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-blue-800">Batch Cost</span>
                  <span className="font-bold text-xl text-blue-900">₹{metrics.cost.toFixed(2)}</span>
                </div>
                <div className="text-xs text-blue-600">Total Weight: {metrics.totalWeight}g</div>
              </div>
            </div>
          </div>

          {/* AI Optimization */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-yellow-600" />
              <Label className="text-lg font-semibold">AI Optimization</Label>
            </div>
            
            <div className={`p-6 rounded-lg mb-6 border-2 transition-all ${allTargetsMet ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'}`}>
              <div className="flex items-center gap-3 mb-3">
                {allTargetsMet ? 
                  <CheckCircle className="h-6 w-6 text-green-600" /> : 
                  <Target className="h-6 w-6 text-red-600" />
                }
                <span className={`font-bold text-lg ${allTargetsMet ? 'text-green-800' : 'text-red-800'}`}>
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
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  AI Suggestions
                </Label>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">{suggestion.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={suggestion.action}
                      className="text-xs bg-white hover:bg-yellow-100"
                    >
                      Apply Fix
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3"
              disabled={allTargetsMet || isOptimizing}
              onClick={handleAutoOptimize}
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Optimizing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Auto-Optimize Recipe
                </>
              )}
            </Button>

            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
              <Label className="text-xs font-semibold text-gray-700 mb-3 block">Development Status</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">R&D Cycle:</span>
                  <span className="font-semibold text-gray-800">~2 weeks → 1 day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-semibold text-gray-800">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold text-gray-800">Just now</span>
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
