import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Copy, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { useAuth, TwoFactorSetup as TwoFactorSetupData } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const TwoFactorSetup = ({ onComplete, onSkip }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const { setupTwoFactor, verifyTwoFactor, loading } = useAuth();

  const handleSetup = async () => {
    const result = await setupTwoFactor();
    if ('qr_code' in result) {
      setSetupData(result);
      // In a real implementation, you'd get the factor ID from the setup response
      setFactorId('mock-factor-id');
      setStep('verify');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || !factorId) return;
    
    const { error } = await verifyTwoFactor(factorId, verificationCode);
    if (!error) {
      setStep('recovery');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadRecoveryCodes = () => {
    if (!setupData?.recovery_codes) return;
    
    const codes = setupData.recovery_codes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locale-lore-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication helps protect your account by requiring a second form of verification when signing in.
            </p>
          </div>
          
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              You'll need an authenticator app like Google Authenticator, Authy, or 1Password to continue.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button 
              onClick={handleSetup} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up 2FA'
              )}
            </Button>
            <Button variant="outline" onClick={onSkip} className="flex-1">
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify' && setupData) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Use your authenticator app to scan this QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={setupData.qr_code} 
                alt="2FA QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Or enter this code manually:</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={setupData.secret} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(setupData.secret)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center font-mono text-lg"
            />
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Enable 2FA'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'recovery' && setupData) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>2FA Enabled Successfully!</CardTitle>
          <CardDescription>
            Save these recovery codes in a secure location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Keep these recovery codes safe. You can use them to access your account if you lose your authenticator device.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setupData.recovery_codes.map((code, index) => (
                <div key={index} className="text-center py-1">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={downloadRecoveryCodes}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Codes
            </Button>
            <Button 
              onClick={() => copyToClipboard(setupData.recovery_codes.join('\n'))}
              variant="outline"
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Codes
            </Button>
          </div>

          <Button onClick={onComplete} className="w-full">
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};