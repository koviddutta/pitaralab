import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MobileTabsWrapperProps {
  children: ReactNode;
  isMobile: boolean;
}

export default function MobileTabsWrapper({ children, isMobile }: MobileTabsWrapperProps) {
  if (!isMobile) return <>{children}</>;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
}