import { useState } from 'react';
import { mlService } from '@/services/mlService';
import TargetPanel from './TargetPanel';

export default function ReverseEngineer({ palette }:{ palette:any[] }) {
  const [productType, setProductType] =
    useState<'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet'>('gelato_finished');
  const [known, setKnown] =
    useState<Partial<{ fat_pct:number; sugars_pct:number; msnf_pct:number; ts_add_pct:number; sp:number; pac:number }>>({});
  const [out, setOut] = useState<any>(null);

  const run = () => setOut(mlService.reverseEngineer({ productType, known, palette, totalMass: 1000 }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm">Product Type</label>
          <select className="w-full rounded border px-2 py-1"
                  value={productType} onChange={(e)=>setProductType(e.target.value as any)}>
            <option value="ice_cream">Ice Cream</option>
            <option value="gelato_white">Gelato (White)</option>
            <option value="gelato_finished">Gelato (Finished)</option>
            <option value="fruit_gelato">Fruit Gelato</option>
            <option value="sorbet">Sorbet</option>
          </select>
        </div>
        {['fat_pct','sugars_pct','msnf_pct','ts_add_pct','sp','pac'].map((k)=>(
          <div key={k}>
            <label className="text-sm uppercase">{k}</label>
            <input className="w-full rounded border px-2 py-1" placeholder="e.g. 10"
                   inputMode="decimal"
                   onChange={(e)=>setKnown({...known, [k]: parseFloat(e.target.value) || undefined})}/>
          </div>
        ))}
      </div>

      <button onClick={run} className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm">Generate Recipe</button>

      {out && (
        <div className="space-y-3">
          <TargetPanel productType={productType}
            metrics={{
              ts_add_pct: out.metrics.ts_add_pct,
              fat_pct: out.metrics.fat_pct,
              sugars_pct: out.metrics.sugars_pct,
              msnf_pct: out.metrics.msnf_pct,
              sp: out.metrics.sp,
              pac: out.metrics.pac
            }}/>
          <div className="rounded border">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                <th className="p-2 text-left">Ingredient</th><th className="p-2 text-right">g</th></tr></thead>
              <tbody>
                {out.rows.map((r:any)=>(
                  <tr key={r.ing.id}><td className="p-2">{r.ing.name}</td><td className="p-2 text-right">{r.grams.toFixed(1)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}