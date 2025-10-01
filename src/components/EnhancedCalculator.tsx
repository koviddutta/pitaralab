/**
 * Enhanced Calculator - Comprehensive recipe development interface
 * Includes: Overrun, Classification, Warnings, Sugar Spectrum, Milk/Cream Converter, DE Effects
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Plus, Trash2, Save } from 'lucide-react';
import { calcEnhancedMetrics, EnhancedMetrics } from '@/lib/calc.enhanced';
import { IngredientData } from '@/types/ingredients';
import { useToast } from '@/hooks/use-toast';
import SugarSpectrumBalance from './SugarSpectrumBalance';
import MilkCreamConverter from './MilkCreamConverter';
import ProductClassifier from './ProductClassifier';
import WarningsSidebar from './WarningsSidebar';
import DEEffectsPanel from './DEEffectsPanel';

// Mock ingredient library (in production, fetch from Supabase)
const mockIngredients: IngredientData[] = [
  {
    id: 'milk_whole',
    name: 'Whole Milk (3.5% fat)',
    category: 'dairy',
    water_pct: 87.5,
    sugars_pct: 4.8,
    fat_pct: 3.5,
    msnf_pct: 8.2,
    other_solids_pct: 0.5,
    sp_coeff: 35,
    pac_coeff: 35,
  },
  {
    id: 'cream_35',
    name: 'Heavy Cream (35%)',
    category: 'dairy',
    water_pct: 58.2,
    sugars_pct: 3.1,
    fat_pct: 35.0,
    msnf_pct: 5.4,
    other_solids_pct: 0.3,
    sp_coeff: 20,
    pac_coeff: 20,
  },
  {
    id: 'sucrose',
    name: 'Sucrose (Table Sugar)',
    category: 'sugar',
    water_pct: 0,
    sugars_pct: 100,
    fat_pct: 0,
    sp_coeff: 100,
    pac_coeff: 100,
  },
  {
    id: 'dextrose',
    name: 'Dextrose (Glucose)',
    category: 'sugar',
    water_pct: 0,
    sugars_pct: 100,
    fat_pct: 0,
    sp_coeff: 70,
    pac_coeff: 190,
  },
  {
    id: 'glucose_de60',
    name: 'Glucose Syrup (DE 60)',
    category: 'sugar',
    water_pct: 20,
    sugars_pct: 75,
    fat_pct: 0,
    other_solids_pct: 5,
    sp_coeff: 50,
    pac_coeff: 118,
  },
  {
    id: 'smp',
    name: 'Skim Milk Powder (SMP)',
    category: 'dairy',
    water_pct: 3.5,
    sugars_pct: 52,
    fat_pct: 1,
    msnf_pct: 93,
    other_solids_pct: 0.5,
    sp_coeff: 35,
    pac_coeff: 35,
  },
];

type RecipeRow = {
  ing: IngredientData;
  grams: number;
};

export const EnhancedCalculator: React.FC = () => {
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState('');
  const [rows, setRows] = useState<RecipeRow[]>([
    { ing: mockIngredients[0], grams: 650 },
    { ing: mockIngredients[1], grams: 150 },
    { ing: mockIngredients[5], grams: 60 },
    { ing: mockIngredients[2], grams: 100 },
    { ing: mockIngredients[3], grams: 20 },
    { ing: mockIngredients[4], grams: 20 },
  ]);
  const [evaporation, setEvaporation] = useState(0);
  const [overrun, setOverrun] = useState(20);

  // Calculate metrics
  const metrics: EnhancedMetrics = useMemo(
    () => calcEnhancedMetrics(rows, { evaporation_pct: evaporation, overrun_pct: overrun }),
    [rows, evaporation, overrun]
  );

  // Calculate total sugar grams for spectrum balance
  const totalSugarGrams = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (row.ing.category === 'sugar') {
        return sum + (row.grams * (row.ing.sugars_pct || 0)) / 100;
      }
      return sum;
    }, 0);
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, { ing: mockIngredients[0], grams: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: 'ing' | 'grams', value: any) => {
    const newRows = [...rows];
    if (field === 'ing') {
      newRows[index].ing = value;
    } else {
      newRows[index].grams = parseFloat(value) || 0;
    }
    setRows(newRows);
  };

  const handleApplySugarBlend = (blend: { sucrose_g: number; dextrose_g: number; glucose_g: number }) => {
    // Remove existing sugar rows
    const nonSugarRows = rows.filter(r => r.ing.category !== 'sugar');
    
    // Add new sugar blend
    const sucroseIng = mockIngredients.find(i => i.id === 'sucrose')!;
    const dextroseIng = mockIngredients.find(i => i.id === 'dextrose')!;
    const glucoseIng = mockIngredients.find(i => i.id === 'glucose_de60')!;
    
    setRows([
      ...nonSugarRows,
      { ing: sucroseIng, grams: blend.sucrose_g },
      { ing: dextroseIng, grams: blend.dextrose_g },
      { ing: glucoseIng, grams: blend.glucose_g },
    ]);
    
    toast({
      title: 'Sugar blend applied',
      description: 'Recipe updated with new sugar spectrum',
    });
  };

  const handleSave = () => {
    // In production, save to Supabase
    toast({
      title: 'Recipe saved',
      description: `"${recipeName || 'Untitled Recipe'}" saved successfully`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Enhanced Recipe Calculator</CardTitle>
                <CardDescription>
                  Comprehensive formulation with classification, warnings, and optimization tools
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Recipe Name (e.g., Classic Vanilla Gelato)"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Main Layout - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Recipe Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingredient List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={row.ing.id}
                    onChange={(e) => {
                      const ing = mockIngredients.find(i => i.id === e.target.value)!;
                      handleUpdateRow(idx, 'ing', ing);
                    }}
                    className="flex-1 p-2 border rounded text-sm"
                  >
                    {mockIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={row.grams}
                    onChange={(e) => handleUpdateRow(idx, 'grams', e.target.value)}
                    className="w-24"
                    placeholder="grams"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              
              <Button
                onClick={handleAddRow}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Process Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Evaporation %</Label>
                <Input
                  type="number"
                  step="1"
                  value={evaporation}
                  onChange={(e) => setEvaporation(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Water loss during pasteurization
                </p>
              </div>
              
              <div>
                <Label>Overrun %</Label>
                <Input
                  type="number"
                  step="5"
                  value={overrun}
                  onChange={(e) => setOverrun(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Air incorporation during churning (typical: 20-30%)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Solids</p>
                  <p className="text-xl font-bold">{metrics.ts_add_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fat</p>
                  <p className="text-xl font-bold">{metrics.fat_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sugar</p>
                  <p className="text-xl font-bold">{metrics.sugars_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">MSNF</p>
                  <p className="text-xl font-bold">{metrics.msnf_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">SP</p>
                  <p className="text-xl font-bold">{metrics.sp.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PAC</p>
                  <p className="text-xl font-bold">{metrics.pac.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">POD</p>
                  <p className="text-xl font-bold">{metrics.pod_pct.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Final Yield</p>
                  <p className="text-xl font-bold">{metrics.yield_final_g.toFixed(0)}g</p>
                </div>
              </div>
              
              {metrics.pod_warning && (
                <div className="pt-2 border-t">
                  <Badge variant="destructive" className="text-xs">
                    {metrics.pod_warning}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE: Tools & Analysis */}
        <div className="space-y-4">
          <Tabs defaultValue="classifier">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classifier">Classifier</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classifier" className="mt-4">
              <ProductClassifier metrics={metrics} />
            </TabsContent>
            
            <TabsContent value="tools" className="space-y-4 mt-4">
              <SugarSpectrumBalance
                totalSugarGrams={totalSugarGrams}
                onApply={handleApplySugarBlend}
              />
              <DEEffectsPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: Warnings & Converter */}
        <div className="space-y-4">
          <WarningsSidebar metrics={metrics} />
          <MilkCreamConverter />
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalculator;
