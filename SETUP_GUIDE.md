# MeethaPitara Calculator - Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- npm or yarn package manager
- Git (for cloning)

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

That's it! The app should be running with all features enabled.

## Environment Configuration

### Required Environment Variables

The following environment variables are required for the application to function:

```bash
VITE_SUPABASE_PROJECT_ID     # Your Supabase project identifier
VITE_SUPABASE_PUBLISHABLE_KEY # Public API key for client-side operations
VITE_SUPABASE_URL             # Supabase project URL
```

### Setup Options

**Option 1: Lovable Cloud (Recommended)**
- ✅ All environment variables automatically configured
- ✅ Supabase database connection managed
- ✅ Edge function endpoints pre-configured
- ✅ AI integration ready (Google Gemini)
- ✅ Authentication system enabled
- ✅ File storage configured

**Option 2: Local Development**
1. Copy `.env.example` to `.env`
2. Fill in your Supabase project values
3. **CRITICAL**: Never commit `.env` to version control
4. Rotate any keys that were accidentally exposed

### Security Notes

- 🔒 `.env` is git-ignored to prevent credential leaks
- 🔒 RLS (Row Level Security) enabled on all data tables
- 🔒 Authentication required for all CRUD operations
- 🔒 See `.env.example` for required variable structure

### Row Level Security (RLS) Configuration

The database uses PostgreSQL Row Level Security to protect data:

| Table | Read Access | Write Access | Notes |
|-------|------------|--------------|-------|
| `recipes` | Authenticated | Authenticated | Proprietary formulations |
| `batches` | Authenticated | Authenticated | Production data |
| `pastes` | Authenticated | Authenticated | Paste formulations |
| `ingredients` | **Public** | Authenticated | Shared ingredient database |
| `ingredient_access_log` | User's own logs | Auto (trigger) | Audit trail |

**⚠️  Ingredients Table Note**: 
The `ingredients` table is publicly readable to allow users to browse available ingredients before signup. This includes `cost_per_kg` data. If you need to protect proprietary pricing:

1. **Option A**: Restrict to authenticated users only
   ```sql
   -- Remove public read access
   DROP POLICY "Public users can read non-sensitive ingredient data" ON public.ingredients;
   ```

2. **Option B**: Create a public view without costs
   ```sql
   CREATE VIEW ingredients_public AS 
   SELECT id, name, category, water_pct, sugars_pct, fat_pct, msnf_pct 
   FROM ingredients;
   -- Grant public access only to the view
   ```

See `SECURITY.md` for detailed security considerations.

## Project Structure

```
meetha-pitara-calculator/
├── src/
│   ├── components/          # React components
│   │   ├── RecipeCalculator.tsx
│   │   ├── FlavourEngine.tsx
│   │   ├── PasteStudio.tsx
│   │   ├── ReverseEngineer.tsx
│   │   └── flavour-engine/  # Specialized sub-components
│   ├── lib/                 # Core logic
│   │   ├── calc.ts          # Calculation engine
│   │   ├── optimize.ts      # Optimization algorithm
│   │   ├── ingredientLibrary.ts
│   │   └── ingredientMapping.ts
│   ├── services/            # External integrations
│   │   ├── mlService.ts
│   │   ├── pasteAdvisorService.ts
│   │   └── databaseService.ts
│   ├── types/               # TypeScript definitions
│   │   ├── ingredients.ts
│   │   ├── paste.ts
│   │   └── parameters.ts
│   └── pages/
│       └── Index.tsx        # Main app page
├── supabase/
│   └── functions/
│       └── paste-formulator/ # AI edge function
├── public/
└── docs/
    ├── PROJECT_OVERVIEW.md
    ├── EVALUATION_REPORT.md
    └── SETUP_GUIDE.md
```

## Development Workflow

### Running Locally

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Debugging Tools

The app includes a built-in **Calculation Debugger** (dev mode only):

```typescript
import CalculationDebugger from '@/components/CalculationDebugger';

// Use in any component to inspect calculations
<CalculationDebugger recipe={recipe} />
```

This shows:
- Detailed metric breakdown
- Ingredient validation warnings
- Sugar coefficient matching
- Component percentages

### Browser DevTools

Key areas to monitor:
- **Console**: Calculation warnings and errors
- **Network**: Edge function calls (paste-formulator)
- **React DevTools**: Component state and props
- **Performance**: Render timing for optimization

## Understanding the Calculation Engine

### Core Formula

The calculator uses industry-standard formulas for gelato:

