
import React from 'react';
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductType } from '../ProductSelector';
import { productParametersService } from '@/services/productParametersService';

interface ProductAnalysisProps {
  productType: ProductType;
  recipe: { [key: string]: number };
}

const ProductAnalysis = ({ productType, recipe }: ProductAnalysisProps) => {
  const validation = productParametersService.validateRecipeForProduct(recipe, productType);
  const recommendations = productParametersService.generateProductRecommendations(productType, recipe);
  const pacSp = productParametersService.calculateRecipeAfpSp(recipe);
  const parameters = productParametersService.getProductParameters(productType);

  const getProductColor = (productType: ProductType) => {
    switch (productType) {
      case 'ice-cream': return 'blue';
      case 'gelato': return 'purple';
      case 'sorbet': return 'pink';
    }
  };

  const color = getProductColor(productType);

  return (
    <Card className={`border-${color}-200 bg-gradient-to-r from-${color}-50 to-${color}-100`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-${color}-800`}>
          <Target className="h-5 w-5" />
          {productType.charAt(0).toUpperCase() + productType.slice(1)} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Status */}
        <div className="flex items-center gap-2 mb-3">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {validation.isValid ? 'Recipe Compliant' : 'Adjustments Needed'}
          </span>
        </div>

        {/* Parameter Ranges */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Target Ranges</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Sugar:</span>
              <span>{parameters.sugar[0]}-{parameters.sugar[1]}%</span>
            </div>
            <div className="flex justify-between">
              <span>Fat:</span>
              <span>{parameters.fats[0]}-{parameters.fats[1]}%</span>
            </div>
            <div className="flex justify-between">
              <span>MSNF:</span>
              <span>{parameters.msnf[0]}-{parameters.msnf[1]}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Solids:</span>
              <span>{parameters.totalSolids[0]}-{parameters.totalSolids[1]}%</span>
            </div>
          </div>
        </div>

        {/* PAC and SP Values */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Calculated Values</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>PAC (aka AFP):</span>
              <Badge variant="outline">{pacSp.afp.toFixed(2)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>SP:</span>
              <Badge variant="outline">{pacSp.sp.toFixed(2)}</Badge>
            </div>
          </div>
        </div>

        {/* Violations */}
        {validation.violations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-red-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Issues Found
            </h4>
            <div className="space-y-1">
              {validation.violations.map((violation, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {violation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Recommendations
          </h4>
          <div className="space-y-1">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={index} className={`text-xs text-${color}-700 bg-${color}-50 p-2 rounded`}>
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        {/* Product-Specific Parameters */}
        {productType !== 'sorbet' && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Process Parameters</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {parameters.churningSpeed && (
                <div className="flex justify-between">
                  <span>Churning:</span>
                  <span>{parameters.churningSpeed[0]}-{parameters.churningSpeed[1]} RPM</span>
                </div>
              )}
              {parameters.servingTemp && (
                <div className="flex justify-between">
                  <span>Serving:</span>
                  <span>{parameters.servingTemp[0]}°C to {parameters.servingTemp[1]}°C</span>
                </div>
              )}
              {parameters.overrun && (
                <div className="flex justify-between">
                  <span>Overrun:</span>
                  <span>{parameters.overrun[0]}-{parameters.overrun[1]}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductAnalysis;
