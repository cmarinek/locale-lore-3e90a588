import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { 
  COMPONENT_TRANSLATION_STATUS, 
  getTranslationStats, 
  getUntranslatedComponents,
  getComponentsByCategory 
} from '@/utils/component-translation-status';
import { useTranslation } from 'react-i18next';

export const TranslationStatusDashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  const stats = getTranslationStats();
  const untranslated = getUntranslatedComponents();
  const categories = getComponentsByCategory();

  const getStatusIcon = (percentage: number) => {
    if (percentage === 100) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (percentage > 0) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage === 100) return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    if (percentage > 0) return <Badge variant="secondary">Partial ({percentage}%)</Badge>;
    return <Badge variant="outline">Not Started</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallPercentage}%</div>
            <Progress value={stats.overallPercentage} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.translated}</div>
            <p className="text-xs text-muted-foreground">out of {stats.total} components</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.partiallyTranslated}</div>
            <p className="text-xs text-muted-foreground">components in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.untranslated}</div>
            <p className="text-xs text-muted-foreground">components to translate</p>
          </CardContent>
        </Card>
      </div>

      {/* Components by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(categories).map(([category, components]) => {
          if (components.length === 0) return null;
          
          const categoryStats = {
            total: components.length,
            completed: components.filter(c => c.translated).length,
            percentage: Math.round(
              components.reduce((sum, c) => sum + c.translationPercentage, 0) / components.length
            )
          };

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{category} Components</CardTitle>
                  <Badge variant={categoryStats.percentage === 100 ? "default" : "secondary"}>
                    {categoryStats.completed}/{categoryStats.total}
                  </Badge>
                </div>
                <Progress value={categoryStats.percentage} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {components.map((component) => (
                    <div key={component.name} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(component.translationPercentage)}
                        <span className="font-medium">{component.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(component.translationPercentage)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Actions */}
      {untranslated.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Components to Translate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {untranslated.slice(0, 10).map((component) => (
                <div key={component.name} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-muted-foreground">{component.path}</div>
                    {component.notes && (
                      <div className="text-xs text-yellow-600 mt-1">{component.notes}</div>
                    )}
                  </div>
                  {getStatusBadge(component.translationPercentage)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};