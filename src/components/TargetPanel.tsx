import { getActiveParameters } from '@/services/productParametersService';

type Props = {
  productType: 'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet';
  metrics: { ts_add_pct:number; fat_pct:number; sugars_pct:number; msnf_pct:number; sp:number; pac:number; };
  onOptimize?: () => void;
};

function Chip({label, val, r}:{label:string; val:number; r:[number,number]}) {
  const [lo, hi] = r;
  const status = val < lo ? 'bg-amber-100 text-amber-800' : val>hi ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800';
  return <div className={`text-xs rounded px-2 py-1 ${status}`} title={`${label} target ${lo}–${hi}`}>{label}: {val.toFixed(1)}</div>;
}

export default function TargetPanel({ productType, metrics, onOptimize }: Props) {
  const p = getActiveParameters();
  const band = p.bands[productType]!;
  return (
    <div className="space-y-2">
      <div className="font-semibold">Targets</div>
      <div className="flex flex-wrap gap-2">
        <Chip label="TS"     val={metrics.ts_add_pct} r={band.ts}/>
        <Chip label="Fat"    val={metrics.fat_pct}    r={band.fat}/>
        <Chip label="Sugar"  val={metrics.sugars_pct} r={band.sugar}/>
        <Chip label="MSNF"   val={metrics.msnf_pct}   r={band.msnf}/>
        <Chip label="SP"     val={metrics.sp}         r={band.sp}/>
        <Chip label="PAC"    val={metrics.pac}        r={band.pac}/>
      </div>
      {onOptimize && (
        <button onClick={onOptimize} className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-white text-sm">
          Auto-balance
        </button>
      )}
      <div className="text-xs opacity-70">PAC (aka AFP): higher → softer at same temp. SP: relative sweetness (sucrose=1.00).</div>
    </div>
  );
}