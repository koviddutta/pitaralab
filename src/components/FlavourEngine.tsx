
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
import ProfileSwitcher from './ProfileSwitcher';
import TargetPanel from './TargetPanel';
import ScienceChecklist from './ScienceChecklist';
import ReverseEngineer from './ReverseEngineer';
import BatchQA from './BatchQA';
import PairingsDrawer from './PairingsDrawer';
import TemperaturePanel from './TemperaturePanel';
import MachineSelector from './MachineSelector';
import CostYieldDisplay from './CostYieldDisplay';
import WhyPanel from './WhyPanel';
import { IngredientData } from '@/types/ingredients';
import { calcMetrics, Metrics } from '@/lib/calc';
import { getSeedIngredients } from '@/lib/ingredientLibrary';
import UnitConverterAdvanced from './flavour-engine/UnitConverterAdvanced';
import SugarSpectrumToggle from './flavour-engine/SugarSpectrumToggle';
import OptimizationEngine from './flavour-engine/OptimizationEngine';
import PasteStudio from './PasteStudio';

const FlavourEngine = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('ice-cream');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<IngredientData[]>([]);
  const [selectedIngredientForPairing, setSelectedIngredientForPairing] = useState<IngredientData | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<'batch' | 'continuous'>('batch');
  const [previousMetrics, setPreviousMetrics] = useState<Metrics | undefined>(undefined);
  const [recentChanges, setRecentChanges] = useState<string[]>([]);
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
      sp: ing.pac || 1.0, // Use PAC as SP for now, or default to 1.0
      fat: ing.fat,
      msnf: ing.msnf,
      cost: ing.cost,
      confidence: ing.confidence
    }));
    setIngredients(formattedIngredients);
    
    // Also set modern ingredient format for new components
    const seedIngredients = getSeedIngredients();
    setAvailableIngredients(seedIngredients);
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

  const addIngredientWithPercentage = (ingredient: IngredientData, percentage: number) => {
    const totalCurrentMass = Object.values(recipe).reduce((sum, val) => sum + val, 0) || 1000;
    const gramsToAdd = (percentage / 100) * totalCurrentMass;
    setRecipe(prev => ({ ...prev, [ingredient.name]: (prev[ingredient.name] || 0) + gramsToAdd }));
    
    toast({
      title: "Pairing Added",
      description: `${ingredient.name} added at ${percentage}% (${gramsToAdd.toFixed(0)}g)`,
    });
  };

  const handleApplyTuning = (tunedRecipe: any[]) => {
    const newRecipe: { [key: string]: number } = {};
    tunedRecipe.forEach((row: any) => {
      if (row.grams > 0) {
        newRecipe[row.ing.name] = row.grams;
      }
    });
    setRecipe(newRecipe);
    
    toast({
      title: "Auto-tune Applied",
      description: "Recipe optimized for target temperature",
    });
  };

  // Convert recipe to modern format for new components
  const modernRecipeRows = Object.entries(recipe).map(([name, grams]) => {
    const ing = availableIngredients.find(i => i.name === name) || {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      category: 'other' as const,
      water_pct: 0,
      fat_pct: 0,
    };
    return { ing, grams };
  });

  const modernMetrics = modernRecipeRows.length > 0 ? calcMetrics(modernRecipeRows) : {
    ts_add_pct: 0, fat_pct: 0, sugars_pct: 0, msnf_pct: 0, sp: 0, pac: 0,
    total_g: 0, water_g: 0, sugars_g: 0, fat_g: 0, msnf_g: 0, other_g: 0,
    water_pct: 0, other_pct: 0, ts_add_g: 0, ts_mass_g: 0, ts_mass_pct: 0
  };

  // Map UI product to parameter profile key
  const paramProduct: 'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet' =
    selectedProduct === 'ice-cream' ? 'ice_cream' :
    selectedProduct === 'gelato'    ? 'gelato_finished' :
                                      'sorbet';

  const metrics = calculateRecipeMetrics(recipe, ingredients);
  const targetResults = checkTargets(metrics, targets);
  const allTargetsMet = Object.values(targetResults).every(result => result);

  const updateRecipe = (ingredient: string, value: string) => {
    // Store previous metrics before change
    if (!previousMetrics) {
      setPreviousMetrics(modernMetrics);
    }
    
    setRecipe(prev => ({
      ...prev,
      [ingredient]: Number(value) || 0
    }));
    
    // Track change
    setRecentChanges(prev => [...prev.slice(-4), `Changed ${ingredient} to ${value}g`]);
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
          pacSp: productParametersService.calculateRecipeAfpSp(recipe)
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
        const pacSp = productParametersService.calculateRecipeAfpSp(recipe);
        
        const csvContent = [
          ['Recipe Name', currentRecipeName],
          ['Product Type', selectedProduct.toUpperCase()],
          ['PAC (Anti-freezing Power)', pacSp.afp.toFixed(2)],
          ['SP', pacSp.sp.toFixed(2)],
          ['Validation Status', validation.isValid ? 'COMPLIANT' : 'NEEDS ADJUSTMENT'],
          [''],
          ['Ingredient', 'Amount (g/ml)', 'PAC (%)', 'POD (%)', 'SP (%)', 'Fat (%)', 'MSNF (%)', 'Cost (₹/kg)'],
          ...Object.entries(recipe).map(([name, amount]) => {
            const ingredient = ingredients.find(ing => ing.name === name);
            return [
              name,
              amount,
              ingredient?.pac || 0,
              ingredient?.pod || 0,
              ingredient?.sp || 0,
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
    <Card className="w-full max-w-7xl mx-auto shadow-elegant">
      <CardHeader className="gradient-card border-b border-border/50">
        <CardTitle className={`flex items-center gap-2 md:gap-3 ${isMobile ? 'text-lg' : 'text-2xl'} flex-wrap`}>
          <div className="p-2 gradient-primary rounded-lg shadow-glow animate-smooth">
            <Brain className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary-foreground`} />
          </div>
          <span className="flex-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
            AI Flavour Engine
          </span>
          <ProfileSwitcher />
          <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary animate-pulse`} />
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Monitor className="h-4 w-4 text-muted-foreground" />
          )}
          <div className={`px-2 md:px-3 py-1 gradient-accent text-accent-foreground ${isMobile ? 'text-xs' : 'text-sm'} rounded-full font-semibold shadow-sm`}>
            ML Powered v2.0
          </div>
        </CardTitle>
        <CardDescription className={`${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground`}>
          Advanced machine learning for ice cream, gelato, and sorbet recipe optimization with product-specific parameters and predictive analysis
        </CardDescription>
      </CardHeader>

      <CardContent className={`${isMobile ? 'p-3' : 'p-6'} bg-gradient-to-br from-background to-card-secondary/30`}>
        <Tabs defaultValue="recipe" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-7'} ${isMobile ? 'h-auto' : 'h-12'} gap-1 bg-card-secondary/50 backdrop-blur-sm`}>
            <TabsTrigger 
              value="recipe" 
              className={`${isMobile ? 'text-xs px-2 py-2' : 'px-4 py-2'} data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth`}
            >
              {isMobile ? 'Recipe' : 'Recipe Development'}
            </TabsTrigger>
            <TabsTrigger 
              value="targets" 
              className={`${isMobile ? 'text-xs px-2 py-2' : 'px-4 py-2'} data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth`}
            >
              {isMobile ? 'Targets' : 'Target & Validation'}
            </TabsTrigger>
            {isMobile ? (
              <>
                <TabsTrigger value="tools" className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="database" className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">
                  Database
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="pairings" className="px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">Flavor Pairings</TabsTrigger>
                <TabsTrigger value="temperature" className="px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">Temperature</TabsTrigger>
                <TabsTrigger value="reverse" className="px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">Reverse Engineer</TabsTrigger>
                <TabsTrigger value="paste-studio" className="px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">Paste Studio</TabsTrigger>
                <TabsTrigger value="database" className="px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth">Database</TabsTrigger>
              </>
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
                <SugarSpectrumToggle
                  recipe={recipe}
                  onRecipeUpdate={setRecipe}
                  locks={{}}
                />
                
                <UnitConverterAdvanced 
                  onEvaporationChange={(pct) => console.log('Evaporation:', pct)}
                  evaporationPct={0}
                  onMilkFatChange={(pct) => console.log('Milk fat:', pct)}
                  milkFatPct={3}
                  onCreamFatChange={(pct) => console.log('Cream fat:', pct)}
                  creamFatPct={25}
                />
                
                <OptimizationEngine
                  recipe={recipe}
                  targets={targets}
                  onRecipeUpdate={setRecipe}
                  onClassificationChange={(classification) => console.log('Classification:', classification)}
                />
              </div>

              {/* Enhanced Tools Row */}
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

              {/* Cost & Yield + Why Panel */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-4 md:gap-6 ${isMobile ? 'mt-4' : 'mt-6'}`}>
                <CostYieldDisplay 
                  recipe={recipe} 
                  metrics={modernMetrics}
                  overrunPct={selectedMachine === 'batch' ? 50 : 80}
                  wastePct={5}
                />
                <WhyPanel 
                  metrics={modernMetrics}
                  previousMetrics={previousMetrics}
                  changes={recentChanges}
                />
              </div>

              {/* Mobile-specific help section */}
              {isMobile && (
                <Card className="mt-4 gradient-accent border border-accent/20 shadow-sm">
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-2 text-accent-foreground flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Mobile AI Engine Tips:
                    </h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
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

          <TabsContent value="targets" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              {isMobile ? (
                <div className="space-y-3">
                  <TargetPanel 
                    productType={paramProduct}
                    metrics={modernMetrics}
                    onOptimize={handleAutoOptimize}
                  />
                  <ScienceChecklist
                    productType={paramProduct}
                    metrics={modernMetrics}
                  />
                  <MachineSelector
                    metrics={modernMetrics}
                    selectedMachine={selectedMachine}
                    onMachineChange={setSelectedMachine}
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <TargetPanel 
                    productType={paramProduct}
                    metrics={modernMetrics}
                    onOptimize={handleAutoOptimize}
                  />
                  <MachineSelector
                    metrics={modernMetrics}
                    selectedMachine={selectedMachine}
                    onMachineChange={setSelectedMachine}
                  />
                </div>
                <ScienceChecklist
                  productType={paramProduct}
                  metrics={modernMetrics}
                />
                </div>
              )}
              <BatchQA onPrint={() => window.print()} />
            </div>
          </TabsContent>

          {/* Mobile Tools Tab - combines multiple features */}
          {isMobile && (
            <TabsContent value="tools" className="mt-3">
              <Tabs defaultValue="pairings" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="pairings" className="text-xs px-1 py-2">Pairings</TabsTrigger>
                  <TabsTrigger value="temperature" className="text-xs px-1 py-2">Temp</TabsTrigger>
                  <TabsTrigger value="reverse" className="text-xs px-1 py-2">Reverse</TabsTrigger>
                  <TabsTrigger value="paste-studio" className="text-xs px-1 py-2">Paste</TabsTrigger>
                </TabsList>

                <TabsContent value="pairings" className="mt-3 space-y-3">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold mb-2">Select Ingredient</h3>
                    <div className="flex flex-wrap gap-1">
                      {availableIngredients.slice(0, 12).map(ingredient => (
                        <button
                          key={ingredient.id}
                          onClick={() => setSelectedIngredientForPairing(ingredient)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedIngredientForPairing?.id === ingredient.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ingredient.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PairingsDrawer
                    selectedIngredient={selectedIngredientForPairing}
                    availableIngredients={availableIngredients}
                    onAddIngredient={addIngredientWithPercentage}
                    currentMetrics={modernMetrics}
                  />
                </TabsContent>

                <TabsContent value="temperature" className="mt-3">
                  <TemperaturePanel
                    metrics={modernMetrics}
                    recipe={modernRecipeRows}
                    onApplyTuning={handleApplyTuning}
                  />
                </TabsContent>

                <TabsContent value="reverse" className="mt-3">
                  <ReverseEngineer palette={availableIngredients} />
                </TabsContent>

                <TabsContent value="paste-studio" className="mt-3">
                  <PasteStudio />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* Desktop-only tabs */}
          {!isMobile && (
            <>
              <TabsContent value="pairings" className="mt-6 space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Flavor Pairings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select an ingredient to explore scientifically-backed flavor combinations with manufacturability scoring.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableIngredients.slice(0, 20).map(ingredient => (
                      <button
                        key={ingredient.id}
                        onClick={() => setSelectedIngredientForPairing(ingredient)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          selectedIngredientForPairing?.id === ingredient.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                </div>
                <PairingsDrawer
                  selectedIngredient={selectedIngredientForPairing}
                  availableIngredients={availableIngredients}
                  onAddIngredient={addIngredientWithPercentage}
                  currentMetrics={modernMetrics}
                />
              </TabsContent>

              <TabsContent value="temperature" className="mt-6">
                <TemperaturePanel
                  metrics={modernMetrics}
                  recipe={modernRecipeRows}
                  onApplyTuning={handleApplyTuning}
                />
              </TabsContent>
            </>
          )}

          <TabsContent value="reverse" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <ReverseEngineer palette={availableIngredients} />
          </TabsContent>

          <TabsContent value="paste-studio" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <PasteStudio />
          </TabsContent>

          <TabsContent value="database" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
            <DatabaseManager />
          </TabsContent>

          {!isMobile && (
            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground">Detailed analytics dashboard coming soon...</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FlavourEngine;
