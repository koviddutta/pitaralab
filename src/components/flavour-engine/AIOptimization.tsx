
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
        <Zap className="h-5 w-5 text-accent" />
        <Label className="text-lg font-semibold text-card-foreground">AI Optimization</Label>
      </div>
      
      <div className={`p-6 rounded-lg mb-6 border-2 transition-all animate-smooth ${allTargetsMet ? 'bg-gradient-to-r from-success-light to-success-light border-success/30' : 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30'}`}>
        <div className="flex items-center gap-3 mb-3">
          {allTargetsMet ? 
            <CheckCircle className="h-6 w-6 text-success" /> : 
            <Target className="h-6 w-6 text-destructive" />
          }
          <span className={`font-bold text-lg ${allTargetsMet ? 'text-success-foreground' : 'text-destructive'}`}>
            {allTargetsMet ? 'Recipe Balanced!' : 'Needs Optimization'}
          </span>
        </div>
        <p className={`text-sm ${allTargetsMet ? 'text-success-foreground/80' : 'text-destructive/80'}`}>
          {allTargetsMet ? 
            'All chemistry targets met. Ready for production!' : 
            'Some parameters are out of target range.'
          }
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            AI Suggestions
          </Label>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 gradient-accent border border-accent/20 rounded-lg animate-smooth">
              <p className="text-sm text-accent-foreground mb-2">{suggestion.message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={suggestion.action}
                className="text-xs bg-background hover:bg-accent/10 border-accent/30"
              >
                Apply Fix
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button 
        className="w-full gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-3 animate-smooth shadow-glow"
        disabled={allTargetsMet || isOptimizing}
        onClick={onAutoOptimize}
      >
        {isOptimizing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            Optimizing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Auto-Optimize Recipe
          </>
        )}
      </Button>

      <div className="mt-6 p-4 gradient-card border border-border rounded-lg">
        <Label className="text-xs font-semibold text-card-foreground mb-3 block">Development Status</Label>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">R&D Cycle:</span>
            <span className="font-semibold text-card-foreground">~2 weeks → 1 day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence:</span>
            <span className="font-semibold text-success">85%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-semibold text-card-foreground">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOptimization;
