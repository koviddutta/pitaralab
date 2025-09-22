export type PreservationMethod = 'retort'|'hot_fill'|'frozen'|'freeze_dry';

export type PasteComponent = {
  id: string; 
  name: string; 
  grams: number;
  // composition of this sub-ingredient (same fields as IngredientData)
  water_pct: number; 
  sugars_pct?: number; 
  fat_pct: number; 
  msnf_pct?: number; 
  other_solids_pct?: number;
  sugar_split?: { glucose?:number; fructose?:number; sucrose?:number };
  notes?: string[];
};

export type LabSpecs = {
  brix_deg?: number;     // °Bx (target or measured)
  pH?: number;           // optional but strongly recommended
  aw_est?: number;       // estimated water activity (optional)
};

export type PasteFormula = {
  id: string;
  name: string;
  category: 'dairy'|'fruit'|'confection'|'spice'|'nut'|'mixed';
  components: PasteComponent[];  // sub-ingredients
  batch_size_g: number;          // total grams
  // computed composition for the paste as a single ingredient
  water_pct: number; 
  sugars_pct?: number; 
  fat_pct: number; 
  msnf_pct?: number; 
  other_solids_pct?: number;
  sugar_split?: { glucose?:number; fructose?:number; sucrose?:number };
  acidity_citric_pct?: number;   // optional equivalent acidity
  allergens?: { milk?: boolean; nuts?: boolean; gluten?: boolean };
  lab?: LabSpecs;
  cost_per_kg?: number;
};

export type PreservationAdvice = {
  method: PreservationMethod;
  confidence: number; // 0..1
  why: string[];
  targets: {
    brix_deg?: number; 
    pH?: number; 
    aw_max?: number;
    particle_mm_max?: number; // guidance for heat penetration
  };
  packaging: string[]; // suggested packaging options
  storage: 'ambient'|'chilled'|'frozen';
  shelf_life_hint: string; // non-binding estimate text
  impact_on_gelato: {
    // how this method version typically affects flavor/texture
    aroma_retention: 'low'|'medium'|'high';
    color_browning: 'low'|'medium'|'high';
    notes: string[];
  };
};