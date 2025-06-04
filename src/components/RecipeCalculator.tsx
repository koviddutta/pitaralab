import React, { useState } from 'react';
import { Calculator, Users, Scale, Save, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  name: string;
  description: string;
  originalServings: number;
  ingredients: Ingredient[];
}

const RecipeCalculator = () => {
  const [originalServings, setOriginalServings] = useState(4);
  const [desiredServings, setDesiredServings] = useState(8);
  const [recipeName, setRecipeName] = useState('Classic Vanilla Ice Cream');
  const [recipeDescription, setRecipeDescription] = useState('Traditional vanilla ice cream with rich custard base');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: 'Heavy Cream', amount: 500, unit: 'ml' },
    { name: 'Milk', amount: 250, unit: 'ml' },
    { name: 'Sugar', amount: 100, unit: 'g' },
    { name: 'Egg Yolks', amount: 4, unit: 'pieces' },
    { name: 'Vanilla Extract', amount: 1, unit: 'tsp' }
  ]);

  const scalingFactor = desiredServings / originalServings;

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 0, unit: 'g' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const saveRecipe = () => {
    const recipe: Recipe = {
      name: recipeName,
      description: recipeDescription,
      originalServings,
      ingredients
    };
    
    const recipes = JSON.parse(localStorage.getItem('iceCreamRecipes') || '[]');
    recipes.push({ ...recipe, id: Date.now() });
    localStorage.setItem('iceCreamRecipes', JSON.stringify(recipes));
    
    alert('Recipe saved successfully!');
  };

  const exportRecipe = () => {
    const scaledIngredients = ingredients.map(ing => ({
      ...ing,
      amount: ing.amount * scalingFactor
    }));

    const csvContent = [
      ['Recipe Name', recipeName],
      ['Description', recipeDescription],
      ['Servings', desiredServings.toString()],
      [''],
      ['Ingredient', 'Amount', 'Unit'],
      ...scaledIngredients.map(ing => [ing.name, ing.amount.toString(), ing.unit])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipeName.replace(/\s+/g, '_')}_${desiredServings}_servings.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetRecipe = () => {
    setIngredients([
      { name: 'Heavy Cream', amount: 500, unit: 'ml' },
      { name: 'Milk', amount: 250, unit: 'ml' },
      { name: 'Sugar', amount: 100, unit: 'g' },
      { name: 'Egg Yolks', amount: 4, unit: 'pieces' },
      { name: 'Vanilla Extract', amount: 1, unit: 'tsp' }
    ]);
    setRecipeName('Classic Vanilla Ice Cream');
    setRecipeDescription('Traditional vanilla ice cream with rich custard base');
    setOriginalServings(4);
    setDesiredServings(8);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-pink-600" />
          Recipe Scaling Calculator
        </CardTitle>
        <CardDescription>
          Scale your ice cream recipes up or down for different batch sizes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipe-name" className="text-sm font-medium">Recipe Name</Label>
                <Input
                  id="recipe-name"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="recipe-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="recipe-description"
                  value={recipeDescription}
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original-servings" className="text-sm font-medium">
                  Original Servings
                </Label>
                <Input
                  id="original-servings"
                  type="number"
                  value={originalServings}
                  onChange={(e) => setOriginalServings(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="desired-servings" className="text-sm font-medium">
                  Desired Servings
                </Label>
                <Input
                  id="desired-servings"
                  type="number"
                  value={desiredServings}
                  onChange={(e) => setDesiredServings(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Scaling Factor: {scalingFactor.toFixed(2)}x
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Ingredients</Label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 text-sm font-medium text-pink-600 px-2">
                    {(ingredient.amount * scalingFactor).toFixed(1)} {ingredient.unit}
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={addIngredient}
              variant="outline"
              className="w-full border-dashed"
            >
              + Add Ingredient
            </Button>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipe Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={saveRecipe} className="w-full" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Recipe
                </Button>
                
                <Button onClick={exportRecipe} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Scaled Recipe
                </Button>
                
                <Button onClick={resetRecipe} className="w-full" variant="outline">
                  Reset to Default
                </Button>

                <Separator />

                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Total Ingredients:</strong> {ingredients.length}</div>
                  <div><strong>Scaling:</strong> {originalServings} → {desiredServings} servings</div>
                  <div><strong>Factor:</strong> {scalingFactor.toFixed(2)}x</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCalculator;
