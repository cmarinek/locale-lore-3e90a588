
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  metrics: Record<string, number>;
  dateRange: { start: string; end: string };
}

interface InsightsEngineProps {
  timeRange: string;
}

export const InsightsEngine: React.FC<InsightsEngineProps> = ({ timeRange }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [timeRange]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Fetch analytics data and generate AI-powered insights
      const response = await fetch(`/api/analytics/insights?timeRange=${timeRange}`);
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string, impact: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className={`h-5 w-5 ${impact === 'high' ? 'text-green-600' : 'text-blue-600'}`} />;
      case 'warning':
        return <AlertTriangle className={`h-5 w-5 ${impact === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trend':
        return <TrendingDown className="h-5 w-5 text-purple-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
          <p className="text-muted-foreground">Actionable recommendations based on your data</p>
        </div>
        <Badge variant="outline">{insights.length} insights found</Badge>
      </div>

      {/* Key Insights Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {['opportunity', 'warning', 'success', 'trend'].map((type) => {
          const count = insights.filter(i => i.type === type).length;
          const highImpact = insights.filter(i => i.type === type && i.impact === 'high').length;
          
          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getInsightIcon(type, 'medium')}
                  <div>
                    <p className="font-medium capitalize">{type}s</p>
                    <p className="text-2xl font-bold">{count}</p>
                    {highImpact > 0 && (
                      <p className="text-sm text-muted-foreground">{highImpact} high impact</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Insights */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type, insight.impact)}
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="outline">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Key Metrics */}
              {Object.keys(insight.metrics).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Metrics</h4>
                  <div className="grid gap-2 md:grid-cols-3">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insight.actionable && insight.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommended Actions</h4>
                  <div className="space-y-2">
                    {insight.recommendations.map((recommendation, index) => (
                      <Alert key={index}>
                        <AlertDescription>{recommendation}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                Analysis period: {new Date(insight.dateRange.start).toLocaleDateString()} - {new Date(insight.dateRange.end).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Insights State */}
      {insights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights available</h3>
            <p className="text-muted-foreground">
              We need more data to generate meaningful insights. Check back in a few days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