```typescript
// Total Solids (TS)
TS = sugars + fat + MSNF + other_solids

// Total Solids Added (TSA)
TSA = TS - MSNF  // Excludes milk solids

// Sweetness Power (SP)
SP = Σ(sugar_weight × sugar_coefficient) / total_sugars
// Where coefficients: sucrose=100, dextrose=70, fructose=120, etc.

// PAC (Anti-freezing Capacity)
PAC = Σ(sugar_weight × pac_coefficient) / total_sugars
// Where coefficients: sucrose=100, dextrose=190, fructose=190, etc.
```

### Ingredient Data Format

All ingredients must follow this structure:

```typescript
{
  id: "milk_whole",           // Unique identifier
  name: "Whole Milk",         // Display name
  water_g: 87.5,              // per 100g
  sugars_g: 4.8,              // per 100g (lactose)
  fat_g: 3.5,                 // per 100g
  protein_g: 3.2,             // per 100g
  other_solids_g: 1.0,        // per 100g
  cost_per_kg: 1.2,           // Optional
  
  // Sugar breakdown (optional but recommended)
  lactose_pct: 100,           // % of total sugars
  
  // Calculated automatically
  msnf_g: 8.2                 // protein + lactose + other
}
```

## Working with the Flavour Engine

### Example: Analyzing a Recipe

```typescript
import { calcMetrics } from '@/lib/calc';
import { getIngredientByName } from '@/lib/ingredientLibrary';

const recipe = [
  { ing: getIngredientByName("Whole Milk")!, grams: 550 },
  { ing: getIngredientByName("Cream 35%")!, grams: 150 },
  { ing: getIngredientByName("Sugar")!, grams: 150 },
  { ing: getIngredientByName("Skim Milk Powder")!, grams: 30 },
  { ing: getIngredientByName("Dextrose")!, grams: 30 },
];

const metrics = calcMetrics(recipe);

console.log(metrics);
// {
//   grams: { total: 910, water: 620, sugars: 195, ... },
//   pct: { water_pct: 68.1, sugars_pct: 21.4, ... },
//   sp: 92.5,
//   pac: 123.8
// }
```

### Example: Optimizing to Target

```typescript
import { optimizeRecipe } from '@/lib/optimize';

const optimized = optimizeRecipe(
  recipe,
  {
    fat_pct: 8.0,      // Target 8% fat
    sugars_pct: 22.0,  // Target 22% sugars
    sp: 95,            // Target SP 95
    pac: 120           // Target PAC 120
  },
  200,  // max iterations
  1     // step size in grams
);

// Returns adjusted recipe with amounts optimized
```

## Using the Paste Studio

### AI Formulation Flow

1. User selects paste type (fruit, nut, cookie, etc.)
2. User specifies mode (quick/detailed) and constraints
3. Edge function calls Google Gemini 2.5 Flash
4. AI generates scientific recipe with citations
5. System validates against industry benchmarks
6. Preservation advice calculated based on composition

### Example Edge Function Call

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke(
  'paste-formulator',
  {
    body: {
      pasteType: 'Strawberry',
      category: 'fruit',
      mode: 'detailed',
      knownIngredients: ['strawberries', 'sugar'],
      constraints: 'Natural ingredients only'
    }
  }
);

// Returns ScientificRecipe with ingredients, process, preservation
```

## Reverse Engineering

### How It Works

1. User specifies product type (ice cream, gelato, sorbet)
2. User sets target metrics (fat %, sugars %, SP, PAC)
3. User selects available ingredient palette
4. Algorithm calculates ingredient amounts to meet targets

### Algorithm Details

- **Method**: Hill-climbing optimization
- **Objective**: Minimize deviation from all targets
- **Constraints**: Min/max per ingredient, locked amounts
- **Iterations**: Configurable (default 200)
- **Step Size**: 1 gram (adjustable)

## Common Development Tasks

### Adding a New Ingredient

```typescript
// In src/lib/ingredientLibrary.ts
const newIngredient: IngredientData = {
  id: "coconut_cream",
  name: "Coconut Cream",
  water_g: 67.6,
  sugars_g: 3.3,
  fat_g: 24.0,
  protein_g: 2.3,
  other_solids_g: 2.8,
  cost_per_kg: 8.5,
  category: 'dairy_alternative'
};

// Add to database or local library
```

### Creating a New Calculator Component

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { calcMetrics } from '@/lib/calc';

const MyCalculator = () => {
  const [recipe, setRecipe] = useState([]);
  const metrics = calcMetrics(recipe);
  
  return (
    <Card>
      <h2>My Calculator</h2>
      {/* Your UI here */}
    </Card>
  );
};

export default MyCalculator;
```

