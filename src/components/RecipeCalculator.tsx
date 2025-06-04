
import React, { useState, useEffect } from 'react';
import { Calculator, Users, Scale, Save, Download, Upload, Plus, Minus, RotateCcw, Smartphone, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { productParametersService, ProductType } from '@/services/productParametersService';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  nutritionalValue?: {
    sugar: number;
    fat: number;
    protein: number;
    msnf: number;
  };
}

interface Recipe {
  name: string;
  description: string;
  originalServings: number;
  ingredients: Ingredient[];
  productType: ProductType;
  notes: string;
}

interface RecipeMetrics {
  totalWeight: number;
  sugarPercentage: number;
  fatPercentage: number;
  totalSolids: number;
  balance: 'excellent' | 'good' | 'needs-adjustment';
  violations: string[];
}

const RecipeCalculator = () => {
  const [productType, setProductType] = useState<ProductType>('ice-cream');
  const [originalServings, setOriginalServings] = useState(4);
  const [desiredServings, setDesiredServings] = useState(8);
  const [recipeName, setRecipeName] = useState('Classic Vanilla Ice Cream');
  const [recipeDescription, setRecipeDescription] = useState('Traditional vanilla ice cream with rich custard base');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { 
      name: 'Heavy Cream', 
      amount: 500, 
      unit: 'ml',
      nutritionalValue: { sugar: 0, fat: 35, protein: 2.8, msnf: 5.5 }
    },
    { 
      name: 'Whole Milk', 
      amount: 250, 
      unit: 'ml',
      nutritionalValue: { sugar: 4.7, fat: 3.5, protein: 3.4, msnf: 8.7 }
    },
    { 
      name: 'Sugar', 
      amount: 120, 
      unit: 'g',
      nutritionalValue: { sugar: 100, fat: 0, protein: 0, msnf: 0 }
    },
    { 
      name: 'Egg Yolks', 
      amount: 100, 
      unit: 'g',
      nutritionalValue: { sugar: 0.6, fat: 31.9, protein: 15.9, msnf: 1.1 }
    },
    { 
      name: 'Vanilla Extract', 
      amount: 5, 
      unit: 'ml',
      nutritionalValue: { sugar: 12.6, fat: 0.1, protein: 0.1, msnf: 0 }
    }
  ]);

  const { toast } = useToast();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update recipe based on product type
  useEffect(() => {
    const params = productParametersService.getProductParameters(productType);
    
    // Adjust recipe name based on product type
    const productName = productType === 'ice-cream' ? 'Ice Cream' : 
                       productType === 'gelato' ? 'Gelato' : 'Sorbet';
    
    if (recipeName.includes('Ice Cream') || recipeName.includes('Gelato') || recipeName.includes('Sorbet')) {
      setRecipeName(`Classic Vanilla ${productName}`);
      setRecipeDescription(`Traditional ${productName.toLowerCase()} with ${productType === 'sorbet' ? 'fruit base' : 'rich custard base'}`);
    }

    // Adjust ingredients for sorbet
    if (productType === 'sorbet') {
      setIngredients([
        { name: 'Water', amount: 400, unit: 'ml', nutritionalValue: { sugar: 0, fat: 0, protein: 0, msnf: 0 } },
        { name: 'Sugar', amount: 150, unit: 'g', nutritionalValue: { sugar: 100, fat: 0, protein: 0, msnf: 0 } },
        { name: 'Fresh Fruit', amount: 300, unit: 'g', nutritionalValue: { sugar: 8, fat: 0.2, protein: 0.8, msnf: 0 } },
        { name: 'Lemon Juice', amount: 15, unit: 'ml', nutritionalValue: { sugar: 2.5, fat: 0.2, protein: 0.4, msnf: 0 } },
        { name: 'Stabilizer', amount: 2, unit: 'g', nutritionalValue: { sugar: 0, fat: 0, protein: 0, msnf: 0 } }
      ]);
    }

    toast({
      title: "Product Type Changed",
      description: `Switched to ${productName} parameters and adjusted recipe accordingly`,
    });
  }, [productType]);

  const scalingFactor = desiredServings / originalServings;

  const calculateMetrics = (): RecipeMetrics => {
    const totalWeight = ingredients.reduce((sum, ing) => sum + (ing.amount * scalingFactor), 0);
    let totalSugar = 0;
    let totalFat = 0;
    let totalSolids = 0;

    ingredients.forEach(ing => {
      const scaledAmount = ing.amount * scalingFactor;
      const density = ing.unit === 'ml' ? 1 : 1; // Simplified density calculation
      const weightInGrams = scaledAmount * density;
      
      if (ing.nutritionalValue) {
        totalSugar += (weightInGrams * ing.nutritionalValue.sugar) / 100;
        totalFat += (weightInGrams * ing.nutritionalValue.fat) / 100;
        totalSolids += (weightInGrams * (ing.nutritionalValue.sugar + ing.nutritionalValue.fat + ing.nutritionalValue.msnf)) / 100;
      }
    });

    const sugarPercentage = (totalSugar / totalWeight) * 100;
    const fatPercentage = (totalFat / totalWeight) * 100;
    const totalSolidsPercentage = (totalSolids / totalWeight) * 100;

    // Validate against product parameters
    const validation = productParametersService.validateRecipeForProduct(
      Object.fromEntries(ingredients.map(ing => [ing.name, ing.amount * scalingFactor])),
      productType
    );

    const balance = validation.isValid ? 'excellent' : 
                   validation.violations.length <= 2 ? 'good' : 'needs-adjustment';

    return {
      totalWeight,
      sugarPercentage,
      fatPercentage,
      totalSolids: totalSolidsPercentage,
      balance,
      violations: validation.violations
    };
  };

  const metrics = calculateMetrics();

  const addIngredient = () => {
    setIngredients([...ingredients, { 
      name: '', 
      amount: 0, 
      unit: 'g',
      nutritionalValue: { sugar: 0, fat: 0, protein: 0, msnf: 0 }
    }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const quickAdjust = (index: number, change: number) => {
    const updated = [...ingredients];
    updated[index].amount = Math.max(0, updated[index].amount + change);
    setIngredients(updated);
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

    const recipe: Recipe = {
      name: recipeName,
      description: recipeDescription,
      originalServings,
      ingredients,
      productType,
      notes: recipeNotes
    };
    
    const recipes = JSON.parse(localStorage.getItem('iceCreamRecipes') || '[]');
    recipes.push({ ...recipe, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem('iceCreamRecipes', JSON.stringify(recipes));
    
    toast({
      title: "Recipe Saved Successfully!",
      description: `${recipeName} has been saved with ${productType} parameters`,
    });
  };

  const exportRecipe = () => {
    const scaledIngredients = ingredients.map(ing => ({
      ...ing,
      amount: ing.amount * scalingFactor
    }));

    const csvContent = [
      ['Recipe Name', recipeName],
      ['Product Type', productType.toUpperCase()],
      ['Description', recipeDescription],
      ['Servings', desiredServings.toString()],
      ['Total Weight (g)', metrics.totalWeight.toFixed(1)],
      ['Sugar %', metrics.sugarPercentage.toFixed(1)],
      ['Fat %', metrics.fatPercentage.toFixed(1)],
      ['Total Solids %', metrics.totalSolids.toFixed(1)],
      ['Balance Status', metrics.balance],
      [''],
      ['Ingredient', 'Amount', 'Unit', 'Sugar %', 'Fat %', 'Protein %', 'MSNF %'],
      ...scaledIngredients.map(ing => [
        ing.name, 
        ing.amount.toFixed(1), 
        ing.unit,
        ing.nutritionalValue?.sugar || 0,
        ing.nutritionalValue?.fat || 0,
        ing.nutritionalValue?.protein || 0,
        ing.nutritionalValue?.msnf || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipeName.replace(/\s+/g, '_')}_${desiredServings}_servings.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Recipe Exported",
      description: `Your ${productType} recipe has been exported with detailed nutritional data`,
    });
  };

  const resetRecipe = () => {
    const defaultIngredients = productType === 'sorbet' ? [
      { name: 'Water', amount: 400, unit: 'ml', nutritionalValue: { sugar: 0, fat: 0, protein: 0, msnf: 0 } },
      { name: 'Sugar', amount: 150, unit: 'g', nutritionalValue: { sugar: 100, fat: 0, protein: 0, msnf: 0 } },
      { name: 'Fresh Fruit', amount: 300, unit: 'g', nutritionalValue: { sugar: 8, fat: 0.2, protein: 0.8, msnf: 0 } }
    ] : [
      { name: 'Heavy Cream', amount: 500, unit: 'ml', nutritionalValue: { sugar: 0, fat: 35, protein: 2.8, msnf: 5.5 } },
      { name: 'Whole Milk', amount: 250, unit: 'ml', nutritionalValue: { sugar: 4.7, fat: 3.5, protein: 3.4, msnf: 8.7 } },
      { name: 'Sugar', amount: 120, unit: 'g', nutritionalValue: { sugar: 100, fat: 0, protein: 0, msnf: 0 } },
      { name: 'Egg Yolks', amount: 100, unit: 'g', nutritionalValue: { sugar: 0.6, fat: 31.9, protein: 15.9, msnf: 1.1 } }
    ];

    setIngredients(defaultIngredients);
    setRecipeName(`Classic Vanilla ${productType === 'ice-cream' ? 'Ice Cream' : productType === 'gelato' ? 'Gelato' : 'Sorbet'}`);
    setRecipeDescription(`Traditional ${productType} with ${productType === 'sorbet' ? 'fruit base' : 'rich custard base'}`);
    setOriginalServings(4);
    setDesiredServings(8);
    setRecipeNotes('');
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-pink-600" />
            <div>
              <CardTitle className="text-xl md:text-2xl">Recipe Scaling Calculator</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Scale and optimize your {productType} recipes with real-time parameter evaluation
              </CardDescription>
            </div>
          </div>
          {isMobileView && (
            <Smartphone className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Product Type Selection */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Label className="text-sm font-semibold text-purple-800">Product Type:</Label>
                <div className="flex flex-wrap gap-2">
                  {(['ice-cream', 'gelato', 'sorbet'] as ProductType[]).map((type) => (
                    <Button
                      key={type}
                      variant={productType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductType(type)}
                      className={`text-xs md:text-sm ${
                        productType === type 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'hover:bg-purple-100'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipe-name" className="text-sm font-medium">Recipe Name</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="mt-1"
                placeholder="Enter recipe name..."
              />
            </div>
            <div>
              <Label htmlFor="recipe-description" className="text-sm font-medium">Description</Label>
              <Input
                id="recipe-description"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                className="mt-1"
                placeholder="Brief description..."
              />
            </div>
          </div>

          {/* Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="original-servings" className="text-sm font-medium">Original Servings</Label>
              <Input
                id="original-servings"
                type="number"
                value={originalServings}
                onChange={(e) => setOriginalServings(Number(e.target.value))}
                className="mt-1"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="desired-servings" className="text-sm font-medium">Desired Servings</Label>
              <Input
                id="desired-servings"
                type="number"
                value={desiredServings}
                onChange={(e) => setDesiredServings(Number(e.target.value))}
                className="mt-1"
                min="1"
              />
            </div>
          </div>

          {/* Scaling Factor & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Scaling Factor: {scalingFactor.toFixed(2)}x
                </span>
              </div>
            </Card>
            
            <Card className="p-3 bg-green-50">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Total Weight: {metrics.totalWeight.toFixed(0)}g
                </span>
              </div>
            </Card>
            
            <Card className={`p-3 ${
              metrics.balance === 'excellent' ? 'bg-green-50' : 
              metrics.balance === 'good' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {metrics.balance === 'excellent' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.balance === 'excellent' ? 'text-green-900' : 
                  metrics.balance === 'good' ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  Balance: {metrics.balance}
                </span>
              </div>
            </Card>
          </div>

          {/* Nutritional Breakdown */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold text-sm mb-3">Nutritional Analysis</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sugar:</span>
                <Badge variant="outline" className="ml-2">
                  {metrics.sugarPercentage.toFixed(1)}%
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Fat:</span>
                <Badge variant="outline" className="ml-2">
                  {metrics.fatPercentage.toFixed(1)}%
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Solids:</span>
                <Badge variant="outline" className="ml-2">
                  {metrics.totalSolids.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Ingredients</Label>
              <Button onClick={addIngredient} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {ingredients.map((ingredient, index) => (
              <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="col-span-6 md:col-span-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickAdjust(index, -10)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Amount"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', Number(e.target.value))}
                        className="text-sm text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickAdjust(index, 10)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="col-span-6 md:col-span-2">
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) => updateIngredient(index, 'unit', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="tsp">tsp</SelectItem>
                        <SelectItem value="tbsp">tbsp</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-8 md:col-span-3 text-sm font-medium text-pink-600 px-2">
                    {(ingredient.amount * scalingFactor).toFixed(1)} {ingredient.unit}
                  </div>
                  
                  <div className="col-span-4 md:col-span-1 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      disabled={ingredients.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recipe Notes */}
          <div>
            <Label htmlFor="recipe-notes" className="text-sm font-medium">Recipe Notes</Label>
            <Textarea
              id="recipe-notes"
              value={recipeNotes}
              onChange={(e) => setRecipeNotes(e.target.value)}
              placeholder="Add preparation notes, tips, or variations..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Violations/Warnings */}
          {metrics.violations.length > 0 && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h4 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Recipe Adjustments Needed
              </h4>
              <ul className="space-y-1">
                {metrics.violations.map((violation, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {violation}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={saveRecipe} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
            
            <Button onClick={exportRecipe} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button onClick={resetRecipe} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button variant="outline" className="w-full" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>

          {/* Summary Stats */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-purple-800">{ingredients.length}</div>
                <div className="text-purple-600">Ingredients</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-800">{originalServings} → {desiredServings}</div>
                <div className="text-purple-600">Servings</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-800">{scalingFactor.toFixed(2)}x</div>
                <div className="text-purple-600">Scale Factor</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-800">{productType}</div>
                <div className="text-purple-600">Product Type</div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCalculator;
