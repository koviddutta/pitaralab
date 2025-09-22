import { calcMetrics } from '@/lib/calc';

const I = {
  sucrose: { id:'sucrose', name:'Sucrose', category:'sugar', water_pct:0, sugars_pct:100, fat_pct:0 },
  dextrose:{ id:'dextrose',name:'Dextrose',category:'sugar', water_pct:0, sugars_pct:100, fat_pct:0 },
  milk3:   { id:'milk_3',  name:'Milk 3%', category:'dairy', water_pct:88.7, fat_pct:3, msnf_pct:8.5 },
  cream25: { id:'cream_25',name:'Cream 25%',category:'dairy', water_pct:68.2, fat_pct:25, msnf_pct:6.8 },
  smp:     { id:'smp',     name:'SMP',     category:'dairy', water_pct:3.5,  fat_pct:1, msnf_pct:93 },
  gj_paste:{ id:'gulab_jamun_paste', name:'GJ Paste', category:'flavor',
             water_pct:41.6, sugars_pct:42.52, fat_pct:5.4, msnf_pct:8.1, other_solids_pct:3.38 }
} as any;

describe('metrics', () => {
  it('white base sanity (1kg)', () => {
    const rows = [
      { ing: I.milk3, grams: 650 },
      { ing: I.cream25, grams: 150 },
      { ing: I.smp, grams: 60 },
      { ing: I.sucrose, grams: 120 },
      { ing: I.dextrose, grams: 20 }
    ];
    const m = calcMetrics(rows, { evaporation_pct: 0 });
    expect(m.ts_add_pct).toBeGreaterThan(32);
    expect(m.ts_add_pct).toBeLessThan(46);
    expect(m.fat_pct).toBeGreaterThan(6);
    expect(m.sugars_pct).toBeGreaterThan(16);
    expect(m.sp).toBeGreaterThan(12);
    expect(m.pac).toBeGreaterThan(22);
  });

  it('gulab jamun delight adds solids & bumps PAC', () => {
    const base = [
      { ing: I.milk3, grams: 650 },
      { ing: I.cream25, grams: 150 },
      { ing: I.smp, grams: 60 },
      { ing: I.sucrose, grams: 120 },
      { ing: I.dextrose, grams: 20 }
    ];
    const withGJ = [...base, { ing: I.gj_paste, grams: 80 }];
    const m0 = calcMetrics(base);
    const m1 = calcMetrics(withGJ);
    expect(m1.ts_add_pct).toBeGreaterThan(m0.ts_add_pct);
    expect(m1.pac).toBeGreaterThan(m0.pac);
  });
});