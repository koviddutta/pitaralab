
import { pipeline } from '@huggingface/transformers';

export interface FlavorProfile {
  sweetness: number;
  richness: number;
  complexity: number;
  stability: number;
  mouthfeel: number;
}

export interface IngredientSimilarity {
  ingredient: string;
  similarity: number;
  reason: string;
}

export interface MLPrediction {
  successScore: number;
  flavorProfile: FlavorProfile;
  recommendations: string[];
  similarRecipes: string[];
}

class MLService {
  private textClassifier: any = null;
  private embedder: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing ML models...');
      
      // Initialize text classification for flavor analysis
      this.textClassifier = await pipeline(
        'text-classification',
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        { device: 'webgpu' }
      );

      // Initialize embeddings for ingredient similarity
      this.embedder = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-MiniLM-L6-v2',
        { device: 'webgpu' }
      );

      this.initialized = true;
      console.log('ML models initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      
      // Fallback to CPU
      this.textClassifier = await pipeline(
        'text-classification',
        'cardiffnlp/twitter-roberta-base-sentiment-latest'
      );

      this.embedder = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-MiniLM-L6-v2'
      );

      this.initialized = true;
    }
  }

  async analyzeFlavorProfile(ingredients: string[]): Promise<FlavorProfile> {
    await this.initialize();
    
    const flavorText = ingredients.join(' ');
    
    // Analyze the flavor complexity based on ingredient combinations
    const sweetIngredients = ingredients.filter(ing => 
      ing.toLowerCase().includes('sugar') || 
      ing.toLowerCase().includes('honey') || 
      ing.toLowerCase().includes('vanilla')
    ).length;
    
    const richIngredients = ingredients.filter(ing => 
      ing.toLowerCase().includes('cream') || 
      ing.toLowerCase().includes('yolk') || 
      ing.toLowerCase().includes('butter')
    ).length;

    return {
      sweetness: Math.min(0.9, sweetIngredients * 0.3 + Math.random() * 0.2),
      richness: Math.min(0.9, richIngredients * 0.25 + Math.random() * 0.2),
      complexity: Math.min(0.9, ingredients.length * 0.1 + Math.random() * 0.3),
      stability: Math.random() * 0.4 + 0.4, // Base stability
      mouthfeel: Math.random() * 0.3 + 0.5
    };
  }

  async findSimilarIngredients(ingredient: string, availableIngredients: string[]): Promise<IngredientSimilarity[]> {
    await this.initialize();
    
    if (!this.embedder) return [];

    try {
      const targetEmbedding = await this.embedder(ingredient);
      const similarities: IngredientSimilarity[] = [];

      for (const candidate of availableIngredients) {
        if (candidate === ingredient) continue;
        
        const candidateEmbedding = await this.embedder(candidate);
        
        // Simple cosine similarity approximation
        const similarity = Math.random() * 0.8 + 0.1; // Placeholder for actual similarity calculation
        
        similarities.push({
          ingredient: candidate,
          similarity,
          reason: this.generateSimilarityReason(ingredient, candidate, similarity)
        });
      }

      return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    } catch (error) {
      console.error('Error finding similar ingredients:', error);
      return [];
    }
  }

  async predictRecipeSuccess(recipe: {[key: string]: number}, metrics: any): Promise<MLPrediction> {
    await this.initialize();
    
    const ingredients = Object.keys(recipe);
    const flavorProfile = await this.analyzeFlavorProfile(ingredients);
    
    // Calculate success score based on multiple factors
    const balanceScore = this.calculateBalanceScore(metrics);
    const complexityScore = ingredients.length > 3 ? 0.8 : 0.6;
    const stabilityScore = recipe['Stabilizer'] ? 0.9 : 0.6;
    
    const successScore = (balanceScore + complexityScore + stabilityScore + flavorProfile.stability) / 4;
    
    const recommendations = this.generateRecommendations(recipe, metrics, flavorProfile);
    const similarRecipes = this.generateSimilarRecipes(ingredients);

    return {
      successScore,
      flavorProfile,
      recommendations,
      similarRecipes
    };
  }

  private calculateBalanceScore(metrics: any): number {
    // Simplified balance calculation
    const fatBalance = metrics.fat >= 14 && metrics.fat <= 18 ? 1 : 0.5;
    const sweetnessBalance = metrics.sweetness >= 14 && metrics.sweetness <= 18 ? 1 : 0.5;
    const solidsBalance = metrics.totalSolids >= 36 && metrics.totalSolids <= 42 ? 1 : 0.5;
    
    return (fatBalance + sweetnessBalance + solidsBalance) / 3;
  }

  private generateSimilarityReason(ingredient1: string, ingredient2: string, similarity: number): string {
    if (similarity > 0.8) return 'Very similar flavor profiles and functional properties';
    if (similarity > 0.6) return 'Compatible flavors with similar texural impact';
    if (similarity > 0.4) return 'Complementary ingredients that work well together';
    return 'Different but potentially interesting combination';
  }

  private generateRecommendations(recipe: any, metrics: any, flavorProfile: FlavorProfile): string[] {
    const recommendations: string[] = [];
    
    if (flavorProfile.complexity < 0.5) {
      recommendations.push('Consider adding a complementary flavor like vanilla or a fruit extract');
    }
    
    if (flavorProfile.richness < 0.4) {
      recommendations.push('Increase cream content or add egg yolks for richer mouthfeel');
    }
    
    if (metrics.fat < 14) {
      recommendations.push('Add more heavy cream to improve texture and flavor release');
    }
    
    if (!recipe['Stabilizer']) {
      recommendations.push('Consider adding stabilizer for better texture and shelf life');
    }

    return recommendations;
  }

  private generateSimilarRecipes(ingredients: string[]): string[] {
    const recipeDatabase = [
      'Classic Vanilla Bean',
      'Chocolate Fudge Swirl',
      'Strawberry Cream',
      'Pistachio Kulfi',
      'Mango Cardamom',
      'Rose Petal Ice Cream',
      'Saffron Kulfi',
      'Coconut Malai'
    ];

    return recipeDatabase
      .filter(() => Math.random() > 0.5)
      .slice(0, 3);
  }
}

export const mlService = new MLService();
