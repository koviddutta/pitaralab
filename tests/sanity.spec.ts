import { describe, it, expect } from 'vitest';
import { calcMetrics } from '../src/lib/calc';
import { DEFAULT_INGREDIENTS, getIngredientById } from '../src/lib/ingredientLibrary';

describe('Sanity Tests - Prevent Regressions', () => {
  
  describe('White Base (Gelato)', () => {
    it('should calculate correct metrics for a standard white base', () => {
      // Classic Italian white base: milk, cream, sugar, SMP, stabilizer
      const milk = getIngredientById('milk_3')!;
      const cream = getIngredientById('cream_25')!;
      const sucrose = getIngredientById('sucrose')!;
      const smp = getIngredientById('smp')!;
      const stabilizer = getIngredientById('stabilizer')!;
      
      const recipe = [
        { ing: milk, grams: 580 },
        { ing: cream, grams: 200 },
        { ing: sucrose, grams: 170 },
        { ing: smp, grams: 45 },
        { ing: stabilizer, grams: 5 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      // Total mass should be 1000g
      expect(metrics.total_g).toBeCloseTo(1000, 0);
      
      // Total Solids should be in range 32-38%
      expect(metrics.ts_add_pct).toBeGreaterThan(32);
      expect(metrics.ts_add_pct).toBeLessThan(38);
      
      // Fat should be in range 7-10%
      expect(metrics.fat_pct).toBeGreaterThan(7);
      expect(metrics.fat_pct).toBeLessThan(10);
      
      // Sugars should be in range 16-20%
      expect(metrics.sugars_pct).toBeGreaterThan(16);
      expect(metrics.sugars_pct).toBeLessThan(20);
      
      // MSNF should be in range 8-12%
      expect(metrics.msnf_pct).toBeGreaterThan(8);
      expect(metrics.msnf_pct).toBeLessThan(12);
      
      // SP (sucrose=1.00 baseline) should be reasonable (14-22)
      expect(metrics.sp).toBeGreaterThan(14);
      expect(metrics.sp).toBeLessThan(22);
      
      // PAC (aka AFP) should be reasonable (20-30)
      expect(metrics.pac).toBeGreaterThan(20);
      expect(metrics.pac).toBeLessThan(30);
      
      console.log('✓ White base metrics:', {
        TS: metrics.ts_add_pct.toFixed(2) + '%',
        Fat: metrics.fat_pct.toFixed(2) + '%',
        Sugar: metrics.sugars_pct.toFixed(2) + '%',
        MSNF: metrics.msnf_pct.toFixed(2) + '%',
        SP: metrics.sp.toFixed(2),
        PAC: metrics.pac.toFixed(2)
      });
    });
  });
  
  describe('Mango Gelato (with Indian paste)', () => {
    it('should calculate correct metrics for a mango base with alphonso pulp', () => {
      const milk = getIngredientById('milk_3')!;
      const cream = getIngredientById('cream_25')!;
      const sucrose = getIngredientById('sucrose')!;
      const dextrose = getIngredientById('dextrose')!;
      const mango = getIngredientById('mango_alphonso')!;
      const stabilizer = getIngredientById('stabilizer')!;
      
      const recipe = [
        { ing: milk, grams: 450 },
        { ing: cream, grams: 150 },
        { ing: sucrose, grams: 120 },
        { ing: dextrose, grams: 30 },
        { ing: mango, grams: 240 }, // ~24% fruit
        { ing: stabilizer, grams: 4 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      // Total mass
      expect(metrics.total_g).toBeCloseTo(994, 0);
      
      // Total Solids should be in range 28-36% (fruit dilutes)
      expect(metrics.ts_add_pct).toBeGreaterThan(28);
      expect(metrics.ts_add_pct).toBeLessThan(36);
      
      // Fat should be lower due to fruit: 4-8%
      expect(metrics.fat_pct).toBeGreaterThan(4);
      expect(metrics.fat_pct).toBeLessThan(8);
      
      // Total sugars includes fruit sugars: 18-24%
      expect(metrics.sugars_pct).toBeGreaterThan(18);
      expect(metrics.sugars_pct).toBeLessThan(24);
      
      // SP should reflect fruit sugar split (mixed G/F/S)
      expect(metrics.sp).toBeGreaterThan(16);
      expect(metrics.sp).toBeLessThan(25);
      
      // PAC should be higher due to dextrose + fruit glucose/fructose
      expect(metrics.pac).toBeGreaterThan(25);
      expect(metrics.pac).toBeLessThan(35);
      
      // Mango sugar split should be factored in
      // Alphonso has: glucose: 2%, fructose: 4.5%, sucrose: 8.3%
      // This should increase PAC relative to pure sucrose
      
      console.log('✓ Mango gelato metrics:', {
        TS: metrics.ts_add_pct.toFixed(2) + '%',
        Fat: metrics.fat_pct.toFixed(2) + '%',
        Sugar: metrics.sugars_pct.toFixed(2) + '%',
        SP: metrics.sp.toFixed(2),
        PAC: metrics.pac.toFixed(2),
        'Fruit %': ((240 / metrics.total_g) * 100).toFixed(1) + '%'
      });
    });
  });
  
  describe('Sugar Coefficients Integrity', () => {
    it('should maintain correct SP and PAC coefficients (sucrose baseline)', () => {
      const sucrose = getIngredientById('sucrose')!;
      const dextrose = getIngredientById('dextrose')!;
      const fructose = getIngredientById('fructose')!;
      const lactose = getIngredientById('lactose')!;
      
      // Sucrose baseline
      expect(sucrose.sp_coeff).toBe(1.00);
      expect(sucrose.pac_coeff).toBe(100);
      
      // Dextrose (less sweet, higher PAC)
      expect(dextrose.sp_coeff).toBe(0.74);
      expect(dextrose.pac_coeff).toBe(190);
      
      // Fructose (sweeter, higher PAC)
      expect(fructose.sp_coeff).toBe(1.73);
      expect(fructose.pac_coeff).toBe(190);
      
      // Lactose (less sweet, lower PAC)
      expect(lactose.sp_coeff).toBe(0.16);
      expect(lactose.pac_coeff).toBe(62);
    });
    
    it('should correctly apply sugar coefficients in calculations', () => {
      const sucrose = getIngredientById('sucrose')!;
      const dextrose = getIngredientById('dextrose')!;
      const milk = getIngredientById('milk_3')!;
      
      // 100% sucrose recipe
      const sucroseRecipe = [
        { ing: milk, grams: 850 },
        { ing: sucrose, grams: 150 }
      ];
      
      // 100% dextrose recipe (same sugar weight)
      const dextroseRecipe = [
        { ing: milk, grams: 850 },
        { ing: dextrose, grams: 150 }
      ];
      
      const sucroseMetrics = calcMetrics(sucroseRecipe);
      const dextroseMetrics = calcMetrics(dextroseRecipe);
      
      // Dextrose should have lower SP (less sweet)
      expect(dextroseMetrics.sp).toBeLessThan(sucroseMetrics.sp);
      
      // Dextrose should have higher PAC (softer)
      expect(dextroseMetrics.pac).toBeGreaterThan(sucroseMetrics.pac);
      
      console.log('✓ Sugar comparison:', {
        'Sucrose SP': sucroseMetrics.sp.toFixed(2),
        'Dextrose SP': dextroseMetrics.sp.toFixed(2),
        'Sucrose PAC': sucroseMetrics.pac.toFixed(2),
        'Dextrose PAC': dextroseMetrics.pac.toFixed(2)
      });
    });
  });
  
  describe('Fruit Sugar Split Calculations', () => {
    it('should correctly calculate SP/PAC from fruit sugar splits', () => {
      const milk = getIngredientById('milk_3')!;
      const mango = getIngredientById('mango_alphonso')!;
      const strawberry = getIngredientById('strawberry')!;
      
      // Mango has more sucrose in split → lower PAC
      // Strawberry has more glucose/fructose → higher PAC
      
      const mangoRecipe = [
        { ing: milk, grams: 800 },
        { ing: mango, grams: 200 }
      ];
      
      const strawberryRecipe = [
        { ing: milk, grams: 800 },
        { ing: strawberry, grams: 200 }
      ];
      
      const mangoMetrics = calcMetrics(mangoRecipe);
      const strawberryMetrics = calcMetrics(strawberryRecipe);
      
      // Both should have reasonable metrics
      expect(mangoMetrics.pac).toBeGreaterThan(20);
      expect(strawberryMetrics.pac).toBeGreaterThan(20);
      
      // Verify fruit sugars are being counted
      expect(mangoMetrics.sugars_pct).toBeGreaterThan(8);
      expect(strawberryMetrics.sugars_pct).toBeGreaterThan(5);
      
      console.log('✓ Fruit sugar splits working:', {
        'Mango PAC': mangoMetrics.pac.toFixed(2),
        'Strawberry PAC': strawberryMetrics.pac.toFixed(2),
        'Mango Sugar': mangoMetrics.sugars_pct.toFixed(2) + '%',
        'Strawberry Sugar': strawberryMetrics.sugars_pct.toFixed(2) + '%'
      });
    });
  });
});

describe('Edge Case Tests - Extreme Values', () => {
  
  describe('Zero Ingredient Amounts', () => {
    it('should handle recipes with zero amount ingredients', () => {
      const milk = getIngredientById('milk_3')!;
      const sucrose = getIngredientById('sucrose')!;
      
      const recipe = [
        { ing: milk, grams: 1000 },
        { ing: sucrose, grams: 0 } // Zero amount
      ];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.total_g).toBeCloseTo(1000, 0);
      expect(metrics.sugars_pct).toBeLessThan(10); // Only lactose from milk
      expect(isNaN(metrics.sp)).toBe(false);
      expect(isNaN(metrics.pac)).toBe(false);
    });
  });
  
  describe('Single Ingredient Recipes', () => {
    it('should handle single ingredient recipe (milk only)', () => {
      const milk = getIngredientById('milk_3')!;
      const recipe = [{ ing: milk, grams: 1000 }];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.total_g).toBeCloseTo(1000, 0);
      expect(metrics.water_pct).toBeGreaterThan(80);
      expect(metrics.fat_pct).toBeCloseTo(3, 0.5);
      expect(isNaN(metrics.sp)).toBe(false);
      expect(isNaN(metrics.pac)).toBe(false);
    });
    
    it('should handle single ingredient recipe (sugar only)', () => {
      const sucrose = getIngredientById('sucrose')!;
      const recipe = [{ ing: sucrose, grams: 100 }];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.total_g).toBeCloseTo(100, 0);
      expect(metrics.water_pct).toBe(0);
      expect(metrics.sugars_pct).toBeCloseTo(100, 0);
      expect(metrics.sp).toBeGreaterThan(0);
      expect(metrics.pac).toBeGreaterThan(0);
    });
  });
  
  describe('Very Large Batch Sizes', () => {
    it('should handle industrial-scale batches (10000g)', () => {
      const milk = getIngredientById('milk_3')!;
      const cream = getIngredientById('cream_25')!;
      const sucrose = getIngredientById('sucrose')!;
      
      const recipe = [
        { ing: milk, grams: 6000 },
        { ing: cream, grams: 2500 },
        { ing: sucrose, grams: 1500 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.total_g).toBeCloseTo(10000, 0);
      // Percentages should be consistent regardless of scale
      expect(metrics.sugars_pct).toBeGreaterThan(10);
      expect(metrics.sugars_pct).toBeLessThan(20);
      expect(isNaN(metrics.sp)).toBe(false);
    });
  });
  
  describe('High Evaporation Scenarios', () => {
    it('should handle 50% evaporation correctly', () => {
      const milk = getIngredientById('milk_3')!;
      const recipe = [{ ing: milk, grams: 1000 }];
      
      const metrics = calcMetrics(recipe, { evaporation_pct: 50 });
      
      // Water should be halved
      expect(metrics.water_g).toBeLessThan(milk.water_pct * 10);
      // Total mass should decrease
      expect(metrics.total_g).toBeLessThan(1000);
      expect(metrics.total_g).toBeGreaterThan(0); // But not zero
      // Concentrates solids
      expect(metrics.ts_mass_pct).toBeGreaterThan(20);
    });
    
    it('should prevent negative water with 99% evaporation', () => {
      const milk = getIngredientById('milk_3')!;
      const recipe = [{ ing: milk, grams: 1000 }];
      
      const metrics = calcMetrics(recipe, { evaporation_pct: 99 });
      
      expect(metrics.water_g).toBeGreaterThanOrEqual(0);
      expect(metrics.total_g).toBeGreaterThan(0);
    });
  });
  
  describe('Multiple Sugar Types', () => {
    it('should correctly calculate SP/PAC with mixed sugars', () => {
      const milk = getIngredientById('milk_3')!;
      const sucrose = getIngredientById('sucrose')!;
      const dextrose = getIngredientById('dextrose')!;
      const fructose = getIngredientById('fructose')!;
      
      const recipe = [
        { ing: milk, grams: 800 },
        { ing: sucrose, grams: 70 },
        { ing: dextrose, grams: 30 },
        { ing: fructose, grams: 20 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      // Mixed sugars should give intermediate SP/PAC
      expect(metrics.sp).toBeGreaterThan(10);
      expect(metrics.sp).toBeLessThan(30);
      expect(metrics.pac).toBeGreaterThan(20);
      expect(metrics.pac).toBeLessThan(40);
      
      // No NaN
      expect(isNaN(metrics.sp)).toBe(false);
      expect(isNaN(metrics.pac)).toBe(false);
    });
  });
  
  describe('High Fat Recipes', () => {
    it('should handle ice cream with 20%+ fat', () => {
      const cream = getIngredientById('heavy_cream')!;
      const milk = getIngredientById('milk_3')!;
      const sucrose = getIngredientById('sucrose')!;
      
      const recipe = [
        { ing: cream, grams: 600 },
        { ing: milk, grams: 200 },
        { ing: sucrose, grams: 150 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.fat_pct).toBeGreaterThan(20);
      expect(metrics.total_g).toBeCloseTo(950, 0);
      expect(isNaN(metrics.fat_pct)).toBe(false);
    });
  });
  
  describe('Sorbet (No Fat)', () => {
    it('should handle sorbet with zero fat', () => {
      const mango = getIngredientById('mango_alphonso')!;
      const sucrose = getIngredientById('sucrose')!;
      const stabilizer = getIngredientById('stabilizer')!;
      
      const recipe = [
        { ing: mango, grams: 400 },
        { ing: sucrose, grams: 100 },
        { ing: stabilizer, grams: 3 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.fat_pct).toBeLessThan(1);
      expect(metrics.sugars_pct).toBeGreaterThan(20);
      expect(isNaN(metrics.sp)).toBe(false);
      expect(isNaN(metrics.pac)).toBe(false);
    });
  });
  
  describe('Ingredient Missing Data', () => {
    it('should handle ingredient with missing optional fields', () => {
      const customIng: any = {
        id: 'custom',
        name: 'Custom Ingredient',
        category: 'other',
        water_pct: 50,
        fat_pct: 10,
        // sugars_pct missing
        // sp_coeff missing
        // pac_coeff missing
      };
      
      const recipe = [{ ing: customIng, grams: 100 }];
      
      expect(() => {
        const metrics = calcMetrics(recipe);
        expect(isNaN(metrics.sp)).toBe(false);
        expect(isNaN(metrics.pac)).toBe(false);
      }).not.toThrow();
    });
  });
  
  describe('Precision and Rounding', () => {
    it('should maintain precision in calculations', () => {
      const milk = getIngredientById('milk_3')!;
      const sucrose = getIngredientById('sucrose')!;
      
      const recipe = [
        { ing: milk, grams: 857.3 },
        { ing: sucrose, grams: 142.7 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      expect(metrics.total_g).toBeCloseTo(1000, 1);
      expect(metrics.sugars_pct).toBeGreaterThan(14);
      expect(metrics.sugars_pct).toBeLessThan(15);
    });
  });
  
  describe('Fruit with Complex Sugar Splits', () => {
    it('should handle passion fruit with high fiber', () => {
      const passion = getIngredientById('passion_fruit')!;
      const milk = getIngredientById('milk_3')!;
      
      const recipe = [
        { ing: milk, grams: 700 },
        { ing: passion, grams: 300 }
      ];
      
      const metrics = calcMetrics(recipe);
      
      // Passion fruit has 15% other solids (fiber/seeds)
      expect(metrics.other_pct).toBeGreaterThan(4);
      expect(metrics.sugars_pct).toBeGreaterThan(7);
      expect(isNaN(metrics.pac)).toBe(false);
    });
  });
});

describe('Performance Regression Tests', () => {
  it('should calculate metrics for large recipes quickly', () => {
    const ingredients = getSeedIngredients();
    const recipe = ingredients.slice(0, 10).map(ing => ({ ing, grams: 100 }));
    
    const start = performance.now();
    const metrics = calcMetrics(recipe);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50); // Should complete in <50ms
    expect(metrics.total_g).toBeGreaterThan(0);
  });
  
  it('should handle repeated calculations without performance degradation', () => {
    const milk = getIngredientById('milk_3')!;
    const recipe = [{ ing: milk, grams: 1000 }];
    
    const times: number[] = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      calcMetrics(recipe);
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b) / times.length;
    expect(avgTime).toBeLessThan(10); // Average should be <10ms
  });
});
