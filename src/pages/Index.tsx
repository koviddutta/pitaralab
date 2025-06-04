
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeCalculator from "@/components/RecipeCalculator";
import BaseRecipeSelector from "@/components/BaseRecipeSelector";
import UnitConverter from "@/components/UnitConverter";
import CostCalculator from "@/components/CostCalculator";
import FlavourEngine from "@/components/FlavourEngine";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            MeethaPitara Recipe Calculator & AI Flavour Engine
          </h1>
          <p className="text-gray-600 text-lg">
            ML-powered recipe development tools with predictive analysis for artisan ice cream makers
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calculator">Recipe Calculator</TabsTrigger>
            <TabsTrigger value="flavour-engine">AI Flavour Engine</TabsTrigger>
            <TabsTrigger value="base-recipes">Base Recipes</TabsTrigger>
            <TabsTrigger value="converter">Unit Converter</TabsTrigger>
            <TabsTrigger value="cost">Cost Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="mt-6">
            <RecipeCalculator />
          </TabsContent>

          <TabsContent value="flavour-engine" className="mt-6">
            <FlavourEngine />
          </TabsContent>

          <TabsContent value="base-recipes" className="mt-6">
            <BaseRecipeSelector />
          </TabsContent>

          <TabsContent value="converter" className="mt-6">
            <UnitConverter />
          </TabsContent>

          <TabsContent value="cost" className="mt-6">
            <CostCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
