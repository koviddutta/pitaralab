
import React, { useState } from 'react';
import { IceCreamCone, ChefHat, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Recipe {
  name: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  instructions: string[];
}

const BaseRecipeSelector = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recipes: Recipe[] = [
    {
      name: 'Classic Vanilla Ice Cream',
      type: 'Ice Cream',
      difficulty: 'Easy',
      time: '4 hours',
      ingredients: [
        { name: 'Heavy Cream', amount: 500, unit: 'ml' },
        { name: 'Whole Milk', amount: 250, unit: 'ml' },
        { name: 'Sugar', amount: 150, unit: 'g' },
        { name: 'Egg Yolks', amount: 6, unit: 'pieces' },
        { name: 'Vanilla Extract', amount: 2, unit: 'tsp' },
        { name: 'Salt', amount: 1, unit: 'pinch' }
      ],
      instructions: [
        'Heat milk and cream to 80°C',
        'Whisk egg yolks with sugar until pale',
        'Temper the egg mixture with hot cream',
        'Cook to 85°C while stirring',
        'Strain and add vanilla',
        'Chill for 4+ hours',
        'Churn in ice cream maker'
      ]
    },
    {
      name: 'Italian Gelato Base',
      type: 'Gelato',
      difficulty: 'Medium',
      time: '6 hours',
      ingredients: [
        { name: 'Whole Milk', amount: 600, unit: 'ml' },
        { name: 'Heavy Cream', amount: 200, unit: 'ml' },
        { name: 'Sugar', amount: 120, unit: 'g' },
        { name: 'Egg Yolks', amount: 4, unit: 'pieces' },
        { name: 'Dextrose', amount: 20, unit: 'g' },
        { name: 'Stabilizer', amount: 2, unit: 'g' }
      ],
      instructions: [
        'Mix dry ingredients thoroughly',
        'Heat milk to 45°C, add sugar mixture',
        'Heat to 85°C while whisking',
        'Add cream and blend well',
        'Homogenize if equipment available',
        'Age mixture for 4+ hours',
        'Churn at lower temperature than ice cream'
      ]
    },
    {
      name: 'Sorbet Base',
      type: 'Sorbet',
      difficulty: 'Easy',
      time: '3 hours',
      ingredients: [
        { name: 'Water', amount: 400, unit: 'ml' },
        { name: 'Sugar', amount: 200, unit: 'g' },
        { name: 'Fruit Puree', amount: 300, unit: 'ml' },
        { name: 'Lemon Juice', amount: 2, unit: 'tbsp' },
        { name: 'Glucose', amount: 30, unit: 'g' }
      ],
      instructions: [
        'Make simple syrup with water and sugar',
        'Cool syrup completely',
        'Blend with fruit puree and lemon juice',
        'Strain mixture if needed',
        'Chill for 2+ hours',
        'Churn in ice cream maker',
        'Serve immediately for best texture'
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success-light text-success-foreground border-success/20';
      case 'Medium': return 'bg-warning-light text-warning-foreground border-warning/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="gradient-accent">
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          Base Recipe Library
        </CardTitle>
        <CardDescription>
          Choose from our collection of professional ice cream, gelato, and sorbet recipes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="ice-cream">Ice Cream</TabsTrigger>
            <TabsTrigger value="gelato">Gelato</TabsTrigger>
            <TabsTrigger value="sorbet">Sorbet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {recipes.map((recipe, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRecipe(selectedRecipe?.name === recipe.name ? null : recipe)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <IceCreamCone className="h-8 w-8 text-pink-500" />
                      <div>
                        <h3 className="font-semibold text-lg">{recipe.name}</h3>
                        <p className="text-sm text-gray-600">{recipe.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                      <Badge variant="outline">{recipe.time}</Badge>
                    </div>
                  </div>
                  
                  {selectedRecipe?.name === recipe.name && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Ingredients
                          </h4>
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, i) => (
                              <li key={i} className="flex justify-between text-sm">
                                <span>{ingredient.name}</span>
                                <span className="font-medium">
                                  {ingredient.amount} {ingredient.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Instructions</h4>
                          <ol className="space-y-2">
                            {recipe.instructions.map((step, i) => (
                              <li key={i} className="text-sm flex gap-2">
                                <span className="font-medium text-pink-600 min-w-[20px]">
                                  {i + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          {['ice-cream', 'gelato', 'sorbet'].map(type => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid gap-4">
                {recipes.filter(recipe => recipe.type.toLowerCase().includes(type.replace('-', ' '))).map((recipe, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRecipe(selectedRecipe?.name === recipe.name ? null : recipe)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IceCreamCone className="h-8 w-8 text-pink-500" />
                        <div>
                          <h3 className="font-semibold text-lg">{recipe.name}</h3>
                          <p className="text-sm text-gray-600">{recipe.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(recipe.difficulty)}>
                          {recipe.difficulty}
                        </Badge>
                        <Badge variant="outline">{recipe.time}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BaseRecipeSelector;
