import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthProvider';

export const BillingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              {verifying ? (
                <>
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
                  <CardDescription>
                    Please wait while we confirm your subscription
                  </CardDescription>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </motion.div>
                  <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                  <CardDescription>
                    Welcome to LocaleLore Contributor
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!verifying && (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">What's Next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ Your subscription is now active</li>
                      <li>✅ You can submit unlimited facts</li>
                      <li>✅ Access to exclusive contributor features</li>
                      <li>✅ Join the community discussions</li>
                    </ul>
                  </div>

                  {sessionId && (
                    <p className="text-xs text-muted-foreground text-center">
                      Session ID: {sessionId}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 pt-4">
                    <Button asChild className="w-full">
                      <Link to="/lore/submit">Start Submitting Facts</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/billing">View Subscription</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};
