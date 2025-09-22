// Epic 5: Sugar Spectrum 70-10-20 Preset

import React, { useState } from 'react';
import { Candy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SugarSpectrumToggleProps {
  recipe: { [ingredient: string]: number };
  onRecipeUpdate: (newRecipe: { [ingredient: string]: number }) => void;
  locks: { [ingredient: string]: boolean };
}

const SugarSpectrumToggle: React.FC<SugarSpectrumToggleProps> = ({
  recipe,
  onRecipeUpdate,
  locks
}) => {
  const [spectrumEnabled, setSpectrumEnabled] = useState(false);

  const applySugarSpectrum = (enabled: boolean) => {
    setSpectrumEnabled(enabled);
    
    if (!enabled) return;

    // Calculate total sugar amount
    const totalSugar = Object.entries(recipe)
      .filter(([name]) => name.toLowerCase().includes('sugar') || 
                         name.toLowerCase().includes('sucrose') || 
                         name.toLowerCase().includes('dextrose'))
      .reduce((sum, [, amount]) => sum + amount, 0);

    if (totalSugar === 0) return;

    const newRecipe = { ...recipe };
    
    // Remove existing sugars (unless locked)
    Object.keys(newRecipe).forEach(ingredient => {
      if ((ingredient.toLowerCase().includes('sugar') || 
           ingredient.toLowerCase().includes('sucrose') || 
           ingredient.toLowerCase().includes('dextrose')) && 
          !locks[ingredient]) {
        delete newRecipe[ingredient];
      }
    });

    // Apply 70-10-20 spectrum - stub implementation
    const calculateSugarSpectrum = (total: number) => ({
      'Sucrose': total * 0.7,
      'Dextrose': total * 0.1, 
      'Glucose DE60': total * 0.2
    });
    const spectrum = calculateSugarSpectrum(totalSugar);
    Object.entries(spectrum).forEach(([sugarType, amount]) => {
      if (!locks[sugarType]) {
        newRecipe[sugarType] = amount;
      }
    });

    onRecipeUpdate(newRecipe);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Candy className="h-5 w-5 text-pink-600" />
          Sugar Spectrum 70-10-20
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Apply Sugar Spectrum</Label>
          <Switch
            checked={spectrumEnabled}
            onCheckedChange={applySugarSpectrum}
          />
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>70% Sucrose</strong> - Disaccharides for taste & creaminess</p>
          <p><strong>10% Dextrose</strong> - Monosaccharides for softness</p>  
          <p><strong>20% Glucose DE60</strong> - Polysaccharides for compactness</p>
        </div>

        <div className="p-3 bg-muted rounded-lg text-xs">
          <p>When ON: Total sugars are automatically split. Locked sugars remain unchanged.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SugarSpectrumToggle;