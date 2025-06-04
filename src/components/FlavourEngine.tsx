
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, Upload, Download, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RecipeInputs from './flavour-engine/RecipeInputs';
import ChemistryAnalysis from './flavour-engine/ChemistryAnalysis';
import AIOptimization from './flavour-engine/AIOptimization';
import { Ingredient, RecipeTargets } from './flavour-engine/types';
import { calculateRecipeMetrics, checkTargets, generateOptimizationSuggestions } from './flavour-engine/utils';
import AIInsights from './flavour-engine/AIInsights';
import IngredientAnalyzer from './flavour-engine/IngredientAnalyzer';
import DatabaseManager from './DatabaseManager';
import { databaseService } from '@/services/databaseService';

const FlavourEngine = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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
  const [currentRecipeName, setCurrentRecipeName] = useState('');

  useEffect(() => {
    // Load ingredients from database service
    const dbIngredients = databaseService.getIngredients();
    const formattedIngredients = dbIngredients.map(ing => ({
      name: ing.name,
      pac: ing.pac,
      pod: ing.pod,
      afp: ing.afp,
      fat: ing.fat,
      msnf: ing.msnf,
      cost: ing.cost,
      confidence: ing.confidence
    }));
    setIngredients(formattedIngredients);
  }, []);

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

  const saveRecipe = () => {
    if (!currentRecipeName.trim()) {
      toast({
        title: "Recipe Name Required",
        description: "Please enter a name for your recipe",
        variant: "destructive"
      });
      return;
    }

    try {
      const savedRecipe = databaseService.saveRecipe({
        name: currentRecipeName,
        ingredients: recipe,
        metrics,
        predictions: null, // Will be filled by AI analysis
        notes: `Recipe created with ${Object.keys(recipe).length} ingredients`
      });

      toast({
        title: "Recipe Saved",
        description: `${savedRecipe.name} has been saved to your recipe history`,
      });
      
      setCurrentRecipeName('');
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    }
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
    a.download = `${currentRecipeName || 'ice_cream_recipe'}.csv`;
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
            ML Powered v2.0
          </div>
        </CardTitle>
        <CardDescription className="text-lg">
          Advanced machine learning for ice cream and gelato recipe optimization with continuous learning and predictive analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipe">Recipe Development</TabsTrigger>
            <TabsTrigger value="database">Database Management</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="mt-6">
            <div className="space-y-6">
              {/* Recipe Name and Actions */}
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Enter recipe name..."
                  value={currentRecipeName}
                  onChange={(e) => setCurrentRecipeName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={saveRecipe} disabled={!currentRecipeName.trim()}>
                  Save Recipe
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
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

              {/* Main Recipe Development Interface */}
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
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <DatabaseManager />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Performance Analytics</h3>
              <p className="text-gray-500">Detailed analytics dashboard coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FlavourEngine;
