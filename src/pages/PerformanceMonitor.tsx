/**
 * Performance Monitor Page
 * Accessible route for viewing performance dashboard
 */

import React from 'react';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PerformanceMonitor: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Performance Monitor - LocaleLore</title>
        <meta name="description" content="Real-time performance metrics and optimization statistics" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <PerformanceDashboard />
        </div>
      </div>
    </>
  );
};

export default PerformanceMonitor;