### Modifying the Optimization Algorithm

```typescript
// In src/lib/optimize.ts

// Change objective function weights
function objective(m: Metrics, t: OptimizeTarget) {
  let s = 0;
  if (t.fat_pct) s += Math.abs(m.fat_pct - t.fat_pct) * 2.0;  // 2x weight
  if (t.sp) s += Math.abs(m.sp - t.sp) * 0.5;  // 0.5x weight
  // ...
  return s;
}

// Or add new constraints
```

## Testing Your Changes

### Manual Testing Checklist

- [ ] Enter recipe in Recipe Calculator
- [ ] Verify metrics match expected values
- [ ] Test optimization with various targets
- [ ] Generate paste formulation in Paste Studio
- [ ] Check mobile responsiveness
- [ ] Verify cost calculations
- [ ] Test edge cases (zero values, extreme ratios)

### Validation

Use the built-in validation:

```typescript
import { validateIngredientData } from '@/lib/ingredientMapping';

const { valid, warnings } = validateIngredientData(ingredient);
if (!valid) {
  console.error('Invalid ingredient:', warnings);
}
```

## Deployment

### Via Lovable Cloud (Recommended)

1. Push changes to GitHub
2. Changes auto-deploy to Lovable Cloud
3. Access at your project URL

### Manual Deployment (Advanced)

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Your own hosting

# Note: Configure environment variables in hosting platform
```

## Troubleshooting

### Common Issues

#### Calculation Errors
```
Error: SP calculation returns NaN
```
**Fix**: Check that ingredient has sugar breakdown data
```typescript
// Add sugar percentages
ingredient.sucrose_pct = 100;  // or dextrose_pct, fructose_pct, etc.
```

#### AI Timeout
```
Error: Edge function timeout
```
**Fix**: Use 'quick' mode or retry
```typescript
mode: 'quick'  // Instead of 'detailed'
```

#### Type Errors
```
Type 'Recipe' is not assignable to 'Row[]'
```
**Fix**: Use conversion function
```typescript
import { convertLegacyRecipeToRows } from '@/lib/ingredientMapping';
const rows = convertLegacyRecipeToRows(legacyRecipe);
```

### Getting Help

1. Check `EVALUATION_REPORT.md` for known issues
2. Use `CalculationDebugger` component
3. Review console logs for warnings
4. Inspect network tab for API errors

## Performance Optimization

### Best Practices

1. **Memoize Expensive Calculations**
```typescript
const metrics = useMemo(() => calcMetrics(recipe), [recipe]);
```

2. **Debounce User Input**
```typescript
const debouncedUpdate = useMemo(
  () => debounce(updateRecipe, 300),
  []
);
```

3. **Code Splitting**
```typescript
const PasteStudio = lazy(() => import('./PasteStudio'));
```

4. **Virtual Scrolling** (for large ingredient lists)
```typescript
import { FixedSizeList } from 'react-window';
```

## Security Considerations

### Input Validation

Always validate user inputs:

```typescript
const amount = Math.max(0, Math.min(10000, parseFloat(input) || 0));
```

### API Rate Limiting

Edge functions have automatic rate limiting. For additional protection:

```typescript
// Implement client-side throttling
const throttledGenerate = throttle(generatePaste, 5000);
```

### Data Sanitization

User-generated content is automatically sanitized by React.

## Database Seeding (Optional)

To populate the database with standard ingredients and sample recipes:

```bash
# If using Lovable Cloud (automatic)
# The database is already seeded with essential data

# If using external Supabase or local development
psql $DATABASE_URL < supabase/seed.sql
```

The seed file includes:
- 18+ standard dairy products and sweeteners
- 7 Indian sweets pastes (gulab jamun, jalebi, rabri, etc.)
- Common fruits and flavor bases
- 4 sample recipes demonstrating different product types

## Next Steps

1. **Explore the Code**: Start with `src/pages/Index.tsx`
2. **Try the Debugger**: Use `CalculationDebugger` component
3. **Seed the Database**: Run `supabase/seed.sql` if needed
4. **Read the Evaluation**: Check `EVALUATION_REPORT.md`
5. **Build a Feature**: Add a new calculator or tool
6. **Deploy**: Push to production when ready

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lovable Docs](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)

---

**Happy Coding!** 🍦

For questions or issues, refer to `PROJECT_OVERVIEW.md` or `EVALUATION_REPORT.md`
