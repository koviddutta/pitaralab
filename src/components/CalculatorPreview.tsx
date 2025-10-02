import { useMemo } from "react";
// if your project uses "@/..." alias, keep this import.
// if not, change it to: "../../lib/calc/core"
import { computeTotals, computeSP, computeAFP, Ingredient } from "@/lib/calc/core";

export default function CalculatorPreview({ ingredients }:{
  ingredients: Ingredient[];
}) {
  const totals = useMemo(() => computeTotals(ingredients), [ingredients]);
  const sp = useMemo(() => computeSP(ingredients), [ingredients]);
  const afp = useMemo(() => computeAFP(ingredients), [ingredients]);

  return (
    <div className="p-4 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">Batch Summary</h2>
      <ul className="space-y-1">
        <li>Total weight: {totals.totalWeight.toFixed(1)} g</li>
        <li>Total Solids: {totals.totalSolids.toFixed(1)} g</li>
        <li>
          Sugars: {totals.sugars.toFixed(1)} g • Fat: {totals.fat.toFixed(1)} g •
          {" "}MSNF: {totals.msnf.toFixed(1)} g • Other: {totals.other.toFixed(1)} g
        </li>
        <li>SP: {sp.toFixed(1)} • AFP: {afp.toFixed(1)}</li>
      </ul>
    </div>
  );
}
