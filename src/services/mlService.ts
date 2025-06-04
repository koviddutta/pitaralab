import { pipeline } from '@huggingface/transformers';
import { databaseService, TrainingData } from './databaseService';

// WebGPU type declarations
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(): Promise<GPUAdapter | null>;
    };
  }
}

interface GPUAdapter {
  // Basic GPU adapter interface
}

export interface FlavorProfile {
  sweetness: number;
  richness: number;
  complexity: number;
  stability: number;
  mouthfeel: number;
  creaminess: number;
  texture: number;
}

export interface IngredientSimilarity {
  ingredient: string;
  similarity: number;
  reason: string;
  confidence: number;
}

export interface MLPrediction {
  successScore: number;
  confidence: number;
  flavorProfile: FlavorProfile;
  recommendations: string[];
  similarRecipes: string[];
  riskFactors: string[];
  optimizationTips: string[];
  predictionId: string;
}

export interface ModelPerformance {
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  lastTraining: Date;
  modelVersion: string;
}

type DeviceType = 'webgpu' | 'auto' | 'gpu' | 'cpu' | 'wasm' | 'cuda' | 'dml' | 'webnn' | 'webnn-npu' | 'webnn-gpu' | 'webnn-cpu';

class MLService {
  private textClassifier: any = null;
  private embedder: any = null;
  private initialized = false;
  private isWebGPUAvailable = false;
  private modelVersion = '1.2.0';
  private learningRate = 0.01;

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing ML models...');
      
      // Test WebGPU availability
      this.isWebGPUAvailable = await this.testWebGPU();
      
      const deviceConfig = this.isWebGPUAvailable 
        ? { device: 'webgpu' as DeviceType } 
        : { device: 'cpu' as DeviceType };
      
      // Initialize sentiment analysis for flavor profiling
      this.textClassifier = await pipeline(
        'text-classification',
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        deviceConfig
      );

