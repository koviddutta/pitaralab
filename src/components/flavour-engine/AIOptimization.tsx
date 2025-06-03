
import React from 'react';
import { Zap, CheckCircle, Target, Brain, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OptimizationSuggestion } from './types';

interface AIOptimizationProps {
  allTargetsMet: boolean;
  suggestions: OptimizationSuggestion[];
  isOptimizing: boolean;
  onAutoOptimize: () => void;
}

const AIOptimization = ({ allTargetsMet, suggestions, isOptimizing, onAutoOptimize }: AIOptimizationProps) => {
  return (
    <div className="lg:col-span-1">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-yellow-600" />
        <Label className="text-lg font-semibold">AI Optimization</Label>
      </div>
      
      <div className={`p-6 rounded-lg mb-6 border-2 transition-all ${allTargetsMet ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'}`}>
        <div className="flex items-center gap-3 mb-3">
          {allTargetsMet ? 
            <CheckCircle className="h-6 w-6 text-green-600" /> : 
            <Target className="h-6 w-6 text-red-600" />
          }
          <span className={`font-bold text-lg ${allTargetsMet ? 'text-green-800' : 'text-red-800'}`}>
            {allTargetsMet ? 'Recipe Balanced!' : 'Needs Optimization'}
          </span>
        </div>
        <p className={`text-sm ${allTargetsMet ? 'text-green-700' : 'text-red-700'}`}>
          {allTargetsMet ? 
            'All chemistry targets met. Ready for production!' : 
            'Some parameters are out of target range.'
          }
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            AI Suggestions
          </Label>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">{suggestion.message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={suggestion.action}
                className="text-xs bg-white hover:bg-yellow-100"
              >
                Apply Fix
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3"
        disabled={allTargetsMet || isOptimizing}
        onClick={onAutoOptimize}
      >
        {isOptimizing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Optimizing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Auto-Optimize Recipe
          </>
        )}
      </Button>

      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
        <Label className="text-xs font-semibold text-gray-700 mb-3 block">Development Status</Label>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">R&D Cycle:</span>
            <span className="font-semibold text-gray-800">~2 weeks → 1 day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Confidence:</span>
            <span className="font-semibold text-gray-800">85%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-semibold text-gray-800">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOptimization;
