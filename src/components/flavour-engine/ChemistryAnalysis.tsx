
import React from 'react';
import { Target, CheckCircle, AlertTriangle, IndianRupee } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RecipeMetrics, RecipeTargets } from './types';

interface ChemistryAnalysisProps {
  metrics: RecipeMetrics;
  targets: RecipeTargets;
  targetResults: { [key: string]: boolean };
}

const ChemistryAnalysis = ({ metrics, targets, targetResults }: ChemistryAnalysisProps) => {
  const getMetricColor = (isInRange: boolean) => {
    return isInRange ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200';
  };

  const getMetricIconColor = (isInRange: boolean) => {
    return isInRange ? 'text-green-600' : 'text-red-600';
  };

  const metricConfigs = [
    { key: 'totalSolids', label: 'Total Solids', unit: '%', target: targets.totalSolids },
    { key: 'fat', label: 'Fat Content', unit: '%', target: targets.fat },
    { key: 'msnf', label: 'MSNF', unit: '%', target: targets.msnf },
    { key: 'pac', label: 'PAC', unit: '%', target: targets.pac },
    { key: 'sweetness', label: 'Sweetness', unit: '%', target: targets.sweetness }
  ];

  return (
    <div className="lg:col-span-1">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-indigo-600" />
        <Label className="text-lg font-semibold">Chemistry Analysis</Label>
      </div>
      <div className="space-y-4">
        {metricConfigs.map(({ key, label, unit, target }) => {
          const value = metrics[key as keyof RecipeMetrics] as number;
          const isInRange = targetResults[key];
          
          return (
            <div key={key} className={`p-4 rounded-lg border bg-gradient-to-r ${getMetricColor(isInRange)} transition-all hover:shadow-md`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{value.toFixed(1)}{unit}</span>
                  {isInRange ? 
                    <CheckCircle className={`h-5 w-5 ${getMetricIconColor(isInRange)}`} /> : 
                    <AlertTriangle className={`h-5 w-5 ${getMetricIconColor(isInRange)}`} />
                  }
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Target: {target.min}-{target.max}{unit}</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isInRange ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (value / target.max) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <Separator className="my-4" />

        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-blue-800 flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              Batch Cost
            </span>
            <span className="font-bold text-xl text-blue-900 flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {metrics.cost.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-blue-600">Total Weight: {metrics.totalWeight}g</div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryAnalysis;
