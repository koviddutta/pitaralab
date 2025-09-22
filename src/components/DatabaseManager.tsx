
import React, { useState, useEffect } from 'react';
import { Database, Plus, Download, Upload, Trash2, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { databaseService, IngredientData as LegacyIngredientData } from '@/services/databaseService';
import { mlService } from '@/services/mlService';
import { getSeedIngredients } from '@/lib/ingredientLibrary';
import { IngredientData as NewIngredientData } from '@/types/ingredients';

const DatabaseManager = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'all'|'dairy'|'sugar'|'fruit'|'stabilizer'|'flavor'|'fat'|'other'>('all');
  const [ingredients, setIngredients] = useState<LegacyIngredientData[]>([]);
  const [newIngredients, setNewIngredients] = useState<NewIngredientData[]>(getSeedIngredients());
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'dairy',
    pac: 0,
    pod: 0,
    afp: 0,
    fat: 0,
    msnf: 0,
    cost: 0,
    confidence: 'medium' as 'high' | 'medium' | 'low',
    flavorNotes: ['']
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [modelPerformance, setModelPerformance] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIngredients(databaseService.getIngredients());
    setPerformanceMetrics(databaseService.getPerformanceMetrics());
    setModelPerformance(mlService.getModelPerformance());
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Ingredient name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const ingredient = databaseService.addIngredient({
        ...newIngredient,
        flavorNotes: newIngredient.flavorNotes.filter(note => note.trim())
      });
      
      setIngredients(prev => [...prev, ingredient]);
      setNewIngredient({
        name: '',
        category: 'dairy',
        pac: 0,
        pod: 0,
        afp: 0,
        fat: 0,
        msnf: 0,
        cost: 0,
        confidence: 'medium',
        flavorNotes: ['']
      });
      setIsAddingIngredient(false);
      
      toast({
        title: "Ingredient Added",
        description: `${ingredient.name} has been added to the database`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIngredient = (id: string, updates: Partial<LegacyIngredientData>) => {
    const updated = databaseService.updateIngredient(id, updates);
    if (updated) {
      setIngredients(prev => prev.map(ing => ing.id === id ? updated : ing));
      setEditingId(null);
      toast({
        title: "Ingredient Updated",
        description: "Changes have been saved successfully",
      });
    }
  };

  const exportData = () => {
    const data = databaseService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meetha-pitara-database.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Database Exported",
      description: "Database has been exported successfully",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          databaseService.importData(data);
          loadData();
          toast({
            title: "Database Imported",
            description: "Database has been imported successfully",
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to import database file",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const categories = ['all', 'dairy', 'sugar', 'fruit', 'stabilizer', 'flavor', 'fat', 'other'];
  const filteredNewIngredients = newIngredients.filter(i => tab === 'all' ? true : i.category === tab);

  return (
    <div className="space-y-6">
      {/* Performance Dashboard */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Database Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Ingredients:</span>
                <Badge variant="secondary">{ingredients.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Training Data:</span>
                <Badge variant="secondary">{performanceMetrics?.trainingDataSize || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recipe History:</span>
                <Badge variant="secondary">{performanceMetrics?.totalRecipes || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">ML Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Accuracy:</span>
                <Badge variant={modelPerformance?.accuracy > 0.8 ? "default" : "secondary"}>
                  {((modelPerformance?.accuracy || 0) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Predictions:</span>
                <Badge variant="secondary">{modelPerformance?.totalPredictions || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Model Version:</span>
                <Badge variant="outline">{modelPerformance?.modelVersion || 'N/A'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">High Confidence:</span>
                <Badge variant="default">
                  {ingredients.filter(ing => ing.confidence === 'high').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Success Rate:</span>
                <Badge variant="secondary">
                  {((performanceMetrics?.avgSuccessScore || 0) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Ingredient Database Management
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingIngredient(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-8">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-4 space-y-4">
              {/* New Ingredient Schema Display */}
              <div className="grid gap-2">
                <h3 className="font-semibold">Enhanced Ingredient Library ({filteredNewIngredients.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredNewIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{ingredient.name}</span>
                        <div className="text-xs text-gray-500 flex gap-4">
                          <span>Water: {ingredient.water_pct}%</span>
                          {ingredient.sugars_pct && <span>Sugar: {ingredient.sugars_pct}%</span>}
                          <span>Fat: {ingredient.fat_pct}%</span>
                          {ingredient.msnf_pct && <span>MSNF: {ingredient.msnf_pct}%</span>}
                          {ingredient.other_solids_pct && <span>Other: {ingredient.other_solids_pct}%</span>}
                        </div>
                        {ingredient.category === 'fruit' && ingredient.brix_estimate && (
                          <div className="text-xs text-purple-600">Brix: {ingredient.brix_estimate}°</div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">{ingredient.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legacy Ingredients */}
              <div className="space-y-2">
                <h3 className="font-semibold">Legacy Database ({ingredients.length})</h3>
            
            {/* Add New Ingredient Form */}
            {isAddingIngredient && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newIngredient.name}
                        onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ingredient name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newIngredient.category} onValueChange={(value) => 
                        setNewIngredient(prev => ({ ...prev, category: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (%)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={newIngredient.fat}
                        onChange={(e) => setNewIngredient(prev => ({ ...prev, fat: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">Cost (₹/kg)</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={newIngredient.cost}
                        onChange={(e) => setNewIngredient(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddIngredient}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingIngredient(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredients List */}
            <div className="space-y-2">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 grid md:grid-cols-6 gap-4 items-center">
                    <div>
                      <span className="font-medium">{ingredient.name}</span>
                      <div className="text-sm text-gray-500">{ingredient.category}</div>
                    </div>
                    <div className="text-sm">
                      <div>Fat: {ingredient.fat}%</div>
                      <div>MSNF: {ingredient.msnf}%</div>
                    </div>
                    <div className="text-sm">
                      <div>PAC: {ingredient.pac}%</div>
                      <div>POD: {ingredient.pod}%</div>
                    </div>
                    <div className="text-sm">
                      <div>Cost: ₹{ingredient.cost}/kg</div>
                    </div>
                    <div>
                      <Badge variant={
                        ingredient.confidence === 'high' ? 'default' :
                        ingredient.confidence === 'medium' ? 'secondary' : 'outline'
                      }>
                        {ingredient.confidence}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {ingredient.flavorNotes.slice(0, 2).map((note, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(ingredient.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManager;
