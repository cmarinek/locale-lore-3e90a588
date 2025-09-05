import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Download, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const deletionReasons = [
  { value: 'privacy', label: 'Privacy concerns' },
  { value: 'not_useful', label: 'App not useful anymore' },
  { value: 'too_many_emails', label: 'Too many emails' },
  { value: 'found_alternative', label: 'Found alternative service' },
  { value: 'temporary', label: 'Temporary break' },
  { value: 'other', label: 'Other reason' },
];

interface DataDeletionPanelProps {
  onRequestDeletion: (reason?: string, feedback?: string) => Promise<void>;
  loading: boolean;
}

export const DataDeletionPanel = ({ onRequestDeletion, loading }: DataDeletionPanelProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const auth = useAuth();
  const { toast } = useToast();

  const handleAccountDeletion = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "DELETE MY ACCOUNT" to confirm.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      // Use the provided onRequestDeletion function
      await onRequestDeletion(reason, feedback);
      
      // Clear local data
      localStorage.clear();
      sessionStorage.clear();

    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was an error processing your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete your account, profile, 
              all content you've created, and remove you from all social connections. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletion-reason">Reason for leaving (optional)</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {deletionReasons.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional feedback (optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Help us improve by sharing your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Account Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    This will permanently delete your account and all data. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your profile and account information</li>
                    <li>All content you've created (stories, facts, comments)</li>
                    <li>Your voting history and social connections</li>
                    <li>Your subscription and payment history</li>
                    <li>Any uploaded media files</li>
                  </ul>
                  <p className="font-semibold">
                    To confirm, please type "DELETE MY ACCOUNT" below:
                  </p>
                  <Input
                    placeholder="DELETE MY ACCOUNT"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="font-mono"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDeletion}
                  disabled={isDeleting || confirmText !== 'DELETE MY ACCOUNT'}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Data Rights Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Learn about your rights regarding your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Right to Access</h4>
              <p className="text-muted-foreground">
                You can request and download all your personal data at any time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Right to Rectification</h4>
              <p className="text-muted-foreground">
                You can update and correct your personal information in your profile settings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Right to Erasure</h4>
              <p className="text-muted-foreground">
                You can request complete deletion of your account and all associated data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Right to Portability</h4>
              <p className="text-muted-foreground">
                You can export your data in a machine-readable format to transfer to other services.
              </p>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              For questions about your data rights or to exercise these rights, 
              contact us at{' '}
              <a href="mailto:privacy@localelore.com" className="text-primary hover:underline">
                privacy@localelore.com
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};