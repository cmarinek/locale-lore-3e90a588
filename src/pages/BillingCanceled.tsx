import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BillingCanceled: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center"
              >
                <XCircle className="h-8 w-8 text-orange-500" />
              </motion.div>
              <CardTitle className="text-2xl">Payment Canceled</CardTitle>
              <CardDescription>
                Your payment was not completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">What Happened?</h3>
                <p className="text-sm text-muted-foreground">
                  You canceled the payment process before it was completed. No charges were made to your account.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Still Want to Contribute?</h3>
                <p className="text-sm text-muted-foreground">
                  Join our community of contributors for just $1.97/month and unlock unlimited fact submissions, exclusive features, and more.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="w-full">
                  <Link to="/billing">
                    Try Again
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};
