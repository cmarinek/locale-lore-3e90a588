import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Shield, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Info
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataExportPanelProps {
  onExportData: () => Promise<void>;
  onRequestDeletion: (reason?: string, feedback?: string) => Promise<void>;
  loading: boolean;
}

export const DataExportPanel = ({ onExportData, onRequestDeletion, loading }: DataExportPanelProps) => {
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionFeedback, setDeletionFeedback] = useState('');
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

  const handleRequestDeletion = async () => {
    await onRequestDeletion(deletionReason, deletionFeedback);
    setShowDeletionDialog(false);
    setDeletionReason('');
    setDeletionFeedback('');
  };

  const deletionReasons = [
    'No longer need the service',
    'Privacy concerns',
    'Too many emails/notifications',
    'Found an alternative service',
    'Technical issues',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your data from Locale Lore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your export will include your profile information, submitted facts, comments, votes, 
              achievements, and activity history. The download will be in JSON format.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold">What's included in your export:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Profile information and settings</li>
              <li>Facts you've submitted</li>
              <li>Comments and interactions</li>
              <li>Voting history</li>
              <li>Achievements and badges</li>
              <li>Activity log (last 90 days)</li>
              <li>Statistics and progress data</li>
            </ul>
          </div>

          <Button
            onClick={onExportData}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Download My Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deletion */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. All your data, including 
              facts, comments, and achievements, will be permanently deleted after 30 days.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold">What happens when you delete your account:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Your account will be scheduled for deletion in 30 days</li>
              <li>You can cancel the deletion request during this period</li>
              <li>All your personal data will be permanently removed</li>
              <li>Your public contributions may remain anonymized</li>
              <li>Any active subscriptions will be canceled</li>
            </ul>
          </div>

          <AlertDialog open={showDeletionDialog} onOpenChange={setShowDeletionDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  We're sorry to see you go. Help us improve by telling us why you're leaving.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reason for leaving (optional)</Label>
                  <Select value={deletionReason} onValueChange={setDeletionReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {deletionReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional feedback (optional)</Label>
                  <Textarea
                    placeholder="Let us know how we could have done better..."
                    value={deletionFeedback}
                    onChange={(e) => setDeletionFeedback(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRequestDeletion}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Learn about your rights regarding your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Right to Access:</strong> You can request and download your personal data at any time.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Right to Rectification:</strong> You can correct or update your personal information.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Right to Erasure:</strong> You can request deletion of your personal data.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Right to Portability:</strong> You can transfer your data to another service.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};