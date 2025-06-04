
import React, { useState, useEffect } from 'react';
import { Search, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mlService, IngredientSimilarity } from '@/services/mlService';

interface IngredientAnalyzerProps {
  availableIngredients: string[];
  onAddIngredient: (ingredient: string) => void;
}

const IngredientAnalyzer = ({ availableIngredients, onAddIngredient }: IngredientAnalyzerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [similarities, setSimilarities] = useState<IngredientSimilarity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!searchTerm.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const results = await mlService.findSimilarIngredients(searchTerm, availableIngredients);
      setSimilarities(results);
    } catch (error) {
      console.error('Error analyzing ingredient:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 text-green-800';
    if (similarity >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-600" />
          ML Ingredient Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter an ingredient to find alternatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button 
            onClick={handleAnalyze}
            disabled={!searchTerm.trim() || isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {similarities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Similar Ingredients Found
            </h4>
            
            {similarities.map((sim, index) => (
              <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sim.ingredient}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <Badge className={getSimilarityColor(sim.similarity)}>
                      {(sim.similarity * 100).toFixed(0)}% match
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddIngredient(sim.ingredient)}
                    className="text-xs"
                  >
                    Add to Recipe
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{sim.reason}</p>
              </div>
            ))}
          </div>
        )}

        {searchTerm && similarities.length === 0 && !isAnalyzing && (
          <div className="text-center py-4 text-gray-500">
            <p>No similar ingredients found. Try a different search term.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IngredientAnalyzer;
