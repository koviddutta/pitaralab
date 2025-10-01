-- MeethaPitara Calculator - Seed Data
-- This file populates the database with standard ingredients and sample recipes
-- Run this after initial database setup

-- ============================================================================
-- INGREDIENTS - Standard Dairy & Sweeteners
-- ============================================================================

INSERT INTO public.ingredients (id, name, category, water_pct, sugars_pct, fat_pct, msnf_pct, other_solids_pct, sp_coeff, pac_coeff, cost_per_kg, notes) VALUES
  -- Dairy Products
  ('milk_whole', 'Whole Milk (3.5% fat)', 'dairy', 87.5, 4.8, 3.5, 8.2, 0.5, 35, 35, 0.06, ARRAY['Standard full-fat milk', 'Lactose provides sweetness']),
  ('milk_low_fat', 'Low Fat Milk (1.5% fat)', 'dairy', 89.5, 4.9, 1.5, 8.6, 0.5, 35, 35, 0.05, ARRAY['Lower fat content', 'Higher MSNF']),
  ('cream_35', 'Heavy Cream (35%)', 'dairy', 58.2, 3.1, 35.0, 5.4, 0.3, 20, 20, 0.35, ARRAY['High fat content', 'Rich texture']),
  ('cream_25', 'Light Cream (25%)', 'dairy', 68.2, 3.8, 25.0, 6.2, 0.4, 25, 25, 0.25, ARRAY['Medium fat content', 'Versatile']),
  ('smp', 'Skim Milk Powder (SMP)', 'dairy', 3.5, 52.0, 1.0, 93.0, 0.5, 35, 35, 0.30, ARRAY['Boosts MSNF', 'Improves texture']),
  ('wmp', 'Whole Milk Powder (WMP)', 'dairy', 3.0, 38.0, 26.0, 70.0, 1.0, 35, 35, 0.40, ARRAY['Full fat powder', 'Rich flavor']),
  
  -- Sugars
  ('sucrose', 'Sucrose (Table Sugar)', 'sugar', 0.0, 100.0, 0.0, 0.0, 0.0, 100, 100, 0.045, ARRAY['Reference sweetener', 'SP=100, PAC=100']),
  ('dextrose', 'Dextrose (Glucose)', 'sugar', 0.0, 100.0, 0.0, 0.0, 0.0, 70, 190, 0.08, ARRAY['Lower sweetness', 'High anti-freeze', 'Prevents crystallization']),
  ('fructose', 'Fructose', 'sugar', 0.0, 100.0, 0.0, 0.0, 0.0, 173, 190, 0.15, ARRAY['Very sweet', 'High anti-freeze', 'Hygroscopic']),
  ('glucose_de38', 'Glucose Syrup (DE 38)', 'sugar', 20.0, 75.0, 0.0, 0.0, 5.0, 30, 60, 0.07, ARRAY['Low DE', 'Body builder', 'Less sweet']),
  ('glucose_de60', 'Glucose Syrup (DE 60)', 'sugar', 20.0, 75.0, 0.0, 0.0, 5.0, 50, 110, 0.075, ARRAY['Medium DE', 'Balanced properties']),
  ('invert_sugar', 'Invert Sugar Syrup', 'sugar', 25.0, 72.0, 0.0, 0.0, 3.0, 130, 160, 0.09, ARRAY['Mix of glucose+fructose', 'High sweetness']),
  ('honey', 'Honey', 'sugar', 17.0, 82.0, 0.0, 0.0, 1.0, 110, 140, 0.35, ARRAY['Natural sweetener', 'Floral notes', 'Contains enzymes']),
  ('maltodextrin', 'Maltodextrin (DE 15)', 'sugar', 5.0, 95.0, 0.0, 0.0, 0.0, 10, 20, 0.12, ARRAY['Very low sweetness', 'Bulking agent', 'Improves texture']),

  -- Stabilizers & Emulsifiers  
  ('stabilizer_mix', 'Stabilizer Mix (Generic)', 'stabilizer', 5.0, 0.0, 0.0, 0.0, 95.0, 0, 0, 1.20, ARRAY['Prevents ice crystal growth', 'Use 0.3-0.6%']),
  ('locust_bean_gum', 'Locust Bean Gum (LBG)', 'stabilizer', 8.0, 0.0, 0.0, 0.0, 92.0, 0, 0, 1.50, ARRAY['Synergistic with carrageenan', 'Creamy texture']),
  ('guar_gum', 'Guar Gum', 'stabilizer', 10.0, 0.0, 0.0, 0.0, 90.0, 0, 0, 0.80, ARRAY['Inexpensive', 'Good thickener']),
  ('carrageenan', 'Carrageenan', 'stabilizer', 12.0, 0.0, 0.0, 0.0, 88.0, 0, 0, 2.00, ARRAY['Synergistic with LBG', 'Prevents wheying-off']);

