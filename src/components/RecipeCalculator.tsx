
import React, { useState } from 'react';
import { Calculator, Users, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

const RecipeCalculator = () => {
  const [originalServings, setOriginalServings] = useState(4);
  const [desiredServings, setDesiredServings] = useState(8);
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
        <div className="grid grid-cols-2 gap-4 mb-6">
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

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
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
              <div className="col-span-5">
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
              <div className="col-span-2 text-sm font-medium text-pink-600">
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
          className="mt-4 w-full border-dashed"
        >
          + Add Ingredient
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCalculator;
