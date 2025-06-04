export interface IngredientData {
  id: string;
  name: string;
  category: string;
  pac: number;
  pod: number;
  afp: number;
  fat: number;
  msnf: number;
  cost: number;
  confidence: 'high' | 'medium' | 'low';
  embeddings?: number[];
  flavorNotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingData {
  id: string;
  recipe: { [key: string]: number };
  metrics: any;
  successScore: number;
  actualOutcome?: number;
  feedback?: string;
  timestamp: Date;
}

export interface RecipeHistory {
  id: string;
  name: string;
  ingredients: { [key: string]: number };
  metrics: any;
  predictions: any;
  actualResults?: any;
  userRating?: number;
  notes?: string;
  createdAt: Date;
}

class DatabaseService {
  private ingredients: IngredientData[] = [];
  private trainingData: TrainingData[] = [];
  private recipeHistory: RecipeHistory[] = [];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Load from localStorage if available
    const storedIngredients = localStorage.getItem('meetha_ingredients');
    const storedTraining = localStorage.getItem('meetha_training_data');
    const storedHistory = localStorage.getItem('meetha_recipe_history');

    if (storedIngredients) {
      this.ingredients = JSON.parse(storedIngredients);
    } else {
      this.initializeDefaultIngredients();
    }

    if (storedTraining) {
      this.trainingData = JSON.parse(storedTraining);
    }

    if (storedHistory) {
      this.recipeHistory = JSON.parse(storedHistory);
    }
  }

  private initializeDefaultIngredients() {
    this.ingredients = [
      {
        id: '1',
        name: 'Heavy Cream',
        category: 'dairy',
        pac: 2.8,
        pod: 0.2,
        afp: 0.1,
        fat: 35,
        msnf: 5.5,
        cost: 4.5,
        confidence: 'high',
        flavorNotes: ['rich', 'creamy', 'neutral'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Whole Milk',
        category: 'dairy',
        pac: 2.7,
        pod: 0.3,
        afp: 0.05,
        fat: 3.5,
        msnf: 8.5,
        cost: 2.2,
        confidence: 'high',
        flavorNotes: ['mild', 'creamy', 'sweet'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Sugar',
        category: 'sweetener',
        pac: 0,
        pod: 0,
        afp: 0,
        fat: 0,
        msnf: 0,
        cost: 3.0,
        confidence: 'high',
        flavorNotes: ['sweet', 'neutral'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Egg Yolks',
        category: 'protein',
        pac: 15.7,
        pod: 0.8,
        afp: 0.3,
        fat: 31.9,
        msnf: 1.1,
        cost: 8.0,
        confidence: 'medium',
        flavorNotes: ['rich', 'custardy', 'smooth'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Stabilizer',
        category: 'additive',
        pac: 0,
        pod: 85,
        afp: 2.5,
        fat: 0,
        msnf: 0,
        cost: 12.0,
        confidence: 'medium',
        flavorNotes: ['neutral'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Vanilla Extract',
        category: 'flavoring',
        pac: 0,
        pod: 0,
        afp: 0,
        fat: 0,
        msnf: 0,
        cost: 25.0,
        confidence: 'high',
        flavorNotes: ['vanilla', 'sweet', 'aromatic'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '7',
        name: 'Cocoa Powder',
        category: 'flavoring',
        pac: 19.6,
        pod: 1.2,
        afp: 0.2,
        fat: 10.8,
        msnf: 3.4,
        cost: 15.0,
        confidence: 'medium',
        flavorNotes: ['chocolate', 'bitter', 'rich'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.saveIngredients();
  }

  // Ingredient Management
  addIngredient(ingredient: Omit<IngredientData, 'id' | 'createdAt' | 'updatedAt'>): IngredientData {
    const newIngredient: IngredientData = {
      ...ingredient,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.ingredients.push(newIngredient);
    this.saveIngredients();
    return newIngredient;
  }

  updateIngredient(id: string, updates: Partial<IngredientData>): IngredientData | null {
    const index = this.ingredients.findIndex(ing => ing.id === id);
    if (index === -1) return null;

    this.ingredients[index] = {
      ...this.ingredients[index],
      ...updates,
      updatedAt: new Date()
    };
    this.saveIngredients();
    return this.ingredients[index];
  }

  getIngredients(): IngredientData[] {
    return [...this.ingredients];
  }

  getIngredientByName(name: string): IngredientData | null {
    return this.ingredients.find(ing => ing.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Training Data Management
  addTrainingData(data: Omit<TrainingData, 'id' | 'timestamp'>): void {
    const trainingEntry: TrainingData = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    this.trainingData.push(trainingEntry);
    this.saveTrainingData();
  }

  getTrainingData(): TrainingData[] {
    return [...this.trainingData];
  }

  updateTrainingDataWithOutcome(id: string, actualOutcome: number, feedback?: string): void {
    const index = this.trainingData.findIndex(data => data.id === id);
    if (index !== -1) {
      this.trainingData[index].actualOutcome = actualOutcome;
      this.trainingData[index].feedback = feedback;
      this.saveTrainingData();
    }
  }

  // Recipe History Management
  saveRecipe(recipe: Omit<RecipeHistory, 'id' | 'createdAt'>): RecipeHistory {
    const recipeEntry: RecipeHistory = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.recipeHistory.push(recipeEntry);
    this.saveRecipeHistory();
    return recipeEntry;
  }

  getRecipeHistory(): RecipeHistory[] {
    return [...this.recipeHistory];
  }

  updateRecipeRating(id: string, rating: number, notes?: string): void {
    const index = this.recipeHistory.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      this.recipeHistory[index].userRating = rating;
      this.recipeHistory[index].notes = notes;
      this.saveRecipeHistory();
    }
  }

  getRecipes() {
    const stored = localStorage.getItem('recipes');
    return stored ? JSON.parse(stored) : [];
  }

  // Data Export/Import
  exportData(): { ingredients: IngredientData[], trainingData: TrainingData[], recipeHistory: RecipeHistory[] } {
    return {
      ingredients: this.ingredients,
      trainingData: this.trainingData,
      recipeHistory: this.recipeHistory
    };
  }

  importData(data: { ingredients?: IngredientData[], trainingData?: TrainingData[], recipeHistory?: RecipeHistory[] }): void {
    if (data.ingredients) {
      this.ingredients = data.ingredients;
      this.saveIngredients();
    }
    if (data.trainingData) {
      this.trainingData = data.trainingData;
      this.saveTrainingData();
    }
    if (data.recipeHistory) {
      this.recipeHistory = data.recipeHistory;
      this.saveRecipeHistory();
    }
  }

  // Storage methods
  private saveIngredients(): void {
    localStorage.setItem('meetha_ingredients', JSON.stringify(this.ingredients));
  }

  private saveTrainingData(): void {
    localStorage.setItem('meetha_training_data', JSON.stringify(this.trainingData));
  }

  private saveRecipeHistory(): void {
    localStorage.setItem('meetha_recipe_history', JSON.stringify(this.recipeHistory));
  }

  // Analytics
  getPerformanceMetrics(): {
    totalRecipes: number;
    avgSuccessScore: number;
    mostUsedIngredients: { name: string; count: number }[];
    trainingDataSize: number;
  } {
    const totalRecipes = this.recipeHistory.length;
    const avgRating = this.recipeHistory
      .filter(r => r.userRating)
      .reduce((sum, r) => sum + (r.userRating || 0), 0) / 
      this.recipeHistory.filter(r => r.userRating).length || 0;

    const ingredientCounts: { [key: string]: number } = {};
    this.recipeHistory.forEach(recipe => {
      Object.keys(recipe.ingredients).forEach(ingredient => {
        ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
      });
    });

    const mostUsedIngredients = Object.entries(ingredientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRecipes,
      avgSuccessScore: avgRating,
      mostUsedIngredients,
      trainingDataSize: this.trainingData.length
    };
  }
}

export const databaseService = new DatabaseService();
