-- ML & Data Schema for MeethaPitara

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ingredients table with comprehensive data
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('dairy', 'sugar', 'fruit', 'stabilizer', 'emulsifier', 'flavor', 'nut', 'spice', 'confection', 'other')),
  water_pct NUMERIC(5,2) DEFAULT 0,
  sugars_pct NUMERIC(5,2) DEFAULT 0,
  fat_pct NUMERIC(5,2) DEFAULT 0,
  msnf_pct NUMERIC(5,2) DEFAULT 0,
  other_solids_pct NUMERIC(5,2) DEFAULT 0,
  sugar_split JSONB,
  sp_coeff NUMERIC(5,2),
  pac_coeff NUMERIC(5,2),
  notes TEXT,
  cost_per_kg NUMERIC(8,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastes table for Paste Studio
CREATE TABLE IF NOT EXISTS public.pastes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  components_json JSONB NOT NULL,
  comp_cached JSONB,
  lab_json JSONB,
  preservation_json JSONB,
  cost_per_kg NUMERIC(8,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table with versioning
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rows_json JSONB NOT NULL,
  profile_id TEXT,
  profile_version TEXT DEFAULT '2025',
  product_type TEXT CHECK (product_type IN ('ice_cream', 'gelato_white', 'gelato_finished', 'fruit_gelato', 'sorbet')),
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table for calibration & learning
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  machine TEXT CHECK (machine IN ('batch', 'continuous')),
  age_hours NUMERIC(5,1),
  draw_temp_c NUMERIC(5,1),
  cabinet_temp_c NUMERIC(5,1),
  overrun_pct NUMERIC(5,1),
  brix NUMERIC(5,1),
  ph NUMERIC(4,2),
  scoop_temp_c NUMERIC(5,1),
  hardness_score INTEGER CHECK (hardness_score BETWEEN 1 AND 10),
  meltdown_min INTEGER,
  panel_score NUMERIC(3,1) CHECK (panel_score BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pairing feedback for active learning
CREATE TABLE IF NOT EXISTS public.pairing_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  a_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE,
  b_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_tags ON public.ingredients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_profile ON public.recipes(profile_id, profile_version);
CREATE INDEX IF NOT EXISTS idx_recipes_product_type ON public.recipes(product_type);
CREATE INDEX IF NOT EXISTS idx_batches_recipe ON public.batches(recipe_id);
CREATE INDEX IF NOT EXISTS idx_batches_created ON public.batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pairing_feedback_ingredients ON public.pairing_feedback(a_id, b_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pastes_updated_at
  BEFORE UPDATE ON public.pastes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access for ingredients
CREATE POLICY "Allow public read access to ingredients"
  ON public.ingredients FOR SELECT
  USING (true);

-- RLS Policies - Allow public read/write for pastes, recipes, batches
CREATE POLICY "Allow public access to pastes"
  ON public.pastes FOR ALL
  USING (true);

CREATE POLICY "Allow public access to recipes"
  ON public.recipes FOR ALL
  USING (true);

CREATE POLICY "Allow public access to batches"
  ON public.batches FOR ALL
  USING (true);

CREATE POLICY "Allow public access to pairing feedback"
  ON public.pairing_feedback FOR ALL
  USING (true);