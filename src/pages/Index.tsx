

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeCalculator from "@/components/RecipeCalculator";
import BaseRecipeSelector from "@/components/BaseRecipeSelector";
import UnitConverter from "@/components/UnitConverter";
import CostCalculator from "@/components/CostCalculator";
import FlavourEngine from "@/components/FlavourEngine";
import MobileRecipeInput from "@/components/MobileRecipeInput";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Monitor } from "lucide-react";
import { migratePinProfiles } from "@/lib/migratePinProfiles";

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initialize migrations
    migratePinProfiles();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileRecipeCreated = (recipe: { name: string; ingredients: any[] }) => {
    console.log('Mobile recipe created:', recipe);
    // Here you could switch to the calculator tab and populate it with the recipe
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="text-center mb-4 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isMobile ? (
              <Smartphone className="h-6 w-6 text-gray-600" />
            ) : (
              <Monitor className="h-6 w-6 text-gray-600" />
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              MeethaPitara Recipe Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-lg px-4">
            ML-powered recipe development tools with predictive analysis for artisan ice cream makers
          </p>
          {isMobile && (
            <Card className="mt-4 mx-4">
              <CardContent className="p-3">
                <p className="text-xs text-blue-600">
                  📱 Mobile-optimized interface active. Swipe through tabs for the best experience.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} ${isMobile ? 'text-xs' : ''}`}>
            <TabsTrigger value="calculator" className={isMobile ? 'px-1' : ''}>
              {isMobile ? 'Calculator' : 'Recipe Calculator'}
            </TabsTrigger>
            <TabsTrigger value="flavour-engine" className={isMobile ? 'px-1' : ''}>
              {isMobile ? 'AI Engine' : 'AI Flavour Engine'}
            </TabsTrigger>
            {isMobile && (
              <TabsTrigger value="mobile-input" className="px-1">
                Quick Add
              </TabsTrigger>
            )}
            {!isMobile && (
              <>
                <TabsTrigger value="base-recipes">Base Recipes</TabsTrigger>
                <TabsTrigger value="converter">Unit Converter</TabsTrigger>
                <TabsTrigger value="cost">Cost Calculator</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="calculator" className="mt-4 md:mt-6">
            <RecipeCalculator />
          </TabsContent>

          <TabsContent value="flavour-engine" className="mt-4 md:mt-6">
            <FlavourEngine />
          </TabsContent>

          {isMobile && (
            <TabsContent value="mobile-input" className="mt-4">
              <MobileRecipeInput onRecipeCreated={handleMobileRecipeCreated} />
            </TabsContent>
          )}

          {!isMobile && (
            <>
              <TabsContent value="base-recipes" className="mt-6">
                <BaseRecipeSelector />
              </TabsContent>

              <TabsContent value="converter" className="mt-6">
                <UnitConverter />
              </TabsContent>

              <TabsContent value="cost" className="mt-6">
                <CostCalculator />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Mobile-specific navigation help */}
        {isMobile && (
          <Card className="mt-6 mx-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Mobile Features:</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• 📱 Touch-optimized ingredient input with quick adjustments</p>
                <p>• 🎤 Voice input for hands-free recipe creation (Quick Add tab)</p>
                <p>• 📸 Photo recognition for ingredient detection (coming soon)</p>
                <p>• 🔄 Real-time parameter evaluation and validation</p>
                <p>• 📊 Mobile-friendly charts and nutritional analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;

