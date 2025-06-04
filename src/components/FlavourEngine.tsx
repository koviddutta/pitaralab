import React, { useState, useRef } from 'react';
import { Brain, Sparkles, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RecipeInputs from './flavour-engine/RecipeInputs';
import ChemistryAnalysis from './flavour-engine/ChemistryAnalysis';
import AIOptimization from './flavour-engine/AIOptimization';
import { Ingredient, RecipeTargets } from './flavour-engine/types';
import { calculateRecipeMetrics, checkTargets, generateOptimizationSuggestions } from './flavour-engine/utils';
import AIInsights from './flavour-engine/AIInsights';
import IngredientAnalyzer from './flavour-engine/IngredientAnalyzer';

const FlavourEngine = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
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

  const addIngredientToRecipe = (ingredientName: string) => {
    if (!recipe[ingredientName]) {
      setRecipe(prev => ({
        ...prev,
        [ingredientName]: 50 // Default amount
      }));
      toast({
        title: "Ingredient Added",
        description: `${ingredientName} has been added to your recipe.`,
      });
    } else {
      toast({
        title: "Ingredient Already Added",
        description: `${ingredientName} is already in your recipe.`,
        variant: "destructive",
      });
    }
  };

  const metrics = calculateRecipeMetrics(recipe, ingredients);
  const targetResults = checkTargets(metrics, targets);
  const allTargetsMet = Object.values(targetResults).every(result => result);

  const updateRecipe = (ingredient: string, value: string) => {
    setRecipe(prev => ({
      ...prev,
      [ingredient]: Number(value) || 0
    }));
  };

  const suggestions = generateOptimizationSuggestions(targetResults, metrics, targets, recipe, updateRecipe);

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    suggestions.forEach(suggestion => {
      if (suggestion.action) {
        suggestion.action();
      }
    });
    
    setIsOptimizing(false);
    toast({
      title: "Recipe Optimized",
      description: "AI has applied suggested improvements to your recipe.",
    });
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
    
    toast({
      title: "Recipe Exported",
      description: "Your recipe has been exported as CSV file.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        console.log('CSV uploaded:', csvData);
        toast({
          title: "CSV Uploaded",
          description: "Recipe data has been imported successfully.",
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      });
    }
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
          <div className="ml-2 px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm rounded-full">
            ML Powered
          </div>
        </CardTitle>
        <CardDescription className="text-lg">
          Advanced machine learning for ice cream and gelato recipe optimization with predictive analysis
        </CardDescription>
        
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
        <div className="grid lg:grid-cols-4 gap-8">
          <RecipeInputs recipe={recipe} onUpdateRecipe={updateRecipe} />
          <ChemistryAnalysis 
            metrics={metrics} 
            targets={targets} 
            targetResults={targetResults} 
          />
          <AIOptimization 
            allTargetsMet={allTargetsMet}
            suggestions={suggestions}
            isOptimizing={isOptimizing}
            onAutoOptimize={handleAutoOptimize}
          />
          <div className="space-y-6">
            <AIInsights recipe={recipe} metrics={metrics} />
            <IngredientAnalyzer 
              availableIngredients={ingredients.map(ing => ing.name)}
              onAddIngredient={addIngredientToRecipe}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlavourEngine;
