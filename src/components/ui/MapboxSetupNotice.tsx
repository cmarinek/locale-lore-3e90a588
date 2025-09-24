import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, Key, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MapboxSetupNotice: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Alert className="border-orange-200 bg-orange-50">
        <Key className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Mapbox Setup Required</AlertTitle>
        <AlertDescription className="text-orange-700 mt-2">
          <div className="space-y-4">
            <p>
              To enable the interactive map feature, you need to configure your Mapbox public token.
              This is not a payment issue - it's a one-time setup step.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Get your Mapbox public token from{' '}
                  <a 
                    href="https://mapbox.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    mapbox.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to Edge Functions → Environment Variables</li>
                <li>Add a new secret named: <code className="bg-gray-100 px-1 rounded">MAPBOX_PUBLIC_TOKEN</code></li>
                <li>Paste your Mapbox public token as the value</li>
                <li>Save and refresh this page</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://mapbox.com/', '_blank')}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Get Mapbox Token <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Refresh Page
              </Button>
            </div>

            <p className="text-xs text-orange-600">
              <strong>Note:</strong> Mapbox offers a generous free tier that's perfect for development and small applications.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};