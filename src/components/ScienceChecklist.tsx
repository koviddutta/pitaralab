import { getActiveParameters } from '@/services/productParametersService';

export default function ScienceChecklist({
  productType,
  metrics,
  stabilizerPct,
  fruitPct
}: {
  productType: 'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet';
  metrics: { ts_add_pct:number; fat_pct:number; sugars_pct:number; msnf_pct:number; sp:number; pac:number; };
  stabilizerPct?: number;
  fruitPct?: number;
}) {
  const p = getActiveParameters();
  const b = p.bands[productType]!;
  const row = (label:string, val:number, r:[number,number]) => {
    const pass = val>=r[0] && val<=r[1];
    const near = !pass && (Math.abs(val - (val<r[0]?r[0]:r[1])) <= (0.05*(r[1]-r[0])));
    const cls = pass ? 'text-emerald-700' : near ? 'text-amber-700' : 'text-rose-700';
    return <div className="flex justify-between text-sm"><span>{label}</span><span className={cls}>{val.toFixed(1)} (target {r[0]}–{r[1]})</span></div>;
  };
  return (
    <div className="rounded-xl border p-3 space-y-2">
      <div className="font-semibold">Science Checklist</div>
      {row('Total Solids %', metrics.ts_add_pct, b.ts)}
      {row('Fat %',          metrics.fat_pct,    b.fat)}
      {row('Sugar %',        metrics.sugars_pct, b.sugar)}
      {row('MSNF %',         metrics.msnf_pct,   b.msnf)}
      {row('SP',             metrics.sp,         b.sp)}
      {row('PAC',            metrics.pac,        b.pac)}
      {b.stabilizer && typeof stabilizerPct==='number' && row('Stabilizer %', stabilizerPct, b.stabilizer)}
      {b.fruitPct && typeof fruitPct==='number' && row('Fruit %', fruitPct, b.fruitPct)}
      <div className="text-xs opacity-70">Tips: PAC low → add dextrose/reduce sucrose. TS high → reduce cocoa/stabilizer or add water.</div>
    </div>
  );
}