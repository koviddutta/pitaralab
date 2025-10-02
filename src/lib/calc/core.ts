export type Ingredient = {
  name: string;
  grams: number; // batch grams
  composition: {
    sugars: number; // g per 100 g ingredient
    fat: number;
    msnf: number;
    other: number; // stabilizers, cocoa solids, fibers etc.
    water: number;
  };
  spCoeff?: number;   // sweetening power factor
  afpCoeff?: number;  // anti-freezing factor
};

export function computeTotals(ingredients: Ingredient[]) {
  const t = ingredients.reduce(
    (a, ing) => {
      const f = ing.grams / 100;
      a.sugars += ing.composition.sugars * f;
      a.fat    += ing.composition.fat * f;
      a.msnf   += ing.composition.msnf * f;
      a.other  += ing.composition.other * f;
      a.water  += ing.composition.water * f;
      return a;
    },
    { sugars: 0, fat: 0, msnf: 0, other: 0, water: 0 }
  );
  const totalSolids = t.sugars + t.fat + t.msnf + t.other;
  const totalWeight = totalSolids + t.water;
  return { ...t, totalSolids, totalWeight };
}

export function computeSP(ingredients: Ingredient[]) {
  return ingredients.reduce((sp, ing) => {
    const coeff = ing.spCoeff ?? 1;
    const sugar = (ing.composition.sugars * ing.grams) / 100;
    return sp + sugar * coeff;
  }, 0);
}

export function computeAFP(ingredients: Ingredient[]) {
  return ingredients.reduce((afp, ing) => {
    const coeff = ing.afpCoeff ?? 0;
    const sugar = (ing.composition.sugars * ing.grams) / 100;
    return afp + sugar * coeff;
  }, 0);
}

export function splitSugars(totalSugars: number) {
  return {
    sucrose: Math.round(totalSugars * 0.70),
    dextrose: Math.round(totalSugars * 0.10),
    glucoseSyrup: Math.round(totalSugars * 0.20),
  };
}

export function applyEvaporation(
  ingredients: Ingredient[],
  evapPercent: number
) {
  const factor = Math.max(0, Math.min(evapPercent, 100)) / 100;
  return ingredients.map((ing) => ({
    ...ing,
    composition: {
      ...ing.composition,
      water: ing.composition.water * (1 - factor),
    },
  }));
}
