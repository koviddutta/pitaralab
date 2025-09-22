// System verification component to ensure all features work
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { calcMetrics } from '@/lib/calc';
import { getSeedIngredients } from '@/lib/ingredientLibrary';
import { mlService } from '@/services/mlService';
import { pairingService } from '@/services/pairingService';
import { recommendTemps } from '@/lib/scoopability';
import { getActiveParameters } from '@/services/productParametersService';

export default function SystemCheck() {
  const [checks, setChecks] = useState<Array<{name: string; status: 'pending' | 'pass' | 'fail'; message: string}>>([
    { name: 'Core Calculation Engine', status: 'pending', message: '' },
    { name: 'ML Service Integration', status: 'pending', message: '' },
    { name: 'Flavor Pairing System', status: 'pending', message: '' },
    { name: 'Temperature Calculations', status: 'pending', message: '' },
    { name: 'Parameters System', status: 'pending', message: '' },
    { name: 'Ingredient Database', status: 'pending', message: '' }
  ]);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    const updatedChecks = [...checks];
    
    try {
      // Test 1: Core calculation engine
      const ingredients = getSeedIngredients().slice(0, 3);
      const testRows = ingredients.map(ing => ({ ing, grams: 100 }));
      const metrics = calcMetrics(testRows);
      
      if (metrics.sp > 0 && metrics.pac > 0) {
        updatedChecks[0] = { name: 'Core Calculation Engine', status: 'pass', message: `SP: ${metrics.sp.toFixed(1)}, PAC: ${metrics.pac.toFixed(1)}` };
      } else {
        updatedChecks[0] = { name: 'Core Calculation Engine', status: 'fail', message: 'Metrics calculation failed' };
      }
    } catch (e) {
      updatedChecks[0] = { name: 'Core Calculation Engine', status: 'fail', message: 'Calculation error' };
    }

    try {
      // Test 2: ML Service
      const performance = mlService.getModelPerformance();
      updatedChecks[1] = { name: 'ML Service Integration', status: 'pass', message: `Accuracy: ${(performance.accuracy * 100).toFixed(1)}%` };
    } catch (e) {
      updatedChecks[1] = { name: 'ML Service Integration', status: 'fail', message: 'ML service error' };
    }

    try {
      // Test 3: Flavor pairing
      const testIngredients = getSeedIngredients().slice(0, 5);
      if (testIngredients.length > 0) {
        const pairings = pairingService.suggestFor(testIngredients[0], testIngredients.slice(1), () => 0);
        updatedChecks[2] = { name: 'Flavor Pairing System', status: 'pass', message: `Found ${pairings.length} pairings` };
      }
    } catch (e) {
      updatedChecks[2] = { name: 'Flavor Pairing System', status: 'fail', message: 'Pairing system error' };
    }

    try {
      // Test 4: Temperature calculations
      const testMetrics = { sp: 18, pac: 25, water_pct: 70, ts_add_pct: 35, fat_pct: 10, sugars_pct: 18, msnf_pct: 8 };
      const tempAdvice = recommendTemps(testMetrics as any);
      updatedChecks[3] = { name: 'Temperature Calculations', status: 'pass', message: `Serve temp: ${tempAdvice.serveTempC.toFixed(1)}°C` };
    } catch (e) {
      updatedChecks[3] = { name: 'Temperature Calculations', status: 'fail', message: 'Temperature calc error' };
    }

    try {
      // Test 5: Parameters system
      const params = getActiveParameters();
      updatedChecks[4] = { name: 'Parameters System', status: 'pass', message: `Profile: ${params.name}` };
    } catch (e) {
      updatedChecks[4] = { name: 'Parameters System', status: 'fail', message: 'Parameters error' };
    }

    try {
      // Test 6: Ingredient database
      const ingredients = getSeedIngredients();
      updatedChecks[5] = { name: 'Ingredient Database', status: 'pass', message: `${ingredients.length} ingredients loaded` };
    } catch (e) {
      updatedChecks[5] = { name: 'Ingredient Database', status: 'fail', message: 'Database error' };
    }

    setChecks(updatedChecks);
  };

  const passedCount = checks.filter(c => c.status === 'pass').length;
  const failedCount = checks.filter(c => c.status === 'fail').length;
  const allComplete = checks.every(c => c.status !== 'pending');

  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">System Status Check</h3>
      
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm ${
          allComplete 
            ? (failedCount === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')
            : 'bg-slate-100 text-slate-800'
        }`}>
          {allComplete ? (
            failedCount === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
          ) : (
            <Loader className="h-4 w-4 animate-spin" />
          )}
          {passedCount}/{checks.length} systems operational
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded border">
            <div className="flex items-center gap-2">
              {check.status === 'pending' && <Loader className="h-4 w-4 animate-spin text-slate-400" />}
              {check.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {check.status === 'fail' && <AlertCircle className="h-4 w-4 text-red-600" />}
              <span className={check.status === 'fail' ? 'text-red-800' : ''}>{check.name}</span>
            </div>
            <span className="text-xs text-slate-600">{check.message}</span>
          </div>
        ))}
      </div>

      {allComplete && (
        <div className="mt-4 p-3 bg-slate-50 rounded text-sm">
          <p className="font-medium">System Overview:</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-600">
            <li>• AI-powered recipe optimization with Indian flavor database</li>
            <li>• Temperature-based auto-tuning for serving consistency</li>
            <li>• Machine-aware formulations (batch vs continuous)</li>
            <li>• Real-time PAC/SP calculations with evaporation support</li>
            <li>• Mobile-optimized interface with full feature access</li>
            <li>• Production logging system for ML model improvement</li>
          </ul>
        </div>
      )}
    </Card>
  );
}