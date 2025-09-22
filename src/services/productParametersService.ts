
import { ParameterSet, EffectiveParameters } from '@/types/parameters';
import { loadProfileState, asEffective } from '@/lib/params';

export interface SugarData {
  name: string;
  dryResidual: number;
  spOnDryResidue: number;
  afpOnDryResidue: number;
  spOnTotal: number;
  afpOnTotal: number;
}

export interface FlavoringData {
  type: string;
  characterizationRange: [number, number];
  finalSugarsRange: [number, number];
  afpSugarsRange: [number, number];
}

export interface ProductParameters {
  sugar: [number, number];
  fats: [number, number];
  msnf: [number, number];
  otherSolids: [number, number];
  totalSolids: [number, number];
  sp: [number, number];
  afpSugars: [number, number];
  churningSpeed?: [number, number]; // RPM
  servingTemp?: [number, number]; // Celsius
  overrun?: [number, number]; // Percentage
}

export interface SugarSpectrum {
  disaccharides: [number, number]; // For taste, creaminess, consistency
  monosaccharides: [number, number]; // For softness
  polysaccharides: [number, number]; // For compactness, viscosity
}

export interface SorbetParameters {
  fruitContent: {
    weak: [number, number];
    medium: [number, number];
    strong: [number, number];
  };
  sugarContent: [number, number];
  stabilizer: {
    pulp: [number, number];
    juice: [number, number];
  };
  lemonJuice: [number, number];
}

// ===== BASE defaults (sugar coeffs & process temps) =====
const BASE: ParameterSet = {
  id: 'base-defaults',
  name: 'Base Defaults',
  version: '1.0.0',
  style: 'artisan',
  bands: {},
  sugar: {
    sucrose: { sp: 1.00, pac: 1.00 },
    dextrose: { sp: 0.74, pac: 1.90 },
    fructose: { sp: 1.73, pac: 1.90 },
    invert: { sp: 1.25, pac: 1.90 },
    lactose: { sp: 0.16, pac: 1.00 },
    glucose_de60: { sp: 0.50, pac: 1.18 },
    honey: { sp: 1.30, pac: 1.46 },
    corn_syrup: { sp: 0.33, pac: 1.90 },
    maltodextrin: { sp: 0.20, pac: 0.30 },
  },
  process: {
    entryTempC: [1, 4],
    drawTempC: [-7, -5],
    serveTempC: [-13, -11],
    storeTempC: [-20, -18],
  },
  notes: ['Merge base; do not edit.']
};

// ===== your original MP-Artisan profile (kept intact) =====
export const MP_ARTISAN_V2024: ParameterSet = {
  id: 'mp-artisan-v2024',
  name: 'MP-Artisan',
  version: '2024.08',
  style: 'artisan',
  bands: {
    ice_cream:      { ts:[37,46], fat:[10,20], sugar:[16,22], msnf:[7,12],  sp:[12,22], pac:[22,28] },
    gelato_finished:{ ts:[32,40], fat:[6,12],  sugar:[18,24], msnf:[7,12],  sp:[12,22], pac:[22,28] },
    sorbet:         { ts:[22,30], fat:[0,0],   sugar:[26,31], msnf:[0,0],   sp:[20,28], pac:[28,33] },
    gelato_white:   { ts:[32,37], fat:[3,7],   sugar:[16,19], msnf:[7,12],  sp:[12,22], pac:[22,28] },
    fruit_gelato:   { ts:[32,42], fat:[3,10],  sugar:[22,24], msnf:[3,7],   sp:[18,26], pac:[25,29] }
  },
  sugar: {}, // inherit BASE sugar coeffs
  notes: ['Pinned to existing recipes for reproducibility.']
};

// ===== science profile (reference) =====
export const SCIENCE_V2025: ParameterSet = {
  id: 'science-v2025',
  name: 'Science (Goff/Hartel)',
  version: '2025.09',
  style: 'science',
  bands: {
    ice_cream:      { ts:[36,42], fat:[10,20], sugar:[13,17], msnf:[7,12],  sp:[12,22], pac:[22,28], stabilizer:[0.2,0.5] },
    gelato_white:   { ts:[36,43], fat:[4,8],   sugar:[16,22], msnf:[11,12], sp:[12,22], pac:[22,28], stabilizer:[0.3,0.6] },
    gelato_finished:{ ts:[37,46], fat:[7,16],  sugar:[18,22], msnf:[7,12],  sp:[12,22], pac:[22,28], stabilizer:[0.3,0.6] },
    fruit_gelato:   { ts:[32,42], fat:[3,10],  sugar:[22,24], msnf:[3,7],   sp:[18,26], pac:[25,29], stabilizer:[0.2,0.5] },
    sorbet:         { ts:[32,42], fat:[0,0],   sugar:[26,31], msnf:[0,0],   sp:[20,28], pac:[28,33], stabilizer:[0.1,0.4], fruitPct:[35,75] }
  },
  sugar: {},
  process: { ...BASE.process, overrunPct: [20, 50] },
  notes: ['Science-backed checklist; optional.']
};

const PROFILES: Record<string, ParameterSet> = {
  [MP_ARTISAN_V2024.id]: MP_ARTISAN_V2024,
  [SCIENCE_V2025.id]: SCIENCE_V2025
};

export function listProfiles(): ParameterSet[] {
  return Object.values(PROFILES);
}

export function getActiveParameters(): EffectiveParameters {
  const state = loadProfileState();
  const profile = PROFILES[state.activeProfileId] ?? MP_ARTISAN_V2024;
  return asEffective(BASE, profile, state.userOverrides);
}

export type ProductType = 'ice-cream' | 'gelato' | 'sorbet';

export interface SugarData {
  name: string;
  dryResidual: number;
  spOnDryResidue: number;
  afpOnDryResidue: number;
  spOnTotal: number;
  afpOnTotal: number;
}

export interface FlavoringData {
  type: string;
  characterizationRange: [number, number];
  finalSugarsRange: [number, number];
  afpSugarsRange: [number, number];
}

export interface ProductParameters {
  sugar: [number, number];
  fats: [number, number];
  msnf: [number, number];
  otherSolids: [number, number];
  totalSolids: [number, number];
  sp: [number, number];
  afpSugars: [number, number];
  churningSpeed?: [number, number]; // RPM
  servingTemp?: [number, number]; // Celsius
  overrun?: [number, number]; // Percentage
}

export interface SugarSpectrum {
  disaccharides: [number, number]; // For taste, creaminess, consistency
  monosaccharides: [number, number]; // For softness
  polysaccharides: [number, number]; // For compactness, viscosity
}

export interface SorbetParameters {
  fruitContent: {
    weak: [number, number];
    medium: [number, number];
    strong: [number, number];
  };
  sugarContent: [number, number];
  stabilizer: {
    pulp: [number, number];
    juice: [number, number];
  };
  lemonJuice: [number, number];
}

class ProductParametersService {
  // Sugar data from your specifications
  private sugarDatabase: SugarData[] = [
    { name: 'Sucrose', dryResidual: 100, spOnDryResidue: 1, afpOnDryResidue: 1, spOnTotal: 1, afpOnTotal: 1 },
    { name: 'Lactose', dryResidual: 100, spOnDryResidue: 0.16, afpOnDryResidue: 1, spOnTotal: 0.16, afpOnTotal: 1 },
    { name: 'Trehalose', dryResidual: 91, spOnDryResidue: 0.45, afpOnDryResidue: 1, spOnTotal: 0.41, afpOnTotal: 0.91 },
    { name: 'Maple Syrup', dryResidual: 67, spOnDryResidue: 1, afpOnDryResidue: 1, spOnTotal: 0.67, afpOnTotal: 0.67 },
    { name: 'Dextrose Monohydrate', dryResidual: 92, spOnDryResidue: 0.7, afpOnDryResidue: 1.9, spOnTotal: 0.64, afpOnTotal: 1.75 },
    { name: 'Fructose', dryResidual: 100, spOnDryResidue: 1.7, afpOnDryResidue: 1.9, spOnTotal: 1.7, afpOnTotal: 1.9 },
    { name: 'Inverted Sugar', dryResidual: 75, spOnDryResidue: 1.25, afpOnDryResidue: 1.9, spOnTotal: 0.94, afpOnTotal: 1.43 },
    { name: 'Honey', dryResidual: 80, spOnDryResidue: 1.3, afpOnDryResidue: 1.9, spOnTotal: 1.04, afpOnTotal: 1.52 },
    { name: 'Agave Syrup', dryResidual: 76, spOnDryResidue: 1.4, afpOnDryResidue: 1.9, spOnTotal: 1.06, afpOnTotal: 1.44 },
    { name: 'Liquid Glucose Syrup 60-62DE', dryResidual: 80, spOnDryResidue: 0.64, afpOnDryResidue: 1.2, spOnTotal: 0.51, afpOnTotal: 0.96 },
    { name: 'Liquid Glucose Syrup 42-44DE', dryResidual: 80, spOnDryResidue: 0.52, afpOnDryResidue: 0.92, spOnTotal: 0.42, afpOnTotal: 0.74 },
    { name: 'Dry Glucose Syrup 38-40DE', dryResidual: 96, spOnDryResidue: 0.23, afpOnDryResidue: 0.45, spOnTotal: 0.22, afpOnTotal: 0.43 },
    { name: 'Maltodextrin 15-19DE', dryResidual: 95, spOnDryResidue: 0.09, afpOnDryResidue: 0.23, spOnTotal: 0.09, afpOnTotal: 0.22 }
  ];

  // Flavoring analytical compensation data
  private flavoringDatabase: FlavoringData[] = [
    { type: 'Nuts', characterizationRange: [8, 15], finalSugarsRange: [18, 20], afpSugarsRange: [22, 26] },
    { type: 'Dairy products', characterizationRange: [5, 45], finalSugarsRange: [19, 21], afpSugarsRange: [23, 27] },
    { type: 'Sugary pastes', characterizationRange: [2, 10], finalSugarsRange: [20, 22], afpSugarsRange: [24, 28] },
    { type: 'Sugary/fatty pastes', characterizationRange: [5, 15], finalSugarsRange: [19, 21], afpSugarsRange: [23, 27] },
    { type: 'Fruit', characterizationRange: [5, 45], finalSugarsRange: [22, 24], afpSugarsRange: [25, 29] },
    { type: 'Chocolate', characterizationRange: [5, 25], finalSugarsRange: [19, 21], afpSugarsRange: [23, 27] }
  ];

  // Product-specific parameters
  private productParameters: Record<ProductType, ProductParameters> = {
    'ice-cream': {
      sugar: [16, 22],
      fats: [10, 20], // Higher fat content for ice cream
      msnf: [7, 12],
      otherSolids: [0.3, 0.6],
      totalSolids: [37, 46],
      sp: [12, 22],
      afpSugars: [22, 28],
      churningSpeed: [80, 120], // Higher churning speed
      servingTemp: [-12, -10], // Colder serving temperature
      overrun: [80, 120] // Higher overrun percentage
    },
    'gelato': {
      sugar: [18, 24],
      fats: [6, 12], // Lower fat content for gelato
      msnf: [7, 12],
      otherSolids: [0.2, 0.5],
      totalSolids: [32, 42],
      sp: [12, 26], // Wider range for fruit gelatos
      afpSugars: [22, 29],
      churningSpeed: [20, 40], // Slower churning speed
      servingTemp: [-8, -6], // Warmer serving temperature
      overrun: [25, 50] // Lower overrun percentage
    },
    'sorbet': {
      sugar: [22, 28],
      fats: [0, 3],
      msnf: [0, 3],
      otherSolids: [0.2, 0.5],
      totalSolids: [28, 35],
      sp: [20, 28],
      afpSugars: [28, 33],
      churningSpeed: [40, 60],
      servingTemp: [-10, -8],
      overrun: [15, 30]
    }
  };

  // Sugar spectrum recommendations
  private sugarSpectrum: SugarSpectrum = {
    disaccharides: [50, 100], // For taste, creaminess, consistency
    monosaccharides: [0, 25],  // For softness
    polysaccharides: [0, 35]   // For compactness, viscosity
  };

  // Sorbet-specific parameters
  private sorbetParameters: SorbetParameters = {
    fruitContent: {
      weak: [55, 75],
      medium: [35, 55],
      strong: [15, 35]
    },
    sugarContent: [26, 31],
    stabilizer: {
      pulp: [0.3, 0.4],
      juice: [0.1, 0.2]
    },
    lemonJuice: [0, 2]
  };

  getProductParameters(productType: ProductType): ProductParameters {
    return this.productParameters[productType];
  }

  getSugarData(sugarName: string): SugarData | null {
    return this.sugarDatabase.find(sugar => 
      sugar.name.toLowerCase() === sugarName.toLowerCase()
    ) || null;
  }

  getFlavoringData(flavoringType: string): FlavoringData | null {
    return this.flavoringDatabase.find(flavoring => 
      flavoring.type.toLowerCase() === flavoringType.toLowerCase()
    ) || null;
  }

  getSugarSpectrum(): SugarSpectrum {
    return this.sugarSpectrum;
  }

  getSorbetParameters(): SorbetParameters {
    return this.sorbetParameters;
  }

  // Calculate if recipe meets product-specific targets
  validateRecipeForProduct(
    recipe: { [key: string]: number }, 
    productType: ProductType
  ): { 
    isValid: boolean; 
    violations: string[]; 
    recommendations: string[] 
  } {
    const params = this.getProductParameters(productType);
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Calculate recipe metrics
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + amount, 0);
    
    // Calculate percentages
    const sugarWeight = recipe['Sugar'] || 0;
    const sugarPercentage = (sugarWeight / totalWeight) * 100;
    
