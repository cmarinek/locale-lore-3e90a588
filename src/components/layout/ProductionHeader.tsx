import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { getProductionReadinessScore, getCriticalIssues } from '@/utils/production-checks';

export const ProductionHeader = () => {
  const score = getProductionReadinessScore();
  const criticalIssues = getCriticalIssues();

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = () => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="bg-card border-b px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium">Production Status</span>
          {getScoreIcon()}
          <span className={`font-semibold ${getScoreColor()}`}>
            {score}% Ready
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {criticalIssues.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalIssues.length} Critical Issue{criticalIssues.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {score >= 80 && (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              Production Ready
            </Badge>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/admin', '_blank')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};