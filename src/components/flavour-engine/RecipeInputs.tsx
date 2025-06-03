
import React from 'react';
import { Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RecipeInputsProps {
  recipe: { [key: string]: number };
  onUpdateRecipe: (ingredient: string, value: string) => void;
}

const RecipeInputs = ({ recipe, onUpdateRecipe }: RecipeInputsProps) => {
  return (
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
              onChange={(e) => onUpdateRecipe(ingredient, e.target.value)}
              className="bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Amount (g/ml)"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeInputs;
