
import React, { useState } from 'react';
import { Plus, Camera, Mic, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface MobileRecipeInputProps {
  onRecipeCreated: (recipe: { name: string; ingredients: Ingredient[] }) => void;
}

const MobileRecipeInput = ({ onRecipeCreated }: MobileRecipeInputProps) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'photo' | 'voice' | 'search'>('manual');
  const [recipeName, setRecipeName] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentUnit, setCurrentUnit] = useState('g');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const { toast } = useToast();

  const commonIngredients = [
    'Heavy Cream', 'Whole Milk', 'Sugar', 'Egg Yolks', 'Vanilla Extract',
    'Honey', 'Coconut Milk', 'Dark Chocolate', 'Strawberries', 'Lemon Juice'
  ];

  const units = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'pieces'];

  const addIngredient = () => {
    if (!currentIngredient.trim() || !currentAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter both ingredient name and amount",
        variant: "destructive"
      });
      return;
    }

    const newIngredient: Ingredient = {
      name: currentIngredient.trim(),
      amount: Number(currentAmount),
      unit: currentUnit
    };

    setIngredients([...ingredients, newIngredient]);
    setCurrentIngredient('');
    setCurrentAmount('');
    
    toast({
      title: "Ingredient Added",
      description: `${newIngredient.name} added to recipe`,
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleQuickAdd = (ingredientName: string) => {
    setCurrentIngredient(ingredientName);
  };

  const createRecipe = () => {
    if (!recipeName.trim() || ingredients.length === 0) {
      toast({
        title: "Recipe Incomplete",
        description: "Please add a recipe name and at least one ingredient",
        variant: "destructive"
      });
      return;
    }

    onRecipeCreated({
      name: recipeName,
      ingredients
    });

    // Reset form
    setRecipeName('');
    setIngredients([]);
    
    toast({
      title: "Recipe Created!",
      description: `${recipeName} has been created with ${ingredients.length} ingredients`,
    });
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentIngredient(transcript);
        toast({
          title: "Voice Input Captured",
          description: `Added: ${transcript}`,
        });
      };

      recognition.onerror = () => {
        toast({
          title: "Voice Input Error",
          description: "Please try again or use manual input",
          variant: "destructive"
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Input Not Supported",
        description: "Please use manual input instead",
        variant: "destructive"
      });
    }
  };

  const handlePhotoInput = () => {
    // Simulate photo recognition
    toast({
      title: "Photo Recognition",
      description: "Photo ingredient recognition coming soon!",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Recipe Input
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Method Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={inputMethod === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMethod('manual')}
            className="flex-1"
          >
            Manual
          </Button>
          <Button
            variant={inputMethod === 'voice' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMethod('voice')}
            className="flex-1"
          >
            <Mic className="h-4 w-4 mr-1" />
            Voice
          </Button>
          <Button
            variant={inputMethod === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMethod('photo')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-1" />
            Photo
          </Button>
        </div>

        {/* Recipe Name */}
        <div>
          <Input
            placeholder="Recipe name..."
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="text-base"
          />
        </div>

        {/* Current Ingredients List */}
        {ingredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Ingredients ({ingredients.length})</h4>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {ingredient.name} - {ingredient.amount} {ingredient.unit}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="h-6 w-6 p-0 text-red-500"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Common Ingredients */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Quick Add</h4>
          <div className="flex flex-wrap gap-1">
            {commonIngredients.map((ingredient) => (
              <Badge
                key={ingredient}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleQuickAdd(ingredient)}
              >
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        {/* Add Ingredient Form */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex gap-2">
            <Input
              placeholder="Ingredient name"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              className="flex-1"
            />
            {inputMethod === 'voice' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className="px-3"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
            {inputMethod === 'photo' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoInput}
                className="px-3"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
            <select
              value={currentUnit}
              onChange={(e) => setCurrentUnit(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          
          <Button onClick={addIngredient} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>

        {/* Create Recipe Button */}
        <Button 
          onClick={createRecipe} 
          className="w-full"
          disabled={!recipeName.trim() || ingredients.length === 0}
        >
          Create Recipe ({ingredients.length} ingredients)
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileRecipeInput;
