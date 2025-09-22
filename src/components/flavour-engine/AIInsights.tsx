
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mlService, MLPrediction, FlavorProfile } from '@/services/mlService';

interface AIInsightsProps {
  recipe: { [key: string]: number };
  metrics: any;
}

const AIInsights = ({ recipe, metrics }: AIInsightsProps) => {
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile | null>(null);

  useEffect(() => {
    const analyzeRecipe = async () => {
      if (Object.keys(recipe).length === 0) return;
      
      setIsLoading(true);
      try {
        const result = await mlService.predictRecipeSuccess(recipe);
        setPrediction(result);
        setFlavorProfile(result.flavorProfile);
      } catch (error) {
        console.error('Error analyzing recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeRecipe();
  }, [recipe, metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'from-green-50 to-emerald-50';
    if (score >= 0.6) return 'from-yellow-50 to-amber-50';
    return 'from-red-50 to-rose-50';
  };

  if (isLoading) {
    return (
      <Card className="w-full gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Analyzing recipe with ML models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction || !flavorProfile) {
    return (
      <Card className="w-full gradient-card border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">Add ingredients to get AI predictions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full gradient-card border-primary/20 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Score */}
        <div className={`p-4 rounded-lg bg-gradient-to-r ${getScoreBg(prediction.successScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recipe Success Score
            </span>
            <Badge variant="secondary" className={getScoreColor(prediction.successScore)}>
              {(prediction.successScore * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress value={prediction.successScore * 100} className="h-2" />
        </div>

        {/* Flavor Profile */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            ML Flavor Profile Analysis
          </h4>
          
          {Object.entries(flavorProfile).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize text-gray-600">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-2">
                <Progress value={value * 100} className="w-20 h-2" />
                <span className="text-xs font-medium w-10">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        {prediction.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              ML Recommendations
            </h4>
            {prediction.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-info-light rounded-lg border-l-4 border-info animate-smooth">
                <p className="text-sm text-info-foreground">{rec}</p>
              </div>
            ))}
          </div>
        )}

        {/* Similar Recipes */}
        {prediction.similarRecipes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Similar Recipes</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.similarRecipes.map((recipe, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {recipe}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
