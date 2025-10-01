import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Beaker, 
  Calculator, 
  Sparkles, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2 
} from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal before
    const hasSeenWelcome = localStorage.getItem('meetha-pitara-welcome-seen');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('meetha-pitara-welcome-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            Welcome to MeethaPitara Calculator
          </DialogTitle>
          <DialogDescription>
            Professional gelato & ice cream formulation system powered by AI
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="quick-start" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
            <TabsTrigger value="disclaimers">Important Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-start" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                What This Calculator Does
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p><strong>Formulate Recipes:</strong> Create balanced ice cream, gelato, and sorbet recipes</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p><strong>Optimize Parameters:</strong> Hit target ranges for sweetness, texture, and body</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p><strong>AI-Powered Tools:</strong> Generate paste recipes, suggest pairings, reverse-engineer formulas</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p><strong>Cost Analysis:</strong> Calculate production costs per batch and liter</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-3">
                  <div className="flex items-start gap-2">
                    <Calculator className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Recipe Calculator</h4>
                      <p className="text-xs text-muted-foreground">Build recipes with real-time validation</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">AI Flavour Engine</h4>
                      <p className="text-xs text-muted-foreground">Multi-ingredient optimization</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-start gap-2">
                    <Beaker className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Paste Studio</h4>
                      <p className="text-xs text-muted-foreground">Generate scientific paste recipes with AI</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Flavor Pairings</h4>
                      <p className="text-xs text-muted-foreground">Smart ingredient suggestions</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Typical Workflow</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Select product type (Ice Cream, Gelato, or Sorbet)</li>
                <li>Add ingredients and amounts</li>
                <li>Check if parameters meet targets (green = good!)</li>
                <li>Use AI suggestions to optimize if needed</li>
                <li>Save recipe and export for production</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="glossary" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">SP - Sweetness Power</h3>
                <p className="text-sm text-muted-foreground">
                  Relative sweetness compared to sucrose (table sugar = 1.00). Higher SP = sweeter taste.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Fructose: 1.73 (very sweet)</Badge>
                  <Badge variant="outline">Sucrose: 1.00 (baseline)</Badge>
                  <Badge variant="outline">Lactose: 0.16 (mild)</Badge>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Target: 14-18 for ice cream, 12-16 for gelato
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">PAC - Anti-freezing Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  Measures how much sugars lower the freezing point. Higher PAC = softer texture at same temperature.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Dextrose/Fructose: 1.90 (high PAC → soft)</Badge>
                  <Badge variant="outline">Sucrose: 1.00 (medium)</Badge>
                  <Badge variant="outline">Lactose: 1.00 (low PAC → firm)</Badge>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Target: 22-33 typical range (adjust based on serving temperature)
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">MSNF - Milk Solids Non-Fat</h3>
                <p className="text-sm text-muted-foreground">
                  Protein + lactose + minerals from milk. Adds body, improves mouthfeel, and provides nutrition.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Target: 9-12% for ice cream, 7-9% for gelato
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Total Solids (TS)</h3>
                <p className="text-sm text-muted-foreground">
                  Everything except water: sugars + fat + MSNF + stabilizers + other solids.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Target: 36-42% typical for ice cream (higher = denser, richer)
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Overrun</h3>
                <p className="text-sm text-muted-foreground">
                  % volume increase from air incorporation during churning. Batch freezers: 40-60%. Continuous: 80-120%.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disclaimers" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4 bg-warning-light border-warning">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-warning-foreground">Scientific Accuracy</h3>
                    <div className="text-sm text-warning-foreground/90 space-y-1">
                      <p>• <strong>SP/PAC Calculations:</strong> Based on peer-reviewed coefficients (Goff & Hartel, 2013)</p>
                      <p>• <strong>Temperature Models:</strong> Heuristic approximations - calibrate with your batch data</p>
                      <p>• <strong>Pairing Suggestions:</strong> Based on culinary principles, not molecular analysis (GC-MS)</p>
                      <p>• <strong>Always test in your production environment</strong> before scaling up</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-info-light border-info">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-5 w-5 text-info-foreground flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-info-foreground">Learning Resources</h3>
                    <div className="text-sm text-info-foreground/90 space-y-1">
                      <p><strong>Recommended Reading:</strong></p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><em>Ice Cream (7th ed.)</em> - Goff & Hartel (textbook)</li>
                        <li>MEC3 Technical Bulletins (industry standards)</li>
                        <li>Carpigiani Gelato University courses (practical training)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card-secondary border-border">
                <div className="space-y-2">
                  <h3 className="font-semibold">Data Privacy & Usage</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Your recipes are stored locally in your browser</p>
                    <p>• AI features use Google Gemini (data processed on Google servers)</p>
                    <p>• No personal data is collected without your consent</p>
                    <p>• Export functions do not send data to external servers</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card-secondary border-border">
                <div className="space-y-2">
                  <h3 className="font-semibold">Terms of Use</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• This tool is for educational and professional recipe development</p>
                    <p>• Results are estimates - always validate in your production environment</p>
                    <p>• Not responsible for batch failures due to equipment, ingredients, or process variations</p>
                    <p>• Commercial use permitted for internal recipe development</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full md:w-auto">
            Got it! Start Calculating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
