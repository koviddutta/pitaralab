import { useMemo, useState } from 'react';
import { Plus, Trash2, Beaker, Package, FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { pasteAdvisorService } from '@/services/pasteAdvisorService';
import { getSeedIngredients } from '@/lib/ingredientLibrary';
import { useToast } from '@/hooks/use-toast';
import type { PasteFormula, PreservationAdvice, PasteComponent } from '@/types/paste';
import type { IngredientData } from '@/types/ingredients';

export default function PasteStudio() {
  const { toast } = useToast();
  const library = getSeedIngredients();
  
  const [paste, setPaste] = useState<PasteFormula>(() => ({
    id: crypto.randomUUID(), 
    name: 'New Paste', 
    category: 'mixed',
    components: [], 
    batch_size_g: 1000,
    water_pct: 0, 
    sugars_pct: 0, 
    fat_pct: 0, 
    msnf_pct: 0, 
    other_solids_pct: 0,
    lab: { brix_deg: undefined, pH: undefined }
  }));
  
  const [advice, setAdvice] = useState<PreservationAdvice[] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PreservationAdvice | null>(null);

  // Recompute paste composition from components (simple weighted average)
  const composed = useMemo(() => {
    const tot = paste.components.reduce((a, c) => a + c.grams, 0) || 1;
    const w = (k: 'water_pct' | 'sugars_pct' | 'fat_pct' | 'msnf_pct' | 'other_solids_pct') =>
      paste.components.reduce((s, c) => s + (c[k] || 0) * c.grams / tot, 0);
    
    return {
      ...paste,
      water_pct: w('water_pct'),
      sugars_pct: w('sugars_pct'),
      fat_pct: w('fat_pct'),
      msnf_pct: w('msnf_pct'),
      other_solids_pct: w('other_solids_pct')
    };
  }, [paste]);

  const runAdvisor = () => {
    const newAdvice = pasteAdvisorService.advise(composed, { 
      ambientPreferred: true, 
      particulate_mm: 3, 
      cleanLabel: true 
    });
    setAdvice(newAdvice);
    toast({
      title: "Preservation Analysis Complete",
      description: `Found ${newAdvice.length} preservation methods for your paste.`
    });
  };

  const addComponent = () => {
    const newComponent: PasteComponent = {
      id: crypto.randomUUID(),
      name: '',
      grams: 100,
      water_pct: 0,
      sugars_pct: 0,
      fat_pct: 0,
      msnf_pct: 0,
      other_solids_pct: 0
    };
    setPaste(p => ({
      ...p,
      components: [...p.components, newComponent]
    }));
  };

  const updateComponent = (id: string, updates: Partial<PasteComponent>) => {
    setPaste(p => ({
      ...p,
      components: p.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const removeComponent = (id: string) => {
    setPaste(p => ({
      ...p,
      components: p.components.filter(c => c.id !== id)
    }));
  };

  const loadFromIngredient = (componentId: string, ingredientName: string) => {
    const ingredient = library.find(i => i.name === ingredientName);
    if (ingredient) {
      updateComponent(componentId, {
        name: ingredient.name,
        water_pct: ingredient.water_pct,
        sugars_pct: ingredient.sugars_pct || 0,
        fat_pct: ingredient.fat_pct,
        msnf_pct: ingredient.msnf_pct || 0,
        other_solids_pct: ingredient.other_solids_pct || 0
      });
    }
  };

  const exportAsIngredient = () => {
    toast({
      title: "Export Feature",
      description: "This feature will integrate with your ingredient database in the next update.",
      variant: "default"
    });
  };

  const generateFDVersion = () => {
    toast({
      title: "FD Powder Generation",
      description: "Freeze-dried powder variant will be generated with optimized water content.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paste Studio</h1>
            <p className="text-muted-foreground mt-1">Formulate → Preserve → Use authentic Indian flavor pastes</p>
          </div>
          <Button onClick={runAdvisor} className="bg-gradient-primary text-primary-foreground shadow-elegant">
            <Beaker className="h-4 w-4 mr-2" />
            Run Preservation Advisor
          </Button>
        </div>

        <Tabs defaultValue="formulation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="formulation">Formulation</TabsTrigger>
            <TabsTrigger value="preservation">Preservation</TabsTrigger>
            <TabsTrigger value="sop">SOP</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="formulation" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Paste Formulation</h3>
                  <p className="text-sm text-muted-foreground">Build your paste from sub-ingredients</p>
                </div>
                <Button onClick={addComponent} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>
              </div>

              {/* Paste Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="paste-name">Paste Name</Label>
                  <Input
                    id="paste-name"
                    value={paste.name}
                    onChange={(e) => setPaste(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Gulab Jamun Paste"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={paste.category} onValueChange={(value: any) => setPaste(p => ({ ...p, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="confection">Confection</SelectItem>
                      <SelectItem value="spice">Spice</SelectItem>
                      <SelectItem value="nut">Nut</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch-size">Batch Size (g)</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={paste.batch_size_g}
                    onChange={(e) => setPaste(p => ({ ...p, batch_size_g: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Components Table */}
              <div className="space-y-4">
                {paste.components.map((component) => (
                  <Card key={component.id} className="p-4 bg-card-secondary">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
                      <div className="md:col-span-2">
                        <Label>Ingredient</Label>
                        <Select value={component.name} onValueChange={(value) => loadFromIngredient(component.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {library.map(ing => (
                              <SelectItem key={ing.id} value={ing.name}>{ing.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Grams</Label>
                        <Input
                          type="number"
                          value={component.grams}
                          onChange={(e) => updateComponent(component.id, { grams: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Water %</Label>
                        <Input
                          type="number"
                          value={component.water_pct}
                          onChange={(e) => updateComponent(component.id, { water_pct: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Sugars %</Label>
                        <Input
                          type="number"
                          value={component.sugars_pct || 0}
                          onChange={(e) => updateComponent(component.id, { sugars_pct: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Fat %</Label>
                        <Input
                          type="number"
                          value={component.fat_pct}
                          onChange={(e) => updateComponent(component.id, { fat_pct: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>MSNF %</Label>
                        <Input
                          type="number"
                          value={component.msnf_pct || 0}
                          onChange={(e) => updateComponent(component.id, { msnf_pct: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeComponent(component.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Computed Composition */}
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-medium">Computed Composition</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center p-3 bg-card-secondary rounded-lg">
                    <div className="font-medium">Water</div>
                    <div className="text-lg text-primary">{composed.water_pct.toFixed(1)}%</div>
                  </div>
                  <div className="text-center p-3 bg-card-secondary rounded-lg">
                    <div className="font-medium">Sugars</div>
                    <div className="text-lg text-primary">{composed.sugars_pct?.toFixed(1) || '0.0'}%</div>
                  </div>
                  <div className="text-center p-3 bg-card-secondary rounded-lg">
                    <div className="font-medium">Fat</div>
                    <div className="text-lg text-primary">{composed.fat_pct.toFixed(1)}%</div>
                  </div>
                  <div className="text-center p-3 bg-card-secondary rounded-lg">
                    <div className="font-medium">MSNF</div>
                    <div className="text-lg text-primary">{composed.msnf_pct?.toFixed(1) || '0.0'}%</div>
                  </div>
                  <div className="text-center p-3 bg-card-secondary rounded-lg">
                    <div className="font-medium">Total Solids</div>
                    <div className="text-lg text-primary">{(100 - composed.water_pct).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Lab Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="brix">°Brix</Label>
                    <Input
                      id="brix"
                      type="number"
                      step="0.1"
                      value={paste.lab?.brix_deg || ''}
                      onChange={(e) => setPaste(p => ({
                        ...p, 
                        lab: { ...p.lab, brix_deg: e.target.value ? Number(e.target.value) : undefined }
                      }))}
                      placeholder="e.g., 65.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pH">pH</Label>
                    <Input
                      id="pH"
                      type="number"
                      step="0.1"
                      value={paste.lab?.pH || ''}
                      onChange={(e) => setPaste(p => ({
                        ...p, 
                        lab: { ...p.lab, pH: e.target.value ? Number(e.target.value) : undefined }
                      }))}
                      placeholder="e.g., 4.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aw">aw (optional)</Label>
                    <Input
                      id="aw"
                      type="number"
                      step="0.01"
                      value={paste.lab?.aw_est || ''}
                      onChange={(e) => setPaste(p => ({
                        ...p, 
                        lab: { ...p.lab, aw_est: e.target.value ? Number(e.target.value) : undefined }
                      }))}
                      placeholder="e.g., 0.85"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preservation" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preservation Methods</h3>
              
              {!advice ? (
                <div className="text-center py-12">
                  <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Run the Preservation Advisor to get recommendations</p>
                  <Button onClick={runAdvisor} className="bg-gradient-primary">
                    <Beaker className="h-4 w-4 mr-2" />
                    Analyze Preservation Options
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {advice.map((method, i) => (
                    <Card 
                      key={i} 
                      className={`p-4 cursor-pointer transition-all ${
                        selectedMethod?.method === method.method 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-card-secondary'
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                            {method.method.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {(method.confidence * 100).toFixed(0)}% Confidence
                          </Badge>
                          <Badge variant={method.storage === 'ambient' ? 'default' : method.storage === 'frozen' ? 'secondary' : 'outline'}>
                            {method.storage.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Why:</strong> {method.why.join(' • ')}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <strong>Targets:</strong>
                            <div className="text-muted-foreground">
                              {method.targets.brix_deg && `°Bx ≥ ${method.targets.brix_deg} `}
                              {method.targets.pH && `pH ≤ ${method.targets.pH} `}
                              {method.targets.aw_max && `aw ≤ ${method.targets.aw_max} `}
                              {method.targets.particle_mm_max && `Particle ≤ ${method.targets.particle_mm_max}mm`}
                            </div>
                          </div>
                          
                          <div>
                            <strong>Packaging:</strong>
                            <div className="text-muted-foreground">{method.packaging.join(', ')}</div>
                          </div>
                        </div>
                        
                        <div>
                          <strong>Gelato Impact:</strong>
                          <div className="flex gap-4 text-muted-foreground">
                            <span>Aroma: {method.impact_on_gelato.aroma_retention}</span>
                            <span>Browning: {method.impact_on_gelato.color_browning}</span>
                          </div>
                        </div>
                        
                        <div className="text-muted-foreground">
                          <strong>Shelf Life:</strong> {method.shelf_life_hint}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    ⚠️ <strong>Important:</strong> These are guidance recommendations only. All thermal processes must be validated by a qualified process authority for commercial use.
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sop" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Standard Operating Procedure</h3>
              </div>
              
              {!selectedMethod ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a preservation method to generate SOP template</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-lg mb-2">SOP: {selectedMethod.method.toUpperCase()} Process</h4>
                    <p className="text-sm text-muted-foreground">Method: {paste.name} - {selectedMethod.method}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">Process Parameters</h5>
                      <div className="space-y-3">
                        <div>
                          <Label>Fill Temperature (°C)</Label>
                          <Input placeholder="e.g., 85" />
                        </div>
                        <div>
                          <Label>Hold Time (minutes)</Label>
                          <Input placeholder="e.g., 15" />
                        </div>
                        <div>
                          <Label>Cooling Rate (°C/min)</Label>
                          <Input placeholder="e.g., 5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-medium">Quality Control</h5>
                      <div className="space-y-3">
                        <div>
                          <Label>Final pH Target</Label>
                          <Input value={selectedMethod.targets.pH || ''} readOnly />
                        </div>
                        <div>
                          <Label>°Brix Target</Label>
                          <Input value={selectedMethod.targets.brix_deg || ''} readOnly />
                        </div>
                        <div>
                          <Label>Water Activity Target</Label>
                          <Input value={selectedMethod.targets.aw_max || ''} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-3">Packaging & Storage Instructions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h6 className="font-medium mb-2">Recommended Packaging</h6>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedMethod.packaging.map((pkg, i) => (
                            <li key={i}>• {pkg}</li>
                          ))}
                        </ul>
                      </Card>
                      <Card className="p-4">
                        <h6 className="font-medium mb-2">Storage Conditions</h6>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Storage:</strong> {selectedMethod.storage}</p>
                          <p><strong>Shelf Life:</strong> {selectedMethod.shelf_life_hint}</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Export Options</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Save as Ingredient</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add this paste to your ingredient database for use in gelato formulations.
                    </p>
                    <Button onClick={exportAsIngredient} className="w-full bg-success text-success-foreground">
                      <Download className="h-4 w-4 mr-2" />
                      Export to Ingredients DB
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Generate FD Powder Version</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a freeze-dried powder variant for zero water addition to gelato base.
                    </p>
                    <Button onClick={generateFDVersion} variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Generate FD Powder
                    </Button>
                  </Card>
                </div>
                
                {/* Impact Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium">Gelato Base Impact Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    See how this paste affects a standard gelato base at different inclusion rates:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[5, 8, 12].map(percentage => (
                      <Card key={percentage} className="p-4 text-center">
                        <div className="font-medium text-lg mb-2">{percentage}% Inclusion</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Water: +{((composed.water_pct * percentage) / 100).toFixed(1)}%</div>
                          <div>Sugars: +{((composed.sugars_pct || 0) * percentage / 100).toFixed(1)}%</div>
                          <div>Fat: +{((composed.fat_pct * percentage) / 100).toFixed(1)}%</div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3">
                          Auto-balance Base
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}