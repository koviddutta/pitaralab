import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, Wrench, Database } from 'lucide-react';

interface MobileTabsWrapperProps {
  children: React.ReactNode;
  defaultValue?: string;
}

const MobileTabsWrapper: React.FC<MobileTabsWrapperProps> = ({ 
  children, 
  defaultValue = "recipe" 
}) => {
  return (
    <div className="w-full">
      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto gap-1 bg-card-secondary/50 backdrop-blur-sm">
          <TabsTrigger 
            value="recipe" 
            className="text-xs px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth flex flex-col gap-1"
          >
            <Brain className="h-4 w-4" />
            Recipe
          </TabsTrigger>
          <TabsTrigger 
            value="targets" 
            className="text-xs px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth flex flex-col gap-1"
          >
            <Target className="h-4 w-4" />
            Targets
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="text-xs px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth flex flex-col gap-1"
          >
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="text-xs px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-smooth flex flex-col gap-1"
          >
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
      
      {/* Mobile navigation help */}
      <Card className="mt-4 gradient-card border border-border/50">
        <CardContent className="p-3">
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• 👆 Tap tabs above to navigate between sections</p>
            <p>• 📱 Optimized for mobile touch interaction</p>
            <p>• 🔄 All data syncs across tabs automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileTabsWrapper;