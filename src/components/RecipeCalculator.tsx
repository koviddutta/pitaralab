import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, Save, Download, Upload, Smartphone, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { mlService } from '@/services/mlService';
import { databaseService } from '@/services/databaseService';
import { productParametersService } from '@/services/productParametersService';

const RecipeCalculator = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [recipe, setRecipe] = useState<{[key: string]: number}>({
    'Heavy Cream': 500,
    'Whole Milk': 250,
    'Sugar': 120,
    'Egg Yolks': 100,
    'Vanilla Extract': 5,
    'Stabilizer': 2
  });
  
  const [recipeName, setRecipeName] = useState('');
  const [productType, setProductType] = useState<'ice-cream' | 'gelato' | 'sorbet'>('ice-cream');
  const [metrics, setMetrics] = useState<any>({});
  const [validation, setValidation] = useState<any>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  
  const { toast } = useToast();

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Real-time calculation and validation
  useEffect(() => {
    const calculateMetrics = async () => {
      setIsCalculating(true);
      try {
        const calculatedMetrics = mlService.calculateRecipeMetrics(recipe);
        const recipeValidation = productParametersService.validateRecipeForProduct(recipe, productType);
        const pacSp = productParametersService.calculateRecipeAfpSp(recipe);
        
        setMetrics({
          ...calculatedMetrics,
          ...pacSp
        });
        setValidation(recipeValidation);
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    if (Object.keys(recipe).length > 0) {
      calculateMetrics();
    }
  }, [recipe, productType]);

  const updateRecipe = (ingredient: string, value: string) => {
    const numValue = Number(value) || 0;
    setRecipe(prev => ({
      ...prev,
      [ingredient]: numValue
    }));
  };

  const adjustAmount = (ingredient: string, delta: number) => {
    const currentAmount = recipe[ingredient] || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    updateRecipe(ingredient, newAmount.toString());
  };

  const addIngredient = () => {
    if (!newIngredient.trim() || !newAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter ingredient name and amount",
        variant: "destructive"
      });
      return;
    }

    setRecipe(prev => ({
      ...prev,
      [newIngredient.trim()]: Number(newAmount)
    }));
    
    setNewIngredient('');
    setNewAmount('');
    
    toast({
      title: "Ingredient Added",
      description: `${newIngredient} added to recipe`
    });
  };

  const removeIngredient = (ingredient: string) => {
    setRecipe(prev => {
      const newRecipe = { ...prev };
      delete newRecipe[ingredient];
      return newRecipe;
    });
  };

  const saveRecipe = () => {
    if (!recipeName.trim()) {
      toast({
        title: "Recipe Name Required",
        description: "Please enter a name for your recipe",
        variant: "destructive"
      });
      return;
    }

    try {
      databaseService.saveRecipe({
        name: recipeName,
        ingredients: recipe,
        metrics,
        predictions: {
          productType,
          validation,
          pacSp: { pac: metrics.pac, sp: metrics.sp }
        },
        notes: `${productType} recipe with ${Object.keys(recipe).length} ingredients`
      });

      toast({
        title: "Recipe Saved",
        description: `${recipeName} has been saved successfully`
      });
      
      setRecipeName('');
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    }
  };

  const exportRecipe = () => {
    const csvContent = [
      ['Ingredient', 'Amount (g/ml)', 'Percentage'],
      ...Object.entries(recipe).map(([name, amount]) => [
        name,
        amount,
        ((amount / metrics.totalWeight) * 100).toFixed(2) + '%'
      ]),
      [''],
      ['Metrics', 'Value', 'Target Range'],
      ['Total Weight', `${metrics.totalWeight}g`, '500-2000g'],
      ['Sugar %', `${metrics.sugarPercentage?.toFixed(2)}%`, '14-22%'],
      ['Fat %', `${metrics.fatPercentage?.toFixed(2)}%`, '10-20%'],
      ['Total Solids %', `${metrics.totalSolids?.toFixed(2)}%`, '32-42%'],
      ['PAC (Anti-freezing Power)', metrics.pac?.toFixed(2), '22-28'],
      ['SP', metrics.sp?.toFixed(2), '12-22']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipeName || 'recipe'}_${productType}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Recipe Exported",
      description: "Recipe data exported successfully"
    });
  };

  const getParameterStatus = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return 'optimal';
    if (value < min * 0.9 || value > max * 1.1) return 'critical';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const productParams = productParametersService.getProductParameters(productType);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="h-5 w-5 md:h-6 md:w-6" />
            Advanced Recipe Calculator
            {isMobile ? <Smartphone className="h-4 w-4 text-gray-500" /> : <Monitor className="h-4 w-4 text-gray-500" />}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Product Type Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Product Type</label>
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} gap-2`}>
                {(['ice-cream', 'gelato', 'sorbet'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={productType === type ? 'default' : 'outline'}
                    onClick={() => setProductType(type)}
                    className={isMobile ? 'text-xs px-2 py-1' : ''}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Recipe Name</label>
              <Input
                placeholder="Enter recipe name..."
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className={isMobile ? 'text-sm' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-4 md:gap-6`}>
        {/* Recipe Inputs */}
        <Card className={isMobile ? 'order-1' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Recipe Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Existing Ingredients */}
            {Object.entries(recipe).map(([ingredient, amount]) => (
              <div key={ingredient} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium truncate flex-1 mr-2">
                    {ingredient}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ingredient)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {isMobile && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustAmount(ingredient, -10)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustAmount(ingredient, -1)}
                        className="h-8 w-8 p-0"
                      >
                        -1
                      </Button>
                    </>
                  )}
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => updateRecipe(ingredient, e.target.value)}
                    className={`flex-1 ${isMobile ? 'text-sm' : ''}`}
                    min="0"
                    step="0.1"
                  />
                  {isMobile && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustAmount(ingredient, 1)}
                        className="h-8 w-8 p-0"
                      >
                        +1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustAmount(ingredient, 10)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <span className="text-xs text-gray-500 w-6">g</span>
                </div>
                {amount > 0 && metrics.totalWeight > 0 && (
                  <div className="text-xs text-gray-500">
                    {((amount / metrics.totalWeight) * 100).toFixed(1)}% of total
                  </div>
                )}
              </div>
            ))}

            {/* Add New Ingredient */}
            <div className="border-t pt-3 space-y-2">
              <div className="text-sm font-medium">Add Ingredient</div>
              <Input
                placeholder="Ingredient name"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className={isMobile ? 'text-sm' : ''}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className={`flex-1 ${isMobile ? 'text-sm' : ''}`}
                />
                <Button onClick={addIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card className={isMobile ? 'order-2' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              Recipe Analysis
              {isCalculating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Total Weight</div>
                <div className="font-medium">{metrics.totalWeight?.toFixed(0) || 0}g</div>
              </div>
              <div>
                <div className="text-gray-600">Ingredients</div>
                <div className="font-medium">{Object.keys(recipe).length}</div>
              </div>
            </div>

            {/* Parameter Status */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Parameter Status</div>
              
              {/* Sugar Content */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sugar Content</span>
                  <Badge className={getStatusColor(getParameterStatus(
                    metrics.sugarPercentage || 0,
                    productParams.sugar[0],
                    productParams.sugar[1]
                  ))}>
                    {metrics.sugarPercentage?.toFixed(1) || 0}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (metrics.sugarPercentage || 0) / 30 * 100)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Target: {productParams.sugar[0]}-{productParams.sugar[1]}%
                </div>
              </div>

              {/* Fat Content */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fat Content</span>
                  <Badge className={getStatusColor(getParameterStatus(
                    metrics.fatPercentage || 0,
                    productParams.fats[0],
                    productParams.fats[1]
                  ))}>
                    {metrics.fatPercentage?.toFixed(1) || 0}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (metrics.fatPercentage || 0) / 25 * 100)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Target: {productParams.fats[0]}-{productParams.fats[1]}%
                </div>
              </div>

              {/* Total Solids */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Solids</span>
                  <Badge className={getStatusColor(getParameterStatus(
                    metrics.totalSolids || 0,
                    productParams.totalSolids[0],
                    productParams.totalSolids[1]
                  ))}>
                    {metrics.totalSolids?.toFixed(1) || 0}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (metrics.totalSolids || 0) / 50 * 100)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Target: {productParams.totalSolids[0]}-{productParams.totalSolids[1]}%
                </div>
              </div>

              {/* PAC & SP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm">PAC (aka AFP)</div>
                  <div className="font-medium text-lg">{metrics.pac?.toFixed(1) || 0}</div>
                </div>
                <div>
                  <div className="text-sm">SP</div>
                  <div className="font-medium text-lg">{metrics.sp?.toFixed(1) || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation & Actions */}
        <Card className={isMobile ? 'order-3' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Validation & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.isValid ? 'Recipe Valid' : 'Needs Adjustment'}
              </span>
            </div>

            {/* Violations */}
            {validation.violations && validation.violations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-600">Issues Found:</div>
                {validation.violations.map((violation: string, index: number) => (
                  <div key={index} className="text-xs bg-red-50 text-red-700 p-2 rounded">
                    {violation}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {validation.recommendations && validation.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-blue-600">Recommendations:</div>
                {validation.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-xs bg-blue-50 text-blue-700 p-2 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={saveRecipe} 
                className="w-full" 
                disabled={!recipeName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Recipe
              </Button>
              
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                <Button variant="outline" onClick={exportRecipe} size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
              </div>
            </div>

            {/* Score */}
            {validation.score !== undefined && (
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{validation.score}/100</div>
                <div className="text-sm text-gray-600">Recipe Score</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecipeCalculator;