    const fatWeight = (recipe['Heavy Cream'] || 0) * 0.35 + (recipe['Whole Milk'] || 0) * 0.035;
    const fatPercentage = (fatWeight / totalWeight) * 100;

    // Validate against product parameters
    if (sugarPercentage < params.sugar[0] || sugarPercentage > params.sugar[1]) {
      violations.push(`Sugar content (${sugarPercentage.toFixed(1)}%) outside ${productType} range (${params.sugar[0]}-${params.sugar[1]}%)`);
      if (sugarPercentage < params.sugar[0]) {
        recommendations.push(`Increase sugar content for ${productType} - add ${((params.sugar[0] / 100 * totalWeight) - sugarWeight).toFixed(0)}g`);
      } else {
        recommendations.push(`Reduce sugar content for ${productType} - remove ${(sugarWeight - (params.sugar[1] / 100 * totalWeight)).toFixed(0)}g`);
      }
    }

    if (fatPercentage < params.fats[0] || fatPercentage > params.fats[1]) {
      violations.push(`Fat content (${fatPercentage.toFixed(1)}%) outside ${productType} range (${params.fats[0]}-${params.fats[1]}%)`);
      if (productType === 'gelato' && fatPercentage > params.fats[1]) {
        recommendations.push('Reduce cream content and increase milk for authentic gelato texture');
      } else if (productType === 'ice-cream' && fatPercentage < params.fats[0]) {
        recommendations.push('Increase cream content for proper ice cream richness');
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    };
  }

  // Calculate optimal sugar blend for product type
  calculateOptimalSugarBlend(
    productType: ProductType,
    totalSugarWeight: number,
    desiredTexture: 'soft' | 'balanced' | 'firm' = 'balanced'
  ): { [sugarType: string]: number } {
    const spectrum = this.getSugarSpectrum();
    
    let disaccharideRatio: number;
    let monosaccharideRatio: number;
    let polysaccharideRatio: number;

    switch (desiredTexture) {
      case 'soft':
        disaccharideRatio = 0.6;
        monosaccharideRatio = 0.25;
        polysaccharideRatio = 0.15;
        break;
      case 'firm':
        disaccharideRatio = 0.5;
        monosaccharideRatio = 0.15;
        polysaccharideRatio = 0.35;
        break;
      default: // balanced
        disaccharideRatio = 0.7;
        monosaccharideRatio = 0.2;
        polysaccharideRatio = 0.1;
    }

    return {
      'Sucrose': totalSugarWeight * disaccharideRatio,
      'Dextrose Monohydrate': totalSugarWeight * monosaccharideRatio,
      'Dry Glucose Syrup 38-40DE': totalSugarWeight * polysaccharideRatio
    };
  }

  // Calculate AFP and SP for recipe
  calculateRecipeAfpSp(recipe: { [key: string]: number }): { afp: number; sp: number } {
    const totalWeight = Object.values(recipe).reduce((sum, amount) => sum + amount, 0);
    let totalAfp = 0;
    let totalSp = 0;

    Object.entries(recipe).forEach(([ingredientName, amount]) => {
      const sugarData = this.getSugarData(ingredientName);
      if (sugarData) {
        const weightRatio = amount / totalWeight;
        totalAfp += sugarData.afpOnTotal * weightRatio;
        totalSp += sugarData.spOnTotal * weightRatio;
      }
    });

    return { afp: totalAfp, sp: totalSp };
  }

  // Generate product-specific recommendations
  generateProductRecommendations(
    productType: ProductType,
    currentRecipe: { [key: string]: number }
  ): string[] {
    const recommendations: string[] = [];
    const validation = this.validateRecipeForProduct(currentRecipe, productType);
    
    recommendations.push(...validation.recommendations);

    // Product-specific advice
    switch (productType) {
      case 'ice-cream':
        recommendations.push('Consider aging base for 4-6 hours for optimal texture development');
        recommendations.push('Churn at higher speed (80-120 RPM) for proper overrun');
        recommendations.push('Serve at -12°C to -10°C for best texture and flavor release');
        break;
      case 'gelato':
        recommendations.push('Use slower churning speed (20-40 RPM) to maintain dense texture');
        recommendations.push('Serve at -8°C to -6°C for optimal flavor intensity');
        recommendations.push('Focus on high-quality ingredients as flavors are more pronounced');
        break;
      case 'sorbet':
        recommendations.push('Ensure fruit content matches intensity level');
        recommendations.push('Add stabilizer based on fruit type (pulp vs juice)');
        recommendations.push('Consider lemon juice (0-2%) for flavor balance and color preservation');
        break;
    }

    return recommendations;
  }
}

export const productParametersService = new ProductParametersService();
