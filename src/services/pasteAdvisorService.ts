import { PasteFormula, PreservationAdvice } from '@/types/paste';

export class PasteAdvisorService {
  advise(paste: PasteFormula, prefs?: { ambientPreferred?: boolean; cleanLabel?: boolean; particulate_mm?: number }): PreservationAdvice[] {
    const pH = paste.lab?.pH;
    const brix = paste.lab?.brix_deg;
    const dairy = paste.category === 'dairy' || (paste.msnf_pct ?? 0) > 1;
    const particulate = prefs?.particulate_mm ?? 2;

    // quick aw proxy from Brix (very rough; model later with your data)
    const aw_est = paste.lab?.aw_est ?? (brix != null ? Math.max(0.75, 1 - 0.45 * (brix / 100)) : undefined);

    const adv: PreservationAdvice[] = [];

    // 1) hot_fill candidate
    if (!dairy && pH != null && pH <= 4.6 && (brix ?? 0) >= 55 && particulate <= 5) {
      adv.push({
        method: 'hot_fill',
        confidence: 0.7,
        why: [
          'High-acid & high °Bx; typical jam-like hot-fill feasible', 
          'No dairy components', 
          particulate > 5 ? 'Particulates borderline; consider size reduction' : 'Particulates ok'
        ],
        targets: { 
          brix_deg: Math.max(60, brix ?? 60), 
          pH: Math.min(3.8, pH ?? 3.8), 
          aw_max: 0.85, 
          particle_mm_max: 5 
        },
        packaging: ['Glass jar + lug cap (hot-fill)', 'HDPE bottle (heat resistant)'],
        storage: 'ambient',
        shelf_life_hint: 'Ambient shelf-life typical for hot-filled jams; verify with process authority',
        impact_on_gelato: { 
          aroma_retention: 'medium', 
          color_browning: 'medium', 
          notes: ['Balanced solids; adds water & sugars to base'] 
        }
      });
    }

    // 2) retort candidate (ambient, dairy or low-acid)
    if ((dairy || (pH != null && pH > 4.6)) && prefs?.ambientPreferred) {
      adv.push({
        method: 'retort',
        confidence: 0.7,
        why: [
          dairy ? 'Dairy present; ambient requires commercial sterility' : 'Low-acid (>4.6) for ambient',
          'Ambient logistics requested'
        ],
        targets: { pH: pH, brix_deg: brix, aw_max: 0.97, particle_mm_max: 10 },
        packaging: ['Retort pouch', 'Cans', 'Glass jar (retortable)'],
        storage: 'ambient',
        shelf_life_hint: 'Ambient; exact lethality to be validated by process authority',
        impact_on_gelato: { 
          aroma_retention: 'low', 
          color_browning: 'high', 
          notes: ['Potential Maillard/caramel notes; adjust color/flavor'] 
        }
      });
    }

    // 3) frozen candidate (quality-first, minimal process)
    adv.push({
      method: 'frozen',
      confidence: 0.8,
      why: ['Minimal thermal impact; best flavor retention', 'Requires frozen logistics'],
      targets: { brix_deg: brix, pH: pH },
      packaging: ['Foodgrade pails', 'Vacuum pouch + blast freeze'],
      storage: 'frozen',
      shelf_life_hint: 'Frozen; quality depends on ice crystal control',
      impact_on_gelato: { 
        aroma_retention: 'high', 
        color_browning: 'low', 
        notes: ['Adds water solids; plan PAC/SP balance'] 
      }
    });

    // 4) freeze_dry candidate (powder)
    adv.push({
      method: 'freeze_dry',
      confidence: 0.8,
      why: ['Zero added water to base', 'Great for delicate aromatics'],
      targets: { brix_deg: brix, pH: pH, aw_max: 0.3 },
      packaging: ['FD jar with desiccant', 'FOIL pouch + nitrogen'],
      storage: 'ambient',
      shelf_life_hint: 'Ambient; protect from moisture uptake',
      impact_on_gelato: { 
        aroma_retention: 'high', 
        color_browning: 'low', 
        notes: ['Boosts TS without PAC; may need sucrose/dextrose adjustment'] 
      }
    });

    return adv.sort((a, b) => b.confidence - a.confidence);
  }
}

export const pasteAdvisorService = new PasteAdvisorService();