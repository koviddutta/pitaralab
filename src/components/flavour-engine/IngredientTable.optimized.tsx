// OPTIMIZED: React.memo + useMemo + Accessibility
import React, { useMemo, useCallback } from 'react';
import { Lock, Unlock, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface IngredientTableProps {
  recipe: { [ingredient: string]: number };
  onRecipeUpdate: (ingredient: string, value: string) => void;
  locks: { [ingredient: string]: boolean };
  onLockToggle: (ingredient: string) => void;
  contributions: {
    sp: { [ingredient: string]: number };
    pac: { [ingredient: string]: number };
  };
  targets: {
    sugar: [number, number];
    fat: [number, number];
    msnf: [number, number];
  };
  isMobile?: boolean;
}

// Memoized row component to prevent unnecessary re-renders
const IngredientRow = React.memo(({
  ingredient,
  amount,
  locked,
  spContribution,
  pacContribution,
  onUpdate,
  onLock,
  onAdjust,
}: {
  ingredient: string;
  amount: number;
  locked: boolean;
  spContribution: number;
  pacContribution: number;
  onUpdate: (value: string) => void;
  onLock: () => void;
  onAdjust: (delta: number) => void;
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onAdjust(10);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onAdjust(-10);
    }
  }, [onAdjust]);

  return (
    <tr className="border-b hover:bg-muted/50 focus-within:bg-muted">
      <td className="p-2">
        <label htmlFor={`input-${ingredient}`} className="font-medium">
          {ingredient}
        </label>
      </td>
      <td className="p-2 text-right">
        <Input
          id={`input-${ingredient}`}
          type="number"
          value={amount}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 text-right"
          aria-label={`Amount of ${ingredient} in grams`}
          aria-describedby={`${ingredient}-contributions`}
          disabled={locked}
        />
      </td>
      <td className="p-2 text-right" aria-label={`SP contribution: ${spContribution.toFixed(2)}`}>
        {spContribution.toFixed(2)}
      </td>
      <td className="p-2 text-right" aria-label={`PAC contribution: ${pacContribution.toFixed(2)}`}>
        {pacContribution.toFixed(2)}
      </td>
      <td className="p-2 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLock}
          className="h-6 w-6 p-0"
          aria-label={`${locked ? 'Unlock' : 'Lock'} ${ingredient} amount`}
          aria-pressed={locked}
        >
          {locked ? <Lock className="h-3 w-3" aria-hidden="true" /> : <Unlock className="h-3 w-3" aria-hidden="true" />}
        </Button>
      </td>
    </tr>
  );
});

IngredientRow.displayName = 'IngredientRow';

