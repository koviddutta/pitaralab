// Epic 4: Milk/Cream Converter + Evaporation

import React, { useState } from 'react';
import { Droplets, Thermometer, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface UnitConverterAdvancedProps {
  onEvaporationChange: (evaporationPct: number) => void;
  evaporationPct: number;
  onMilkFatChange: (fatPct: number) => void;
  milkFatPct: number;
  onCreamFatChange: (fatPct: number) => void;
  creamFatPct: number;
}

const UnitConverterAdvanced: React.FC<UnitConverterAdvancedProps> = ({
  onEvaporationChange,
  evaporationPct,
  onMilkFatChange,
  milkFatPct,
  onCreamFatChange,
  creamFatPct
}) => {
  const [evaporationEnabled, setEvaporationEnabled] = useState(false);
  
  const handleEvaporationToggle = (enabled: boolean) => {
    setEvaporationEnabled(enabled);
    if (!enabled) {
      onEvaporationChange(0);
    }
  };

  const getMilkType = (fatPct: number): string => {
    if (fatPct <= 0.5) return 'Skim Milk';
    if (fatPct <= 2) return 'Low-fat Milk';
    if (fatPct <= 3.5) return 'Whole Milk';
    if (fatPct <= 6) return 'Rich Milk';
    return 'Extra Rich Milk';
  };

  const getCreamType = (fatPct: number): string => {
    if (fatPct <= 18) return 'Half & Half';
    if (fatPct <= 25) return 'Light Cream';
    if (fatPct <= 35) return 'Heavy Cream';
    if (fatPct <= 40) return 'Extra Heavy Cream';
    return 'Double Cream';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-blue-600" />
          Advanced Unit Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Milk Fat % Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Milk Fat Content</Label>
            <Badge variant="outline">{getMilkType(milkFatPct)}</Badge>
          </div>
          <div className="space-y-2">
            <Slider
              value={[milkFatPct]}
              onValueChange={(value) => onMilkFatChange(value[0])}
              max={8}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Skim)</span>
              <span className="font-medium">{milkFatPct.toFixed(1)}%</span>
              <span>8% (Rich)</span>
            </div>
          </div>
        </div>

        {/* Cream Fat % Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Cream Fat Content</Label>
            <Badge variant="outline">{getCreamType(creamFatPct)}</Badge>
          </div>
          <div className="space-y-2">
            <Slider
              value={[creamFatPct]}
              onValueChange={(value) => onCreamFatChange(value[0])}
              max={45}
              min={10}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10% (Light)</span>
              <span className="font-medium">{creamFatPct.toFixed(1)}%</span>
              <span>45% (Double)</span>
            </div>
          </div>
        </div>

        {/* Evaporation Modeling */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium">Model Evaporation</Label>
            </div>
            <Switch
              checked={evaporationEnabled}
              onCheckedChange={handleEvaporationToggle}
            />
          </div>
          
          {evaporationEnabled && (
            <div className="space-y-2">
              <Slider
                value={[evaporationPct]}
                onValueChange={(value) => onEvaporationChange(value[0])}
                max={25}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (No evaporation)</span>
                <span className="font-medium">{evaporationPct.toFixed(1)}% water lost</span>
                <span>25% (High evaporation)</span>
              </div>
              
              {evaporationPct > 0 && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-blue-700">
                    <Thermometer className="h-3 w-3" />
                    <span className="font-medium">Water Locked</span> - Reducing water content before TS/SP/PAC calculations
                  </div>
                </div>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            When evaporation modeling is ON, water content is reduced before computing Total Solids, SP, and PAC values.
          </p>
        </div>

        {/* Conversion Reference */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Quick Reference</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-medium">Standard Milk:</div>
              <div>Whole: 3.25%</div>
              <div>2%: 2.0%</div>
              <div>1%: 1.0%</div>
              <div>Skim: 0.1%</div>
            </div>
            <div>
              <div className="font-medium">Standard Cream:</div>
              <div>Heavy: 36%</div>
              <div>Whipping: 30%</div>
              <div>Light: 20%</div>
              <div>Half & Half: 12%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitConverterAdvanced;