import { pipeline } from '@huggingface/transformers';
import { databaseService, TrainingData } from './databaseService';

interface RecipeMetrics {
  totalWeight: number;
  sugarPercentage: number;
  fatPercentage: number;
  proteinPercentage: number;
  sweetness: number;
  complexity: number;
}

interface PredictionResult {
  success: number;
  sweetness: number;
  texture: number;
  overallRating: number;
  marketAppeal: number;
  confidence: number;
}

interface OptimizationSuggestion {
  ingredient: string;
  currentAmount: number;
  suggestedAmount: number;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

interface TrendAnalysis {
  trendingFlavors: string[];
  emergingIngredients: string[];
  marketGaps: string[];
  seasonalOpportunities: string[];
  confidence: number;
}

interface RecipeValidation {
  isValid: boolean;
  violations: string[];
  recommendations: string[];
  score: number;
}

class MLService {
  private model: any = null;
  private isInitialized = false;
  private trainingData: TrainingData[] = [];

  async initialize() {
    try {
      // Initialize the ML pipeline for text generation/analysis
      this.model = await pipeline('text-generation', 'Xenova/gpt2', {
        device: 'webgpu',
        dtype: 'fp32'
      });
      
      // Load training data from database
      this.trainingData = databaseService.getTrainingData();
      this.isInitialized = true;
      
      console.log('ML Service initialized successfully');
    } catch (error) {
      console.warn('ML Service initialization failed, using fallback:', error);
      this.isInitialized = false;
    }
  }

  async predictRecipeSuccess(recipe: { [key: string]: number }): Promise<PredictionResult> {
    try {
      const metrics = this.calculateRecipeMetrics(recipe);
      
      // Enhanced prediction logic with more sophisticated calculations
      const balanceScore = this.calculateBalanceScore(metrics);
      const complexityScore = this.calculateComplexityScore(recipe);
      const marketScore = this.calculateMarketScore(recipe);
      
      return {
        success: Math.min(95, Math.max(5, balanceScore * 0.4 + complexityScore * 0.3 + marketScore * 0.3)),
        sweetness: metrics.sweetness,
        texture: this.calculateTextureScore(metrics),
        overallRating: (balanceScore + complexityScore + marketScore) / 3,
        marketAppeal: marketScore,
        confidence: this.isInitialized ? 85 : 70
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return this.getFallbackPrediction(recipe);
    }
  }

  private calculateRecipeMetrics(recipe: { [key: string]: number }) {
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + Number(amount || 0), 0);
    
    // Calculate nutritional metrics
    const sugarWeight = Number(recipe['Sugar'] || 0) + Number(recipe['Honey'] || 0) + Number(recipe['Maple Syrup'] || 0);
    const fatWeight = Number(recipe['Heavy Cream'] || 0) * 0.35 + Number(recipe['Whole Milk'] || 0) * 0.035;
    const proteinWeight = Number(recipe['Whole Milk'] || 0) * 0.034 + Number(recipe['Egg Yolks'] || 0) * 0.16;
    
    return {
      totalWeight,
      sugarPercentage: (sugarWeight / totalWeight) * 100,
      fatPercentage: (fatWeight / totalWeight) * 100,
      proteinPercentage: (proteinWeight / totalWeight) * 100,
      sweetness: (sugarWeight / totalWeight) * 100,
      complexity: Object.keys(recipe).length
    };
  }

  private calculateBalanceScore(metrics: any): number {
    let score = 100;
    
    // Optimal ranges for ice cream
    if (metrics.sugarPercentage < 14 || metrics.sugarPercentage > 22) score -= 20;
    if (metrics.fatPercentage < 10 || metrics.fatPercentage > 20) score -= 15;
    if (metrics.proteinPercentage < 3 || metrics.proteinPercentage > 6) score -= 10;
    
    return Math.max(0, score);
  }

  private calculateComplexityScore(recipe: { [key: string]: number }): number {
    const ingredientCount = Object.keys(recipe).length;
    const baseScore = 70;
    
    // Optimal complexity is 5-8 ingredients
    if (ingredientCount >= 5 && ingredientCount <= 8) return baseScore + 20;
    if (ingredientCount < 5) return baseScore - (5 - ingredientCount) * 5;
    if (ingredientCount > 8) return baseScore - (ingredientCount - 8) * 3;
    
    return baseScore;
  }

  private calculateMarketScore(recipe: { [key: string]: number }): number {
    let score = 70;
    
    // Trending ingredients boost
    const trendingIngredients = ['Vanilla Extract', 'Honey', 'Coconut', 'Matcha', 'Lavender'];
    const hasTrending = Object.keys(recipe).some(ingredient => 
      trendingIngredients.some(trending => ingredient.toLowerCase().includes(trending.toLowerCase()))
    );
    
    if (hasTrending) score += 15;
    
    // Premium ingredients
    const premiumIngredients = ['Heavy Cream', 'Egg Yolks', 'Vanilla Extract'];
    const premiumCount = Object.keys(recipe).filter(ingredient =>
      premiumIngredients.some(premium => ingredient.toLowerCase().includes(premium.toLowerCase()))
    ).length;
    
    score += premiumCount * 5;
    
    return Math.min(100, score);
  }

  private calculateTextureScore(metrics: any): number {
    const fatRatio = metrics.fatPercentage / 15; // Optimal around 15%
    const sugarRatio = metrics.sugarPercentage / 18; // Optimal around 18%
    
    return Math.min(100, (fatRatio + sugarRatio) * 50);
  }

  async optimizeRecipe(recipe: { [key: string]: number }): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    const metrics = this.calculateRecipeMetrics(recipe);
    
    // Sugar optimization
    if (metrics.sugarPercentage < 14) {
      const currentSugar = Number(recipe['Sugar'] || 0);
      const suggestedIncrease = (14 - metrics.sugarPercentage) * metrics.totalWeight / 100;
      suggestions.push({
        ingredient: 'Sugar',
        currentAmount: currentSugar,
        suggestedAmount: currentSugar + suggestedIncrease,
        reason: 'Increase sweetness for better balance',
        impact: 'high'
      });
    }
    
    if (metrics.sugarPercentage > 22) {
      const currentSugar = Number(recipe['Sugar'] || 0);
      const suggestedDecrease = (metrics.sugarPercentage - 22) * metrics.totalWeight / 100;
      suggestions.push({
        ingredient: 'Sugar',
        currentAmount: currentSugar,
        suggestedAmount: Math.max(0, currentSugar - suggestedDecrease),
        reason: 'Reduce sweetness for better balance',
        impact: 'high'
      });
    }
    
    // Fat optimization
    if (metrics.fatPercentage < 10) {
      const currentCream = Number(recipe['Heavy Cream'] || 0);
      const suggestedIncrease = (10 - metrics.fatPercentage) * metrics.totalWeight / 35; // 35% fat in cream
      suggestions.push({
        ingredient: 'Heavy Cream',
        currentAmount: currentCream,
        suggestedAmount: currentCream + suggestedIncrease,
        reason: 'Increase creaminess and richness',
        impact: 'medium'
      });
    }
    
    return suggestions;
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    // Simulate trend analysis based on stored recipes and market data
    const recipes = databaseService.getRecipes();
    const ingredientFrequency = new Map<string, number>();
    
    // Analyze ingredient frequency across recipes
    recipes.forEach(recipe => {
      Object.keys(recipe.ingredients).forEach(ingredient => {
        ingredientFrequency.set(ingredient, (ingredientFrequency.get(ingredient) || 0) + 1);
      });
    });
    
    // Sort by frequency to identify trends
    const sortedIngredients = Array.from(ingredientFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([ingredient]) => ingredient);
    
    return {
      trendingFlavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Pistachio', 'Salted Caramel'],
      emergingIngredients: sortedIngredients.slice(0, 5),
      marketGaps: ['Sugar-free options', 'Protein-enriched', 'Exotic fruits', 'Floral essences'],
      seasonalOpportunities: this.getSeasonalOpportunities(),
      confidence: this.isInitialized ? 80 : 60
    };
  }

  private getSeasonalOpportunities(): string[] {
    const month = new Date().getMonth();
    const seasonalMap = {
      'winter': ['Cinnamon', 'Nutmeg', 'Peppermint', 'Hot chocolate'],
      'spring': ['Strawberry', 'Lemon', 'Lavender', 'Rose'],
      'summer': ['Mango', 'Coconut', 'Mint', 'Watermelon'],
      'fall': ['Pumpkin spice', 'Apple', 'Caramel', 'Maple']
    };
    
    if (month >= 2 && month <= 4) return seasonalMap.spring;
    if (month >= 5 && month <= 7) return seasonalMap.summer;
    if (month >= 8 && month <= 10) return seasonalMap.fall;
    return seasonalMap.winter;
  }

  validateRecipe(recipe: { [key: string]: number }): RecipeValidation {
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + Number(amount || 0), 0);
    const sugarWeight = Number(recipe['Sugar'] || 0);
    const fatWeight = Number(recipe['Heavy Cream'] || 0) * 0.35 + Number(recipe['Whole Milk'] || 0) * 0.035;
    
    const sugarPercentage = (sugarWeight / totalWeight) * 100;
    const fatPercentage = (fatWeight / totalWeight) * 100;
    
    // Validate sugar content
    if (sugarPercentage < 14) {
      violations.push('Sugar content too low (< 14%)');
      recommendations.push('Increase sugar content for proper texture and preservation');
    }
    if (sugarPercentage > 22) {
      violations.push('Sugar content too high (> 22%)');
      recommendations.push('Reduce sugar to prevent over-sweetening and crystallization');
    }
    
    // Validate fat content
    if (fatPercentage < 10) {
      violations.push('Fat content too low (< 10%)');
      recommendations.push('Increase cream content for better mouthfeel');
    }
    if (fatPercentage > 20) {
      violations.push('Fat content too high (> 20%)');
      recommendations.push('Reduce fat to prevent texture issues');
    }
    
    // Additional validations
    if (totalWeight < 500) {
      violations.push('Recipe too small for proper texture development');
      recommendations.push('Scale up recipe to at least 500g total weight');
    }
    
    if (Object.keys(recipe).length < 4) {
      violations.push('Too few ingredients for complex flavor profile');
      recommendations.push('Add more ingredients for depth and complexity');
    }
    
    // Calculate score
    const score = Math.max(0, 100 - violations.length * 15);
    
    return {
      isValid: violations.length === 0,
      violations,
      recommendations,
      score
    };
  }

  generateRecommendations(recipe: { [key: string]: number }): string[] {
    const recommendations: string[] = [];
    const metrics = this.calculateRecipeMetrics(recipe);
    
    // Flavor enhancement recommendations
    if (!recipe['Vanilla Extract'] && !recipe['Vanilla Bean']) {
      recommendations.push('Add vanilla extract for enhanced flavor depth');
    }
    
    if (metrics.sugarPercentage > 20) {
      recommendations.push('Balance excessive sweetness with a pinch of salt or cardamom');
    }
    
    const stabilizerValue = Number(recipe['Stabilizer'] || 0);
    const totalWeight = Object.values(recipe).reduce((sum: number, val) => sum + Number(val || 0), 0);
    if (stabilizerValue === 0 && totalWeight > 1000) {
      recommendations.push('Add stabilizer for larger batches to maintain consistency');
    }
    
    if (!recipe['Salt'] && metrics.sugarPercentage > 18) {
      recommendations.push('Add a small amount of salt to enhance sweetness perception');
    }
    
    return recommendations;
  }

  identifyRisks(recipe: { [key: string]: number }): string[] {
    const risks: string[] = [];
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + Number(amount || 0), 0);
    
    const sugarValue = Number(recipe['Sugar'] || 0);
    const fatValue = Number(recipe['Heavy Cream'] || 0) * 0.35 + Number(recipe['Whole Milk'] || 0) * 0.035;
    const sweetnessValue = (sugarValue / totalWeight) * 100;
    const totalSolidsValue = ((sugarValue + fatValue) / totalWeight) * 100;
    
    if (fatValue > 20) risks.push('High fat content may cause texture issues');
    if (totalSolidsValue > 45) risks.push('Excessive solids may lead to crystallization');
    if (sweetnessValue > 20) risks.push('Over-sweetening may mask other flavors');
    
    const stabilizerValue = Number(recipe['Stabilizer'] || 0);
    if (stabilizerValue === 0 && totalSolidsValue > 40) {
      risks.push('No stabilizer with high solids increases ice crystal risk');
    }
    
    const totalWeightValue = Object.values(recipe).reduce((sum: number, val) => sum + Number(val || 0), 0);
    if (totalWeightValue < 500) risks.push('Small batch size may affect texture development');
    if (totalWeightValue > 3000) risks.push('Large batch may require industrial equipment');
    
    return risks;
  }

  private getFallbackPrediction(recipe: { [key: string]: number }): PredictionResult {
    const metrics = this.calculateRecipeMetrics(recipe);
    
    return {
      success: 75,
      sweetness: metrics.sweetness,
      texture: 70,
      overallRating: 72,
      marketAppeal: 68,
      confidence: 60
    };
  }
}

export const mlService = new MLService();
