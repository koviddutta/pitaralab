
import React from 'react';
import { IceCreamCone, Calculator, BookOpen, ArrowRightLeft, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecipeCalculator from '@/components/RecipeCalculator';
import BaseRecipeSelector from '@/components/BaseRecipeSelector';
import UnitConverter from '@/components/UnitConverter';
import CostCalculator from '@/components/CostCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
              <IceCreamCone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Gelato & Ice Cream Calculator
              </h1>
              <p className="text-gray-600 text-sm">Professional recipe scaling and cost management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Perfect Your Frozen Dessert Recipes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional tools for ice cream and gelato makers. Scale recipes, convert units, 
              manage costs, and access proven base recipes from industry experts.
            </p>
          </div>

          {/* Feature Cards Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-3">
                <Calculator className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Recipe Scaling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">
                  Scale recipes up or down for different batch sizes with precision
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-3">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Base Recipes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">
                  Access professional ice cream, gelato, and sorbet base recipes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-3">
                <ArrowRightLeft className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Unit Converter</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">
                  Convert between metric and imperial units for accurate measurements
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-3">
                <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">
                  Calculate ingredient costs and optimize pricing strategies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Calculator Interface */}
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Recipe Scaling</span>
                <span className="sm:hidden">Scale</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Base Recipes</span>
                <span className="sm:hidden">Recipes</span>
              </TabsTrigger>
              <TabsTrigger value="converter" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Unit Converter</span>
                <span className="sm:hidden">Convert</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Cost Calculator</span>
                <span className="sm:hidden">Costs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="mt-0">
              <RecipeCalculator />
            </TabsContent>

            <TabsContent value="recipes" className="mt-0">
              <BaseRecipeSelector />
            </TabsContent>

            <TabsContent value="converter" className="mt-0">
              <UnitConverter />
            </TabsContent>

            <TabsContent value="costs" className="mt-0">
              <CostCalculator />
            </TabsContent>
          </Tabs>

          {/* Tips Section */}
          <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <IceCreamCone className="h-5 w-5 text-pink-600" />
              Pro Tips for Perfect Results
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-pink-600 mb-2">Temperature Control</h4>
                <p>Gelato is served at -12°C to -14°C, while ice cream is served at -18°C to -20°C for optimal texture and flavor release.</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">Scaling Considerations</h4>
                <p>When scaling recipes, stabilizers and emulsifiers may not scale linearly. Adjust these ingredients carefully for best results.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Cost Management</h4>
                <p>Premium ingredients can justify higher prices. Factor in labor, overhead, and packaging when calculating final pricing.</p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 mb-2">Quality Control</h4>
                <p>Consistency in measurements and timing is crucial. Use digital scales and thermometers for professional results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