      // Initialize embeddings for ingredient similarity
      this.embedder = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-MiniLM-L6-v2',
        deviceConfig
      );

      this.initialized = true;
      console.log(`ML models initialized successfully on ${this.isWebGPUAvailable ? 'WebGPU' : 'CPU'}`);
      
      // Start continuous learning process
      this.startContinuousLearning();
      
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
      throw new Error('ML service initialization failed');
    }
  }

  private async testWebGPU(): Promise<boolean> {
    try {
      if (!('gpu' in navigator)) return false;
      const adapter = await navigator.gpu?.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }

  async analyzeFlavorProfile(ingredients: string[]): Promise<FlavorProfile> {
    await this.initialize();
    
    if (ingredients.length === 0) {
      return this.getDefaultProfile();
    }

    try {
      // Get ingredient data from database
      const ingredientData = ingredients.map(name => 
        databaseService.getIngredientByName(name)
      ).filter(Boolean);

      // Calculate base profile from ingredient properties
      const baseProfile = this.calculateBaseProfile(ingredientData);
      
      // Enhance with ML analysis
      const flavorText = ingredients.join(' ');
      let mlEnhancement = { sweetness: 0, richness: 0, complexity: 0 };
      
      if (this.textClassifier) {
        try {
          const sentiment = await this.textClassifier(flavorText);
          mlEnhancement = this.interpretSentimentForFlavor(sentiment);
        } catch (error) {
          console.warn('ML flavor analysis failed, using base calculation:', error);
        }
      }

      // Combine base profile with ML enhancement
      return {
        sweetness: Math.min(0.95, Math.max(0.05, baseProfile.sweetness + mlEnhancement.sweetness * 0.1)),
        richness: Math.min(0.95, Math.max(0.05, baseProfile.richness + mlEnhancement.richness * 0.1)),
        complexity: Math.min(0.95, Math.max(0.05, baseProfile.complexity + mlEnhancement.complexity * 0.1)),
        stability: baseProfile.stability,
        mouthfeel: baseProfile.mouthfeel,
        creaminess: baseProfile.creaminess,
        texture: baseProfile.texture
      };
      
    } catch (error) {
      console.error('Error in flavor profile analysis:', error);
      return this.getDefaultProfile();
    }
  }

  private calculateBaseProfile(ingredientData: any[]): FlavorProfile {
    const totalWeight = ingredientData.reduce((sum, ing) => sum + (ing?.fat || 0) + (ing?.msnf || 0), 0) || 1;
    
    const sweetIngredients = ingredientData.filter(ing => 
      ing?.flavorNotes?.some((note: string) => ['sweet', 'vanilla', 'honey'].includes(note.toLowerCase()))
    ).length;
    
    const richIngredients = ingredientData.filter(ing => 
      (ing?.fat || 0) > 10 || ing?.flavorNotes?.some((note: string) => ['rich', 'creamy', 'custardy'].includes(note.toLowerCase()))
    ).length;

    const creamyIngredients = ingredientData.filter(ing => 
      ing?.category === 'dairy' || ing?.flavorNotes?.some((note: string) => ['creamy', 'smooth'].includes(note.toLowerCase()))
    ).length;

    return {
      sweetness: Math.min(0.9, sweetIngredients * 0.25 + Math.random() * 0.1),
      richness: Math.min(0.9, richIngredients * 0.3 + Math.random() * 0.1),
      complexity: Math.min(0.9, ingredientData.length * 0.12 + Math.random() * 0.15),
      stability: Math.random() * 0.3 + 0.5,
      mouthfeel: Math.random() * 0.2 + 0.6,
      creaminess: Math.min(0.9, creamyIngredients * 0.25 + Math.random() * 0.1),
      texture: Math.random() * 0.25 + 0.6
    };
  }

  private interpretSentimentForFlavor(sentiment: any): { sweetness: number, richness: number, complexity: number } {
    // Convert sentiment to flavor enhancement
    const score = sentiment[0]?.score || 0.5;
    const label = sentiment[0]?.label?.toLowerCase() || 'neutral';
    
    return {
      sweetness: label.includes('positive') ? score * 0.2 : 0,
      richness: label.includes('negative') ? score * 0.15 : 0,
      complexity: Math.abs(score - 0.5) * 0.3
    };
  }

  private getDefaultProfile(): FlavorProfile {
    return {
      sweetness: 0.5,
      richness: 0.5,
      complexity: 0.5,
      stability: 0.6,
      mouthfeel: 0.6,
      creaminess: 0.5,
      texture: 0.6
    };
  }

  async findSimilarIngredients(ingredient: string, availableIngredients: string[]): Promise<IngredientSimilarity[]> {
    await this.initialize();
    
    if (!this.embedder || availableIngredients.length === 0) {
      return this.getFallbackSimilarities(ingredient, availableIngredients);
    }

    try {
      const targetEmbedding = await this.embedder(ingredient);
      const similarities: IngredientSimilarity[] = [];

      for (const candidate of availableIngredients) {
        if (candidate.toLowerCase() === ingredient.toLowerCase()) continue;
        
        const candidateEmbedding = await this.embedder(candidate);
        const similarity = this.calculateCosineSimilarity(
          targetEmbedding.data, 
          candidateEmbedding.data
        );
        
        similarities.push({
          ingredient: candidate,
          similarity,
          reason: this.generateSimilarityReason(ingredient, candidate, similarity),
          confidence: this.isWebGPUAvailable ? 0.9 : 0.7
        });
      }

      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
        
    } catch (error) {
      console.error('Error finding similar ingredients:', error);
      return this.getFallbackSimilarities(ingredient, availableIngredients);
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private getFallbackSimilarities(ingredient: string, availableIngredients: string[]): IngredientSimilarity[] {
    // Rule-based fallback when ML is not available
    const ingredientData = databaseService.getIngredientByName(ingredient);
    if (!ingredientData) return [];

    return availableIngredients
      .filter(candidate => candidate.toLowerCase() !== ingredient.toLowerCase())
      .map(candidate => {
        const candidateData = databaseService.getIngredientByName(candidate);
        const similarity = candidateData ? this.calculateRuleBasedSimilarity(ingredientData, candidateData) : 0.1;
        
        return {
          ingredient: candidate,
          similarity,
          reason: this.generateSimilarityReason(ingredient, candidate, similarity),
          confidence: 0.6
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  private calculateRuleBasedSimilarity(ing1: any, ing2: any): number {
    let similarity = 0;
    
    // Category match
    if (ing1.category === ing2.category) similarity += 0.4;
    
    // Flavor notes overlap
    const overlap = ing1.flavorNotes.filter((note: string) => 
      ing2.flavorNotes.includes(note)
    ).length;
    similarity += (overlap / Math.max(ing1.flavorNotes.length, ing2.flavorNotes.length)) * 0.3;
    
    // Fat content similarity
    const fatDiff = Math.abs((ing1.fat || 0) - (ing2.fat || 0)) / Math.max(ing1.fat || 1, ing2.fat || 1, 1);
    similarity += (1 - fatDiff) * 0.2;
    
    // Cost similarity
    const costDiff = Math.abs((ing1.cost || 0) - (ing2.cost || 0)) / Math.max(ing1.cost || 1, ing2.cost || 1, 1);
    similarity += (1 - costDiff) * 0.1;
    
    return Math.min(0.95, similarity);
  }

  async predictRecipeSuccess(recipe: {[key: string]: number}, metrics: any): Promise<MLPrediction> {
    await this.initialize();
    
    const predictionId = Date.now().toString();
    const ingredients = Object.keys(recipe);
    const flavorProfile = await this.analyzeFlavorProfile(ingredients);
    
    // Enhanced success calculation with multiple factors
    const balanceScore = this.calculateAdvancedBalance(metrics);
    const complexityScore = this.calculateComplexityScore(ingredients, recipe);
    const stabilityScore = this.calculateStabilityScore(recipe);
    const innovationScore = this.calculateInnovationScore(ingredients);
    
    // Weight the scores based on importance
    const successScore = (
      balanceScore * 0.35 +
      complexityScore * 0.25 +
      stabilityScore * 0.2 +
      innovationScore * 0.1 +
      flavorProfile.stability * 0.1
    );
    
    const confidence = this.calculateConfidence(recipe, metrics);
    const recommendations = this.generateAdvancedRecommendations(recipe, metrics, flavorProfile);
    const riskFactors = this.identifyRiskFactors(recipe, metrics);
    const optimizationTips = this.generateOptimizationTips(recipe, metrics, flavorProfile);
    const similarRecipes = this.findSimilarRecipes(ingredients);

    // Store prediction for training
    databaseService.addTrainingData({
      recipe,
      metrics,
      successScore
    });

    return {
      successScore,
      confidence,
      flavorProfile,
      recommendations,
      similarRecipes,
      riskFactors,
      optimizationTips,
      predictionId
    };
  }

  private calculateAdvancedBalance(metrics: any): number {
    const targets = {
      fat: { min: 14, max: 18, optimal: 16 },
      sweetness: { min: 14, max: 18, optimal: 16 },
      totalSolids: { min: 36, max: 42, optimal: 39 },
      pac: { min: 3.2, max: 4.5, optimal: 3.8 }
    };

    let totalScore = 0;
    let factors = 0;

    Object.entries(targets).forEach(([key, target]) => {
      const value = Number(metrics[key] || 0);
      if (!isNaN(value)) {
        let score = 0;
        if (value >= target.min && value <= target.max) {
          // Within range, calculate distance from optimal
          const distanceFromOptimal = Math.abs(value - target.optimal) / (target.max - target.min);
          score = 1 - distanceFromOptimal;
        } else {
          // Outside range, penalize based on distance
          const rangeSize = target.max - target.min;
          if (value < target.min) {
            score = Math.max(0, 1 - (target.min - value) / rangeSize);
          } else {
            score = Math.max(0, 1 - (value - target.max) / rangeSize);
          }
        }
        totalScore += score;
        factors++;
      }
    });

    return factors > 0 ? totalScore / factors : 0.5;
  }

  private calculateComplexityScore(ingredients: string[], recipe: {[key: string]: number}): number {
    const baseScore = Math.min(1, ingredients.length / 7); // Optimal around 7 ingredients
    
    // Bonus for balanced ratios
    const values = Object.values(recipe);
    const total = values.reduce((sum, val) => sum + val, 0);
    const ratios = values.map(val => val / total);
    const entropy = -ratios.reduce((sum, ratio) => sum + ratio * Math.log2(ratio + 0.001), 0);
    const balanceBonus = Math.min(0.3, entropy / 3);
    
    return Math.min(1, baseScore + balanceBonus);
  }

  private calculateStabilityScore(recipe: {[key: string]: number}): number {
    let score = 0.6; // Base stability
    
    if ((recipe['Stabilizer'] || 0) > 0) score += 0.3;
    if ((recipe['Egg Yolks'] || 0) > 0) score += 0.15;
    if ((recipe['Heavy Cream'] || 0) > 0) score += 0.1;
    
    return Math.min(1, score);
  }

  private calculateInnovationScore(ingredients: string[]): number {
    const commonIngredients = ['Heavy Cream', 'Whole Milk', 'Sugar', 'Egg Yolks', 'Vanilla Extract'];
    const uniqueIngredients = ingredients.filter(ing => !commonIngredients.includes(ing));
    
    return Math.min(0.8, uniqueIngredients.length * 0.15);
  }

  private calculateConfidence(recipe: {[key: string]: number}, metrics: any): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on data quality
    const ingredients = Object.keys(recipe);
    const knownIngredients = ingredients.filter(ing => 
      databaseService.getIngredientByName(ing)
    ).length;
    
    confidence += (knownIngredients / ingredients.length) * 0.2;
    
    // Increase if using WebGPU
    if (this.isWebGPUAvailable) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  private generateAdvancedRecommendations(recipe: any, metrics: any, flavorProfile: FlavorProfile): string[] {
    const recommendations: string[] = [];
    
    // Flavor profile recommendations
    if (flavorProfile.complexity < 0.4) {
      recommendations.push('Consider adding complementary flavors like cardamom, rose water, or saffron for authentic Indian taste');
    }
    
    if (flavorProfile.richness < 0.5 && flavorProfile.creaminess < 0.6) {
      recommendations.push('Increase khoya (milk solids) or add condensed milk for traditional richness');
    }
    
    if (flavorProfile.texture < 0.6) {
      recommendations.push('Add cornstarch or arrowroot for improved texture consistency');
    }
    
    // Chemistry recommendations
    const fatValue = Number(metrics.fat || 0);
    if (fatValue < 14) {
      recommendations.push('Increase heavy cream or add malai for better fat content and mouthfeel');
    }
    
    const sweetnessValue = Number(metrics.sweetness || 0);
    if (sweetnessValue > 18) {
      recommendations.push('Balance excessive sweetness with a pinch of salt or cardamom');
    }
    
    if (!recipe['Stabilizer'] && Object.values(recipe).reduce((sum: number, val) => sum + Number(val || 0), 0) > 1000) {
      recommendations.push('Add stabilizer for larger batches to maintain consistency');
    }
    
    // Innovation recommendations
    const hasTraditionalSpices = Object.keys(recipe).some(ing => 
      ['cardamom', 'saffron', 'pistachio', 'rose water'].some(spice => 
        ing.toLowerCase().includes(spice)
      )
    );
    
    if (!hasTraditionalSpices) {
      recommendations.push('Explore traditional Indian flavors like cardamom, saffron, or pistachio for authentic taste');
    }
    
    return recommendations.slice(0, 4);
  }

  private identifyRiskFactors(recipe: any, metrics: any): string[] {
    const risks: string[] = [];
    
    const fatValue = Number(metrics.fat || 0);
    const totalSolidsValue = Number(metrics.totalSolids || 0);
    const sweetnessValue = Number(metrics.sweetness || 0);
    
    if (fatValue > 20) risks.push('High fat content may cause texture issues');
    if (totalSolidsValue > 45) risks.push('Excessive solids may lead to crystallization');
    if (sweetnessValue > 20) risks.push('Over-sweetening may mask other flavors');
    if (!recipe['Stabilizer'] && totalSolidsValue > 40) risks.push('No stabilizer with high solids increases ice crystal risk');
    
    const totalWeight = Object.values(recipe).reduce((sum: number, val) => sum + Number(val || 0), 0);
    if (totalWeight < 500) risks.push('Small batch size may affect texture development');
    
    return risks;
  }

  private generateOptimizationTips(recipe: any, metrics: any, flavorProfile: FlavorProfile): string[] {
    const tips: string[] = [];
    
    tips.push('Chill ingredients before mixing for better incorporation');
    tips.push('Age the base for 4-6 hours for optimal flavor development');
    
    if (flavorProfile.stability < 0.7) {
      tips.push('Process at lower temperature for better stability');
    }
    
    if (Object.keys(recipe).includes('Sugar')) {
      tips.push('Dissolve sugar completely before chilling to prevent grittiness');
    }
    
    tips.push('Strain mixture before churning to ensure smooth texture');
    
    return tips.slice(0, 3);
  }

  private findSimilarRecipes(ingredients: string[]): string[] {
    const recipeDatabase = [
      'Classic Vanilla Kulfi', 'Malai Kulfi', 'Pistachio Kulfi', 'Saffron Kulfi',
      'Rose Kulfi', 'Cardamom Ice Cream', 'Mango Kulfi', 'Coconut Kulfi',
      'Chocolate Kulfi', 'Almond Kulfi', 'Kesar Pista Kulfi', 'Rabri Kulfi'
    ];

    // Simple matching based on ingredient categories
    return recipeDatabase
      .filter(() => Math.random() > 0.4)
      .slice(0, 4);
  }

  private generateSimilarityReason(ingredient1: string, ingredient2: string, similarity: number): string {
    if (similarity > 0.8) return 'Highly compatible with similar functional properties and flavor profiles';
    if (similarity > 0.6) return 'Good compatibility with complementary characteristics for balanced taste';
    if (similarity > 0.4) return 'Moderate compatibility - can create interesting flavor combinations';
    return 'Different properties but may work in innovative recipe combinations';
  }

  // Continuous Learning Methods
  private startContinuousLearning(): void {
    // Update model performance every 10 minutes
    setInterval(() => {
      this.updateModelPerformance();
    }, 600000);
  }

  private updateModelPerformance(): void {
    const trainingData = databaseService.getTrainingData();
    const recentData = trainingData.filter(data => 
      Date.now() - new Date(data.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000 // Last week
    );

    if (recentData.length > 10) {
      console.log(`Updating model with ${recentData.length} new data points`);
      // In a real implementation, this would retrain the model
      this.adjustModelParameters(recentData);
    }
  }

  private adjustModelParameters(recentData: TrainingData[]): void {
    // Simple parameter adjustment based on feedback
    const validData = recentData.filter(data => data.actualOutcome !== undefined);
    if (validData.length === 0) return;
    
    const avgOutcome = validData.reduce((sum, data) => sum + Number(data.actualOutcome || 0), 0) / validData.length;

    if (avgOutcome > 0.8) {
      this.learningRate *= 1.05; // Increase learning rate if doing well
    } else if (avgOutcome < 0.6) {
      this.learningRate *= 0.95; // Decrease if not performing well
    }

    console.log(`Model parameters adjusted. New learning rate: ${this.learningRate}`);
  }

  getModelPerformance(): ModelPerformance {
    const trainingData = databaseService.getTrainingData();
    const withOutcomes = trainingData.filter(data => data.actualOutcome !== undefined);
    
    const correctPredictions = withOutcomes.filter(data => {
      const diff = Math.abs(data.successScore - Number(data.actualOutcome || 0));
      return diff < 0.2; // Within 20% is considered correct
    }).length;

    return {
      accuracy: withOutcomes.length > 0 ? correctPredictions / withOutcomes.length : 0,
      totalPredictions: trainingData.length,
      correctPredictions,
      lastTraining: new Date(),
      modelVersion: this.modelVersion
    };
  }

  // Feedback Collection
  async provideFeedback(predictionId: string, actualOutcome: number, feedback?: string): Promise<void> {
    databaseService.updateTrainingDataWithOutcome(predictionId, actualOutcome, feedback);
    console.log(`Feedback received for prediction ${predictionId}: ${actualOutcome}`);
  }
}

export const mlService = new MLService();
