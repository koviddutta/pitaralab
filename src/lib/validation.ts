// Input validation and sanitization using best practices
// While zod is not installed, we implement robust validation patterns

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors: string[];
};

// Number validation with bounds
export function validateNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  } = {}
): ValidationResult<number> {
  const errors: string[] = [];
  
  if (value === undefined || value === null || value === '') {
    if (options.required) {
      errors.push('Value is required');
      return { success: false, errors };
    }
    return { success: true, data: 0, errors: [] };
  }
  
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    errors.push('Value must be a valid number');
    return { success: false, errors };
  }
  
  if (options.integer && !Number.isInteger(num)) {
    errors.push('Value must be an integer');
  }
  
  if (options.min !== undefined && num < options.min) {
    errors.push(`Value must be at least ${options.min}`);
  }
  
  if (options.max !== undefined && num > options.max) {
    errors.push(`Value must be at most ${options.max}`);
  }
  
  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: num, errors: [] };
}

// String validation with length and pattern
export function validateString(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
    trim?: boolean;
  } = {}
): ValidationResult<string> {
  const errors: string[] = [];
  
  if (value === undefined || value === null || value === '') {
    if (options.required) {
      errors.push('Value is required');
      return { success: false, errors };
    }
    return { success: true, data: '', errors: [] };
  }
  
  let str = String(value);
  if (options.trim) str = str.trim();
  
  if (options.minLength !== undefined && str.length < options.minLength) {
    errors.push(`Value must be at least ${options.minLength} characters`);
  }
  
  if (options.maxLength !== undefined && str.length > options.maxLength) {
    errors.push(`Value must be at most ${options.maxLength} characters`);
  }
  
  if (options.pattern && !options.pattern.test(str)) {
    errors.push('Value format is invalid');
  }
  
  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: str, errors: [] };
}

// Ingredient amount validation
export function validateIngredientAmount(amount: any): ValidationResult<number> {
  return validateNumber(amount, {
    min: 0,
    max: 100000, // 100kg max per ingredient
    required: true
  });
}

// Recipe name validation
export function validateRecipeName(name: any): ValidationResult<string> {
  return validateString(name, {
    minLength: 1,
    maxLength: 100,
    required: true,
    trim: true,
    pattern: /^[a-zA-Z0-9\s\-_()]+$/
  });
}

// Temperature validation
export function validateTemperature(temp: any, unit: 'C' | 'F' = 'C'): ValidationResult<number> {
  const bounds = unit === 'C' 
    ? { min: -30, max: 150 }
    : { min: -22, max: 302 };
  
  return validateNumber(temp, {
    ...bounds,
    required: true
  });
}

// Percentage validation
export function validatePercentage(pct: any): ValidationResult<number> {
  return validateNumber(pct, {
    min: 0,
    max: 100,
    required: false
  });
}

// pH validation
export function validatePH(ph: any): ValidationResult<number> {
  return validateNumber(ph, {
    min: 0,
    max: 14,
    required: false
  });
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize recipe object
export function validateRecipe(recipe: any): ValidationResult<{ [key: string]: number }> {
  const errors: string[] = [];
  
  if (typeof recipe !== 'object' || recipe === null || Array.isArray(recipe)) {
    return { success: false, errors: ['Recipe must be an object'] };
  }
  
  const validated: { [key: string]: number } = {};
  
  for (const [ingredient, amount] of Object.entries(recipe)) {
    // Validate ingredient name
    const nameResult = validateString(ingredient, {
      minLength: 1,
      maxLength: 50,
      required: true,
      trim: true
    });
    
    if (!nameResult.success) {
      errors.push(`Invalid ingredient name "${ingredient}": ${nameResult.errors.join(', ')}`);
      continue;
    }
    
    // Validate amount
    const amountResult = validateIngredientAmount(amount);
    if (!amountResult.success) {
      errors.push(`Invalid amount for "${ingredient}": ${amountResult.errors.join(', ')}`);
      continue;
    }
    
    validated[sanitizeInput(nameResult.data!)] = amountResult.data!;
  }
  
  if (Object.keys(validated).length === 0) {
    errors.push('Recipe must contain at least one valid ingredient');
  }
  
  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: validated, errors: [] };
}

// Validate batch log data
export function validateBatchLog(log: any): ValidationResult<any> {
  const errors: string[] = [];
  
  if (!log || typeof log !== 'object') {
    return { success: false, errors: ['Log must be an object'] };
  }
  
  // Validate numeric fields
  const numericFields = [
    { key: 'mixBrix', bounds: { min: 0, max: 100 } },
    { key: 'pH', bounds: { min: 0, max: 14 } },
    { key: 'ageTimeHours', bounds: { min: 0, max: 72 } },
    { key: 'drawTempC', bounds: { min: -30, max: 10 } },
    { key: 'overrunPct', bounds: { min: 0, max: 200 } },
    { key: 'scoopTempC', bounds: { min: -30, max: 0 } },
    { key: 'hardnessScore', bounds: { min: 1, max: 10, integer: true } },
    { key: 'meltdownMinutes', bounds: { min: 0, max: 120 } },
    { key: 'panelScore', bounds: { min: 1, max: 10, integer: true } }
  ];
  
  for (const field of numericFields) {
    if (log[field.key] !== undefined) {
      const result = validateNumber(log[field.key], field.bounds);
      if (!result.success) {
        errors.push(`${field.key}: ${result.errors.join(', ')}`);
      }
    }
  }
  
  // Validate machine type
  if (log.machineType && !['batch', 'continuous'].includes(log.machineType)) {
    errors.push('Machine type must be "batch" or "continuous"');
  }
  
  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: log, errors: [] };
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside window
    const recentAttempts = attempts.filter(t => now - t < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetIn = this.windowMs - (now - oldestAttempt);
      
      return {
        allowed: false,
        remaining: 0,
        resetIn
      };
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return {
      allowed: true,
      remaining: this.maxAttempts - recentAttempts.length,
      resetIn: this.windowMs
    };
  }
  
  reset(key: string) {
    this.attempts.delete(key);
  }
}
