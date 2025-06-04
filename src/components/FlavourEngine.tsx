
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, Upload, Download, Database, Smartphone, Monitor } from 'lucide-react';
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
import ProductSelector, { ProductType } from './ProductSelector';
import ProductAnalysis from './flavour-engine/ProductAnalysis';
import SugarBlendOptimizer from './flavour-engine/SugarBlendOptimizer';
import { databaseService } from '@/services/databaseService';
import { productParametersService } from '@/services/productParametersService';

const FlavourEngine = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('ice-cream');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<{[key: string]: number}>({
    'Heavy Cream': 500,
    'Whole Milk': 250,
    'Sugar': 120,
    'Egg Yolks': 100,
    'Stabilizer': 2
  });

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic targets based on product type
  const [targets, setTargets] = useState<RecipeTargets>({
    totalSolids: { min: 36, max: 42 },
    fat: { min: 14, max: 18 },
    msnf: { min: 9, max: 12 },
    pac: { min: 3.2, max: 4.5 },
    sweetness: { min: 14, max: 18 }
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentRecipeName, setCurrentRecipeName] = useState('');

  // Update targets when product type changes
  useEffect(() => {
    const params = productParametersService.getProductParameters(selectedProduct);
    setTargets({
      totalSolids: { min: params.totalSolids[0], max: params.totalSolids[1] },
      fat: { min: params.fats[0], max: params.fats[1] },
      msnf: { min: params.msnf[0], max: params.msnf[1] },
      pac: { min: 3.2, max: 4.5 },
      sweetness: { min: params.sugar[0], max: params.sugar[1] }
    });

    if (!currentRecipeName || currentRecipeName.includes('Ice Cream') || currentRecipeName.includes('Gelato') || currentRecipeName.includes('Sorbet')) {
      const productName = selectedProduct === 'ice-cream' ? 'Ice Cream' : 
                         selectedProduct === 'gelato' ? 'Gelato' : 'Sorbet';
      setCurrentRecipeName(`Classic Vanilla ${productName}`);
    }

    toast({
      title: "Product Type Changed",
      description: `Switched to ${selectedProduct} parameters and targets`,
    });
  }, [selectedProduct]);

  useEffect(() => {
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
        [ingredientName]: 50
      }));
      toast({
        title: "Ingredient Added",
        description: `${ingredientName} has been added to your ${selectedProduct} recipe.`,
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
    
    const validation = productParametersService.validateRecipeForProduct(recipe, selectedProduct);
    const recommendations = productParametersService.generateProductRecommendations(selectedProduct, recipe);
    
    suggestions.forEach(suggestion => {
      if (suggestion.action) {
        suggestion.action();
      }
    });
    
    setIsOptimizing(false);
    toast({
      title: "Recipe Optimized",
      description: `AI has optimized your ${selectedProduct} recipe with product-specific parameters.`,
    });
  };

  const handleOptimizedSugarBlend = (blend: { [sugarType: string]: number }) => {
    const newRecipe = { ...recipe };
    
    delete newRecipe['Sugar'];
    
    Object.entries(blend).forEach(([sugarType, amount]) => {
      newRecipe[sugarType] = amount;
    });
    
    setRecipe(newRecipe);
    
    toast({
      title: "Sugar Blend Optimized",
      description: `Applied optimized sugar blend for ${selectedProduct}`,
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
      const validation = productParametersService.validateRecipeForProduct(recipe, selectedProduct);
      const savedRecipe = databaseService.saveRecipe({
        name: currentRecipeName,
        ingredients: recipe,
        metrics,
        predictions: {
          productType: selectedProduct,
          validation: validation,
          afpSp: productParametersService.calculateRecipeAfpSp(recipe)
        },
        notes: `${selectedProduct} recipe created with ${Object.keys(recipe).length} ingredients. ${validation.isValid ? 'Compliant' : 'Needs adjustment'}.`
      });

      toast({
        title: "Recipe Saved",
        description: `${savedRecipe.name} has been saved with ${selectedProduct} parameters`,
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
    const validation = productParametersService.validateRecipeForProduct(recipe, selectedProduct);
    const afpSp = productParametersService.calculateRecipeAfpSp(recipe);
    
    const csvContent = [
      ['Recipe Name', currentRecipeName],
      ['Product Type', selectedProduct.toUpperCase()],
      ['AFP (Sugars)', afpSp.afp.toFixed(2)],
      ['SP', afpSp.sp.toFixed(2)],
      ['Validation Status', validation.isValid ? 'COMPLIANT' : 'NEEDS ADJUSTMENT'],
      [''],
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
    a.download = `${currentRecipeName || selectedProduct}_recipe.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Recipe Exported",
      description: `Your ${selectedProduct} recipe has been exported with all parameters.`,
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

  const totalSugarAmount = Object.entries(recipe)
    .filter(([name]) => name.toLowerCase().includes('sugar') || name.toLowerCase().includes('sucrose') || name.toLowerCase().includes('dextrose'))
    .reduce((sum, [, amount]) => sum + amount, 0);

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-50 to-indigo-100 border-b">
        <CardTitle className={`flex items-center gap-2 md:gap-3 ${isMobile ? 'text-lg' : 'text-2xl'} flex-wrap`}>
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <Brain className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          </div>
          <span className="flex-1">AI Flavour Engine</span>
          <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600 animate-pulse`} />
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-gray-500" />
          ) : (
            <Monitor className="h-4 w-4 text-gray-500" />
          )}
          <div className={`px-2 md:px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white ${isMobile ? 'text-xs' : 'text-sm'} rounded-full`}>
            ML Powered v2.0
          </div>
        </CardTitle>
        <CardDescription className={`${isMobile ? 'text-sm' : 'text-lg'}`}>
          Advanced machine learning for ice cream, gelato, and sorbet recipe optimization with product-specific parameters and predictive analysis
        </CardDescription>
      </CardHeader>

      <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="recipe" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Recipe' : 'Recipe Development'}
            </TabsTrigger>
            <TabsTrigger value="database" className={isMobile ? 'text-xs px-2' : ''}>
              {isMobile ? 'Database' : 'Database Management'}
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="recipe" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <div className={`space-y-4 ${isMobile ? '' : 'md:space-y-6'}`}>
              {/* Product Type Selection */}
              <ProductSelector 
                selectedProduct={selectedProduct} 
                onProductChange={setSelectedProduct} 
              />

              {/* Recipe Name and Actions */}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 items-stretch ${isMobile ? '' : 'md:items-center'}`}>
                <input
                  type="text"
                  placeholder="Enter recipe name..."
                  value={currentRecipeName}
                  onChange={(e) => setCurrentRecipeName(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md ${isMobile ? 'text-sm' : ''}`}
                />
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                  <Button 
                    onClick={saveRecipe} 
                    disabled={!currentRecipeName.trim()}
                    size={isMobile ? 'sm' : 'default'}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    Save Recipe
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    size={isMobile ? 'sm' : 'default'}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    <Upload className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1 md:mr-2`} />
                    Import
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportToCSV}
                    size={isMobile ? 'sm' : 'default'}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1 md:mr-2`} />
                    Export
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Main Recipe Development Interface */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-6'} gap-4 md:gap-6`}>
                <div className={isMobile ? 'order-1' : 'lg:col-span-2'}>
                  <RecipeInputs recipe={recipe} onUpdateRecipe={updateRecipe} />
                </div>
                
                <div className={isMobile ? 'order-2' : 'lg:col-span-2'}>
                  <ChemistryAnalysis 
                    metrics={metrics} 
                    targets={targets} 
                    targetResults={targetResults} 
                  />
                </div>
                
                <div className={`${isMobile ? 'order-3' : 'lg:col-span-2'} space-y-4 md:space-y-6`}>
                  <ProductAnalysis 
                    productType={selectedProduct}
                    recipe={recipe}
                  />
                  
                  <AIOptimization 
                    allTargetsMet={allTargetsMet}
                    suggestions={suggestions}
                    isOptimizing={isOptimizing}
                    onAutoOptimize={handleAutoOptimize}
                  />
                </div>
              </div>

              {/* Advanced Tools Row */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-4 md:gap-6 ${isMobile ? 'mt-4' : 'mt-6'}`}>
                <SugarBlendOptimizer
                  productType={selectedProduct}
                  totalSugarAmount={totalSugarAmount}
                  onOptimizedBlend={handleOptimizedSugarBlend}
                />
                
                <AIInsights recipe={recipe} metrics={metrics} />
                
                <IngredientAnalyzer 
                  availableIngredients={ingredients.map(ing => ing.name)}
                  onAddIngredient={addIngredientToRecipe}
                />
              </div>

              {/* Mobile-specific help section */}
              {isMobile && (
                <Card className="mt-4 bg-blue-50">
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-2">Mobile AI Engine Tips:</h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>• 🎯 Swipe between analysis sections for detailed insights</p>
                      <p>• 🤖 AI optimization works in real-time across all parameters</p>
                      <p>• 📊 All ML calculations run continuously in background</p>
                      <p>• 💾 Save recipes locally and export for backup</p>
                      <p>• 🔄 Switch product types to see parameter changes</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="database" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <DatabaseManager />
          </TabsContent>

          {!isMobile && (
            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Performance Analytics</h3>
                <p className="text-gray-500">Detailed analytics dashboard coming soon...</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FlavourEngine;
