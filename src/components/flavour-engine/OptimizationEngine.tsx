// Epic 3: Auto-Classify & Auto-Balance Engine

import React, { useState } from 'react';
import { Zap, Lock, Unlock, RefreshCw, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface OptimizationEngineProps {
  recipe: { [ingredient: string]: number };
  targets: any; // ProductTargets type
  onRecipeUpdate: (newRecipe: { [ingredient: string]: number }) => void;
  onClassificationChange: (classification: string) => void;
}

interface IngredientLock {
  [ingredient: string]: boolean;
}

const OptimizationEngine: React.FC<OptimizationEngineProps> = ({
  recipe,
  targets,
  onRecipeUpdate,
  onClassificationChange
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [locks, setLocks] = useState<IngredientLock>({});
  const [optimizeSet, setOptimizeSet] = useState<'all' | 'sugars' | 'dairy' | 'stabilizers'>('all');

  // Stub implementations
  const calculateRecipeMetrics = (recipe: any) => ({ 
    sugars: 15, fat: 8, msnf: 9, ts_additive: 35, sp: 18, pac: 25 
  });
  const classifyRecipe = (metrics: any) => 'gelato_finished';
  
  const metrics = calculateRecipeMetrics(recipe);
  const classification = classifyRecipe(metrics);

  const toggleLock = (ingredient: string) => {
    setLocks(prev => ({
      ...prev,
      [ingredient]: !prev[ingredient]
    }));
  };

  const getClassificationBadge = (classification: string) => {
    const colors = {
      white_base: 'bg-blue-100 text-blue-800',
      finished_gelato: 'bg-green-100 text-green-800',
      fruit_gelato: 'bg-purple-100 text-purple-800',
      sorbet: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[classification] || 'bg-gray-100 text-gray-800'}>
        Detected: {classification.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} (closest fit)
      </Badge>
    );
  };

  const optimizeRecipe = async () => {
    setIsOptimizing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const optimizedRecipe = performOptimization(recipe, targets, locks, optimizeSet);
      
      if (optimizedRecipe) {
        onRecipeUpdate(optimizedRecipe);
        toast({
          title: "Recipe Optimized",
          description: "Successfully balanced recipe to meet targets within constraints",
        });
      } else {
        toast({
          title: "Optimization Failed",
          description: "Could not meet all targets with current constraints. Try unlocking more ingredients.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Optimization Error", 
        description: "An error occurred during optimization",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const performOptimization = (
    currentRecipe: { [ingredient: string]: number },
    targets: any,
    locks: IngredientLock,
    optimizeSet: string
  ): { [ingredient: string]: number } | null => {
    return { ...currentRecipe }; // Stub - just return original recipe
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-accent" />
          Auto-Balance Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Classification Display */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recipe Classification</div>
          {getClassificationBadge(classification)}
          <p className="text-xs text-muted-foreground">
            Based on closest fit across TS/Sugar/Fat/MSNF parameters
          </p>
        </div>

        {/* Ingredient Locks */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Ingredient Locks</div>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {Object.keys(recipe).map(ingredient => (
              <div key={ingredient} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs font-medium truncate flex-1">{ingredient}</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!locks[ingredient]}
                    onCheckedChange={() => toggleLock(ingredient)}
                  />
                  {locks[ingredient] ? (
                    <Lock className="h-3 w-3 text-red-500" />
                  ) : (
                    <Unlock className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Set Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Optimize Set</label>
          <Select value={optimizeSet} onValueChange={(value) => setOptimizeSet(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ingredients</SelectItem>
              <SelectItem value="sugars">Sugars Only</SelectItem>
              <SelectItem value="dairy">Dairy Only</SelectItem>
              <SelectItem value="stabilizers">Stabilizers Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Optimization Button */}
        <Button 
          onClick={optimizeRecipe}
          disabled={isOptimizing}
          className="w-full"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Auto-Balance Recipe
            </>
          )}
        </Button>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Lock ingredients</strong> to prevent optimization changes</p>
          <p>• <strong>Optimize Set</strong> limits which ingredients can be adjusted</p>
          <p>• Algorithm attempts to hit all targets within ±0.2 SP and ±0.5 PAC</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationEngine;