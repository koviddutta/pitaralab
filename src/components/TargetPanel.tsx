import { getActiveParameters } from '@/services/productParametersService';
import { Button } from '@/components/ui/button';

type Props = {
  productType: 'ice_cream'|'gelato_white'|'gelato_finished'|'fruit_gelato'|'sorbet';
  metrics: { ts_add_pct:number; fat_pct:number; sugars_pct:number; msnf_pct:number; sp:number; pac:number; };
  onOptimize?: () => void;
};

function Chip({label, val, r}:{label:string; val:number; r:[number,number]}) {
  const [lo, hi] = r;
  const status = val < lo ? 'bg-warning-light text-warning-foreground border-warning/30' : 
                 val > hi ? 'bg-destructive/10 text-destructive border-destructive/30' : 
                           'bg-success-light text-success-foreground border-success/30';
  const ring = val < lo ? 'hover:ring-warning/20' : 
               val > hi ? 'hover:ring-destructive/20' : 
                         'hover:ring-success/20';
  return (
    <div 
      className={`text-xs rounded-lg px-3 py-2 border animate-smooth cursor-help ${status} ${ring} hover:ring-2`} 
      title={`${label} target ${lo}–${hi}`}
    >
      {label}: {val.toFixed(1)}
    </div>
  );
}

export default function TargetPanel({ productType, metrics, onOptimize }: Props) {
  const p = getActiveParameters();
  const band = p.bands[productType];
  if (!band) {
    return (
      <div className="space-y-2">
        <div className="font-semibold">Targets</div>
        <div className="text-xs opacity-70">No target bands defined for this product/profile.</div>
      </div>
    );
  }
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
        <Button 
          onClick={onOptimize} 
          variant="gradient" 
          size="sm" 
          className="mt-3 shadow-elegant hover:shadow-glow"
        >
          Auto-balance
        </Button>
      )}
      <div className="text-xs text-muted-foreground">PAC (aka AFP): higher → softer at same temp. SP: relative sweetness (sucrose=1.00).</div>
    </div>
  );
}