-- ============================================================================
-- INDIAN SWEETS PASTES - Traditional Ingredients
-- ============================================================================

INSERT INTO public.ingredients (id, name, category, water_pct, sugars_pct, fat_pct, msnf_pct, other_solids_pct, sp_coeff, pac_coeff, cost_per_kg, notes, tags) VALUES
  -- Gulab Jamun Paste
  ('gulab_jamun_paste', 'Gulab Jamun Paste', 'flavor', 41.6, 42.5, 5.4, 8.1, 3.4, 95, 110, 0.45, 
   ARRAY['Mithai fusion', 'Sweet & aromatic', 'Rose water notes', 'High sugar content'], 
   ARRAY['indian_sweet', 'fusion', 'premium']),
  
  -- Jalebi Paste
  ('jalebi_paste', 'Jalebi Paste', 'flavor', 38.0, 48.0, 3.2, 6.5, 4.3, 98, 120, 0.42,
   ARRAY['Crispy sweet flavor', 'Saffron notes', 'Sugar syrup base', 'Fermented undertones'],
   ARRAY['indian_sweet', 'fusion', 'festive']),
  
  -- Rabri Paste
  ('rabri_paste', 'Rabri Paste', 'flavor', 52.0, 28.0, 12.0, 15.0, 3.0, 80, 85, 0.55,
   ARRAY['Rich dairy flavor', 'Caramelized notes', 'High MSNF', 'Thickened milk base'],
   ARRAY['indian_sweet', 'dairy', 'premium']),
  
  -- Milkcake Paste
  ('milkcake_paste', 'Milkcake (Kalakand) Paste', 'flavor', 45.0, 32.0, 10.0, 18.0, 5.0, 85, 90, 0.50,
   ARRAY['Grainy texture', 'Milk solids dominant', 'Cardamom notes', 'Paneer-like'],
   ARRAY['indian_sweet', 'dairy', 'traditional']),
  
  -- Gajar Halwa Paste
  ('gajar_halwa_paste', 'Gajar Halwa Paste', 'flavor', 48.0, 35.0, 8.5, 5.0, 3.5, 88, 95, 0.48,
   ARRAY['Carrot base', 'Ghee richness', 'Cardamom & nuts', 'Winter specialty'],
   ARRAY['indian_sweet', 'vegetable', 'winter']),
  
  -- Mango Pulp (Alphonso)
  ('mango_alphonso', 'Alphonso Mango Pulp', 'fruit', 82.0, 14.0, 0.4, 0.0, 3.6, 110, 120, 0.25,
   ARRAY['Premium mango variety', 'Rich flavor', 'Natural sweetness', 'High demand'],
   ARRAY['fruit', 'seasonal', 'premium']),
  
  -- Tamarind Paste
  ('tamarind_paste', 'Tamarind Paste', 'fruit', 31.0, 38.0, 0.6, 0.0, 30.4, 75, 100, 0.18,
   ARRAY['Tangy flavor', 'High acidity', 'Unique taste profile', 'Digestive properties'],
   ARRAY['fruit', 'tangy', 'spice']);

-- ============================================================================
-- FRUITS - Common Varieties
-- ============================================================================

INSERT INTO public.ingredients (id, name, category, water_pct, sugars_pct, fat_pct, msnf_pct, other_solids_pct, sp_coeff, pac_coeff, cost_per_kg, sugar_split, notes) VALUES
  ('strawberry', 'Strawberry (Fresh)', 'fruit', 91.0, 7.7, 0.3, 0.0, 1.0, 105, 115, 0.20, 
   '{"glucose": 40, "fructose": 50, "sucrose": 10}'::jsonb,
   ARRAY['Sweet-tart balance', 'Aromatic', 'Popular flavor']),
  
  ('banana', 'Banana (Ripe)', 'fruit', 75.0, 22.8, 0.3, 0.0, 1.9, 110, 125, 0.08,
   '{"glucose": 30, "fructose": 35, "sucrose": 35}'::jsonb,
   ARRAY['Creamy texture', 'Natural sweetness', 'Good body']),
  
  ('raspberry', 'Raspberry (Fresh)', 'fruit', 85.8, 9.5, 0.7, 0.0, 4.0, 108, 118, 0.35,
   '{"glucose": 45, "fructose": 50, "sucrose": 5}'::jsonb,
   ARRAY['Tart flavor', 'Intense aroma', 'Premium positioning']),
  
  ('pistachio', 'Pistachio Paste', 'flavor', 4.4, 7.7, 45.0, 0.0, 42.9, 70, 75, 2.50,
   NULL,
   ARRAY['Rich nutty flavor', 'High fat', 'Premium ingredient', 'Natural green color']);

