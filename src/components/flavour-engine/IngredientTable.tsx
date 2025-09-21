// Epic 6: Enhanced Ingredient Table with Mobile UX

import React from 'react';
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

const IngredientTable: React.FC<IngredientTableProps> = ({
  recipe,
  onRecipeUpdate,
  locks,
  onLockToggle,
  contributions,
  targets,
  isMobile = false
}) => {
  const adjustAmount = (ingredient: string, delta: number) => {
    const currentAmount = recipe[ingredient] || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    onRecipeUpdate(ingredient, newAmount.toString());
  };

  if (isMobile) {
    // Mobile: Cards layout with sticky totals
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recipe Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(recipe).map(([ingredient, amount]) => (
              <Card key={ingredient} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{ingredient}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLockToggle(ingredient)}
                    className="h-6 w-6 p-0"
                  >
                    {locks[ingredient] ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onMouseDown={() => adjustAmount(ingredient, -10)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => onRecipeUpdate(ingredient, e.target.value)}
                    className="flex-1 text-center"
                    inputMode="decimal"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onMouseDown={() => adjustAmount(ingredient, 10)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>SP Δ: {contributions.sp[ingredient]?.toFixed(2) || '0'}</div>
                  <div>PAC Δ: {contributions.pac[ingredient]?.toFixed(2) || '0'}</div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Sticky Bottom Bar for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-10">
          <div className="flex justify-around text-xs">
            <Badge>TS: 32-37%</Badge>
            <Badge>Sugar: 16-22%</Badge>
            <Badge>Fat: 10-20%</Badge>
            <Badge>SP: 12-22</Badge>
            <Badge>PAC: 22-28</Badge>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Ingredient Analysis Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Ingredient</th>
                <th className="text-right p-2">g</th>
                <th className="text-right p-2">Water g</th>
                <th className="text-right p-2">Sugars g</th>
                <th className="text-right p-2">Fat g</th>
                <th className="text-right p-2">MSNF g</th>
                <th className="text-right p-2">Other g</th>
                <th className="text-right p-2">TS g</th>
                <th className="text-right p-2">SP Δ</th>
                <th className="text-right p-2">PAC Δ</th>
                <th className="text-right p-2">₹/batch</th>
                <th className="text-center p-2">Lock</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(recipe).map(([ingredient, amount]) => (
                <tr key={ingredient} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{ingredient}</td>
                  <td className="p-2 text-right">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => onRecipeUpdate(ingredient, e.target.value)}
                      className="w-20 text-right"
                    />
                  </td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-right">{contributions.sp[ingredient]?.toFixed(2) || '0'}</td>
                  <td className="p-2 text-right">{contributions.pac[ingredient]?.toFixed(2) || '0'}</td>
                  <td className="p-2 text-right">-</td>
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLockToggle(ingredient)}
                      className="h-6 w-6 p-0"
                    >
                      {locks[ingredient] ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientTable;