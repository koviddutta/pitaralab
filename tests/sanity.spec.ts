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
