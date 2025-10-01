import { describe, it, expect } from 'vitest';
import {
  validateNumber,
  validateString,
  validateIngredientAmount,
  validateRecipeName,
  validateTemperature,
  validatePercentage,
  validatePH,
  validateRecipe,
  validateBatchLog,
  sanitizeInput
} from '../src/lib/validation';

describe('Validation Tests - Edge Cases', () => {
  
  describe('Number Validation', () => {
    it('should accept valid numbers', () => {
      const result = validateNumber(42, { min: 0, max: 100 });
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });
    
    it('should reject NaN', () => {
      const result = validateNumber(NaN);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });
    
    it('should reject Infinity', () => {
      const result = validateNumber(Infinity);
      expect(result.success).toBe(false);
    });
    
    it('should enforce min/max bounds', () => {
      const tooLow = validateNumber(-5, { min: 0, max: 100 });
      expect(tooLow.success).toBe(false);
      expect(tooLow.errors[0]).toContain('at least 0');
      
      const tooHigh = validateNumber(150, { min: 0, max: 100 });
      expect(tooHigh.success).toBe(false);
      expect(tooHigh.errors[0]).toContain('at most 100');
    });
    
    it('should enforce integer constraint', () => {
      const result = validateNumber(3.14, { integer: true });
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('integer');
    });
    
    it('should handle zero correctly', () => {
      const result = validateNumber(0, { min: 0, max: 100 });
      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });
    
    it('should handle negative numbers', () => {
      const result = validateNumber(-18, { min: -30, max: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toBe(-18);
    });
  });
  
  describe('String Validation', () => {
    it('should accept valid strings', () => {
      const result = validateString('Hello World', { minLength: 1, maxLength: 50 });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Hello World');
    });
    
    it('should trim whitespace when requested', () => {
      const result = validateString('  Hello  ', { trim: true });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Hello');
    });
    
    it('should enforce length constraints', () => {
      const tooShort = validateString('Hi', { minLength: 5 });
      expect(tooShort.success).toBe(false);
      
      const tooLong = validateString('x'.repeat(101), { maxLength: 100 });
      expect(tooLong.success).toBe(false);
    });
    
    it('should validate against pattern', () => {
      const result = validateString('test@example', { pattern: /^[a-z]+$/ });
      expect(result.success).toBe(false);
    });
    
    it('should handle empty strings based on required flag', () => {
      const notRequired = validateString('', { required: false });
      expect(notRequired.success).toBe(true);
      
      const required = validateString('', { required: true });
      expect(required.success).toBe(false);
    });
  });
  
  describe('Ingredient Amount Validation', () => {
    it('should accept valid ingredient amounts', () => {
      const result = validateIngredientAmount(250);
      expect(result.success).toBe(true);
      expect(result.data).toBe(250);
    });
    
    it('should reject negative amounts', () => {
      const result = validateIngredientAmount(-10);
      expect(result.success).toBe(false);
    });
    
    it('should reject extremely large amounts', () => {
      const result = validateIngredientAmount(200000);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('100000');
    });
    
    it('should accept zero amount', () => {
      const result = validateIngredientAmount(0);
      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });
  });
  
  describe('Recipe Validation', () => {
    it('should accept valid recipe', () => {
      const recipe = {
        'Milk': 500,
        'Cream': 200,
        'Sugar': 150
      };
      const result = validateRecipe(recipe);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(recipe);
    });
    
    it('should reject non-object recipes', () => {
      const result1 = validateRecipe([]);
      expect(result1.success).toBe(false);
      
      const result2 = validateRecipe(null);
      expect(result2.success).toBe(false);
      
      const result3 = validateRecipe('not an object');
      expect(result3.success).toBe(false);
    });
    
    it('should reject recipes with invalid amounts', () => {
      const recipe = {
        'Milk': 500,
        'Sugar': -50 // Invalid
      };
      const result = validateRecipe(recipe);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Sugar'))).toBe(true);
    });
    
    it('should reject empty recipes', () => {
      const result = validateRecipe({});
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('at least one');
    });
    
    it('should handle recipes with NaN values', () => {
      const recipe = {
        'Milk': 500,
        'Sugar': NaN
      };
      const result = validateRecipe(recipe);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Temperature Validation', () => {
    it('should accept valid Celsius temperatures', () => {
      const result = validateTemperature(-18, 'C');
      expect(result.success).toBe(true);
      expect(result.data).toBe(-18);
    });
    
    it('should accept valid Fahrenheit temperatures', () => {
      const result = validateTemperature(32, 'F');
      expect(result.success).toBe(true);
    });
    
    it('should reject out-of-range temperatures', () => {
      const tooLowC = validateTemperature(-50, 'C');
      expect(tooLowC.success).toBe(false);
      
      const tooHighC = validateTemperature(200, 'C');
      expect(tooHighC.success).toBe(false);
    });
  });
  
  describe('Percentage Validation', () => {
    it('should accept valid percentages', () => {
      const result = validatePercentage(45.5);
      expect(result.success).toBe(true);
      expect(result.data).toBe(45.5);
    });
    
    it('should reject percentages outside 0-100', () => {
      const negative = validatePercentage(-5);
      expect(negative.success).toBe(false);
      
      const over100 = validatePercentage(105);
      expect(over100.success).toBe(false);
    });
    
    it('should accept 0 and 100', () => {
      expect(validatePercentage(0).success).toBe(true);
      expect(validatePercentage(100).success).toBe(true);
    });
  });
  
  describe('pH Validation', () => {
    it('should accept valid pH values', () => {
      const result = validatePH(6.5);
      expect(result.success).toBe(true);
      expect(result.data).toBe(6.5);
    });
    
    it('should reject pH outside 0-14', () => {
      const negative = validatePH(-1);
      expect(negative.success).toBe(false);
      
      const tooHigh = validatePH(15);
      expect(tooHigh.success).toBe(false);
    });
  });
  
  describe('Input Sanitization', () => {
    it('should remove dangerous characters', () => {
      const xss = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(xss);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });
    
    it('should remove javascript: protocol', () => {
      const malicious = 'javascript:alert(1)';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized.toLowerCase()).not.toContain('javascript:');
    });
    
    it('should remove event handlers', () => {
      const malicious = 'onerror=alert(1)';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized.toLowerCase()).not.toContain('onerror=');
    });
    
    it('should preserve safe strings', () => {
      const safe = 'Vanilla Extract 500g';
      const sanitized = sanitizeInput(safe);
      expect(sanitized).toBe(safe);
    });
  });
  
  describe('Batch Log Validation', () => {
    it('should accept valid batch log', () => {
      const log = {
        machineType: 'batch',
        mixBrix: 28.5,
        pH: 6.5,
        drawTempC: -6,
        overrunPct: 40,
        hardnessScore: 7,
        panelScore: 8
      };
      const result = validateBatchLog(log);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid machine type', () => {
      const log = {
        machineType: 'invalid'
      };
      const result = validateBatchLog(log);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Machine type');
    });
    
    it('should reject out-of-range scores', () => {
      const log = {
        hardnessScore: 11, // Max is 10
        panelScore: 0  // Min is 1
      };
      const result = validateBatchLog(log);
      expect(result.success).toBe(false);
    });
    
    it('should enforce integer constraint on scores', () => {
      const log = {
        hardnessScore: 7.5 // Must be integer
      };
      const result = validateBatchLog(log);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('integer');
    });
  });
});