-- ============================================================================
-- SAMPLE RECIPES
-- ============================================================================

-- White Base Recipe
INSERT INTO public.recipes (id, name, product_type, profile_id, profile_version, rows_json, metrics) VALUES
(
  gen_random_uuid(),
  'Classic White Base',
  'gelato_white',
  'BASE',
  '2025',
  '[
    {"ing_id": "milk_whole", "grams": 650},
    {"ing_id": "cream_25", "grams": 150},
    {"ing_id": "smp", "grams": 60},
    {"ing_id": "sucrose", "grams": 100},
    {"ing_id": "dextrose", "grams": 20},
    {"ing_id": "glucose_de60", "grams": 20}
  ]'::jsonb,
  '{"ts_add_pct": 35.2, "fat_pct": 6.2, "sugars_pct": 18.5, "msnf_pct": 9.8, "sp": 16.4, "pac": 24.1}'::jsonb
);

-- Finished Gelato - Strawberry
INSERT INTO public.recipes (id, name, product_type, profile_id, profile_version, rows_json, metrics) VALUES
(
  gen_random_uuid(),
  'Strawberry Gelato',
  'gelato_finished',
  'BASE',
  '2025',
  '[
    {"ing_id": "milk_whole", "grams": 500},
    {"ing_id": "cream_35", "grams": 180},
    {"ing_id": "smp", "grams": 45},
    {"ing_id": "sucrose", "grams": 90},
    {"ing_id": "dextrose", "grams": 25},
    {"ing_id": "glucose_de60", "grams": 25},
    {"ing_id": "strawberry", "grams": 120},
    {"ing_id": "stabilizer_mix", "grams": 5}
  ]'::jsonb,
  '{"ts_add_pct": 40.5, "fat_pct": 8.5, "sugars_pct": 20.2, "msnf_pct": 8.5, "sp": 18.8, "pac": 26.5}'::jsonb
);

-- Fusion - Gulab Jamun Gelato
INSERT INTO public.recipes (id, name, product_type, profile_id, profile_version, rows_json, metrics) VALUES
(
  gen_random_uuid(),
  'Gulab Jamun Fusion Gelato',
  'gelato_finished',
  'BASE',
  '2025',
  '[
    {"ing_id": "milk_whole", "grams": 480},
    {"ing_id": "cream_35", "grams": 160},
    {"ing_id": "smp", "grams": 50},
    {"ing_id": "sucrose", "grams": 70},
    {"ing_id": "dextrose", "grams": 20},
    {"ing_id": "gulab_jamun_paste", "grams": 100},
    {"ing_id": "stabilizer_mix", "grams": 4.5}
  ]'::jsonb,
  '{"ts_add_pct": 42.8, "fat_pct": 9.2, "sugars_pct": 21.5, "msnf_pct": 10.5, "sp": 19.2, "pac": 27.8}'::jsonb
);

-- Fruit Sorbet - Mango
INSERT INTO public.recipes (id, name, product_type, profile_id, profile_version, rows_json, metrics) VALUES
(
  gen_random_uuid(),
  'Alphonso Mango Sorbet',
  'sorbet',
  'BASE',
  '2025',
  '[
    {"ing_id": "mango_alphonso", "grams": 400},
    {"ing_id": "sucrose", "grams": 140},
    {"ing_id": "dextrose", "grams": 40},
    {"ing_id": "glucose_de60", "grams": 30},
    {"ing_id": "stabilizer_mix", "grams": 2.5}
  ]'::jsonb,
  '{"ts_add_pct": 38.5, "fat_pct": 0.3, "sugars_pct": 28.2, "msnf_pct": 0.0, "sp": 22.5, "pac": 30.2}'::jsonb
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify ingredient count
SELECT category, COUNT(*) as count 
FROM public.ingredients 
GROUP BY category 
ORDER BY category;

-- Verify recipe count
SELECT product_type, COUNT(*) as count 
FROM public.recipes 
GROUP BY product_type 
ORDER BY product_type;

-- Show sample calculations for White Base
SELECT 
  r.name,
  r.product_type,
  (r.metrics->>'ts_add_pct')::numeric as total_solids,
  (r.metrics->>'fat_pct')::numeric as fat_pct,
  (r.metrics->>'sugars_pct')::numeric as sugars_pct,
  (r.metrics->>'sp')::numeric as sp,
  (r.metrics->>'pac')::numeric as pac
FROM public.recipes r
WHERE r.name = 'Classic White Base';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MeethaPitara Seed Data Loaded Successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Ingredients: % total', (SELECT COUNT(*) FROM public.ingredients);
  RAISE NOTICE 'Recipes: % total', (SELECT COUNT(*) FROM public.recipes);
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to calculate! 🍦';
END $$;
