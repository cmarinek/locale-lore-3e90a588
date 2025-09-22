import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ExternalLink, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MapTokenMissing: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <Key className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Mapbox Token Required</h2>
          <p className="text-muted-foreground text-sm mb-4">
            A Mapbox API token is required to display the interactive map. 
            This is a free service for most usage levels.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Quick Setup
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Visit <a 
                href="https://account.mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
              >
                Mapbox Account <ExternalLink className="w-3 h-3" />
              </a></li>
              <li>2. Create a free account or sign in</li>
              <li>3. Get your public access token</li>
              <li>4. Add it to your project environment</li>
            </ol>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>For developers:</strong> Add one of these environment variables:
            </p>
            <code className="block bg-muted p-2 rounded text-xs">
              MAPBOX_PUBLIC_TOKEN=pk.your_token_here<br/>
              MAPBOX_TOKEN=pk.your_token_here<br/>
              MAPBOX_ACCESS_TOKEN=pk.your_token_here
            </code>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Retry Connection
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
};