// Memoized mobile card component
const MobileIngredientCard = React.memo(({
  ingredient,
  amount,
  locked,
  spContribution,
  pacContribution,
  onUpdate,
  onLock,
  onAdjust,
}: {
  ingredient: string;
  amount: number;
  locked: boolean;
  spContribution: number;
  pacContribution: number;
  onUpdate: (value: string) => void;
  onLock: () => void;
  onAdjust: (delta: number) => void;
}) => (
  <Card className="p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="font-medium text-sm" id={`mobile-label-${ingredient}`}>
        {ingredient}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLock}
        className="h-6 w-6 p-0"
        aria-label={`${locked ? 'Unlock' : 'Lock'} ${ingredient}`}
        aria-pressed={locked}
      >
        {locked ? <Lock className="h-3 w-3" aria-hidden="true" /> : <Unlock className="h-3 w-3" aria-hidden="true" />}
      </Button>
    </div>
    
    <div className="flex items-center gap-2 mb-2" role="group" aria-labelledby={`mobile-label-${ingredient}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAdjust(-10)}
        className="h-8 w-8 p-0"
        aria-label="Decrease by 10 grams"
        disabled={locked}
      >
        <Minus className="h-3 w-3" aria-hidden="true" />
      </Button>
      
      <Input
        type="number"
        value={amount}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 text-center"
        inputMode="decimal"
        aria-label={`Amount of ${ingredient} in grams`}
        disabled={locked}
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAdjust(10)}
        className="h-8 w-8 p-0"
        aria-label="Increase by 10 grams"
        disabled={locked}
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
      </Button>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-xs" role="group" aria-label="Contributions">
      <div aria-label={`SP contribution: ${spContribution.toFixed(2)}`}>
        SP Δ: <strong>{spContribution.toFixed(2)}</strong>
      </div>
      <div aria-label={`PAC contribution: ${pacContribution.toFixed(2)}`}>
        PAC Δ: <strong>{pacContribution.toFixed(2)}</strong>
      </div>
    </div>
  </Card>
));

MobileIngredientCard.displayName = 'MobileIngredientCard';

const IngredientTable: React.FC<IngredientTableProps> = ({
  recipe,
  onRecipeUpdate,
  locks,
  onLockToggle,
  contributions,
  targets,
  isMobile = false
}) => {
  // Memoize sorted entries to prevent unnecessary re-sorts
  const sortedEntries = useMemo(() => 
    Object.entries(recipe).sort(([a], [b]) => a.localeCompare(b)),
    [recipe]
  );

  // Memoize callbacks to prevent child re-renders
  const createUpdateHandler = useCallback(
    (ingredient: string) => (value: string) => onRecipeUpdate(ingredient, value),
    [onRecipeUpdate]
  );

  const createLockHandler = useCallback(
    (ingredient: string) => () => onLockToggle(ingredient),
    [onLockToggle]
  );

  const createAdjustHandler = useCallback(
    (ingredient: string) => (delta: number) => {
      const currentAmount = recipe[ingredient] || 0;
      const newAmount = Math.max(0, currentAmount + delta);
      onRecipeUpdate(ingredient, newAmount.toString());
    },
    [recipe, onRecipeUpdate]
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recipe Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" role="list" aria-label="Recipe ingredients">
            {sortedEntries.map(([ingredient, amount]) => (
              <MobileIngredientCard
                key={ingredient}
                ingredient={ingredient}
                amount={amount}
                locked={locks[ingredient] || false}
                spContribution={contributions.sp[ingredient] || 0}
                pacContribution={contributions.pac[ingredient] || 0}
                onUpdate={createUpdateHandler(ingredient)}
                onLock={createLockHandler(ingredient)}
                onAdjust={createAdjustHandler(ingredient)}
              />
            ))}
          </CardContent>
        </Card>

        <div 
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-10"
          role="region"
          aria-label="Target ranges"
        >
          <div className="flex justify-around text-xs flex-wrap gap-2">
            <Badge variant="outline">TS: 32-37%</Badge>
            <Badge variant="outline">Sugar: 16-22%</Badge>
            <Badge variant="outline">Fat: 10-20%</Badge>
            <Badge variant="outline">SP: 12-22</Badge>
            <Badge variant="outline">PAC: 22-28</Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Ingredient Analysis Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" role="region" aria-label="Ingredient table" tabIndex={0}>
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left p-2">Ingredient</th>
                <th scope="col" className="text-right p-2">Amount (g)</th>
                <th scope="col" className="text-right p-2">SP Δ</th>
                <th scope="col" className="text-right p-2">PAC Δ</th>
                <th scope="col" className="text-center p-2">Lock</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(([ingredient, amount]) => (
                <IngredientRow
                  key={ingredient}
                  ingredient={ingredient}
                  amount={amount}
                  locked={locks[ingredient] || false}
                  spContribution={contributions.sp[ingredient] || 0}
                  pacContribution={contributions.pac[ingredient] || 0}
                  onUpdate={createUpdateHandler(ingredient)}
                  onLock={createLockHandler(ingredient)}
                  onAdjust={createAdjustHandler(ingredient)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(IngredientTable);
