import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

const AuthConfirm = () => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const { verifyOtp, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleVerify = async () => {
    if (!email || !code) return;

    const type = searchParams.get('type') as 'signup' | 'recovery' | 'email_change' | 'magiclink' || 'signup';
    const { error } = await verifyOtp(email, code, type);
    
    if (!error) {
      setVerified(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const handleResend = async () => {
    // Implementation for resending verification email
    console.log('Resend verification email');
  };

  if (verified) {
    return (
      <AuthLayout
        title="Email Verified!"
        description="Your email has been successfully verified"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the app...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      description="Enter the verification code sent to your email"
      showBackButton={true}
      onBack={() => navigate('/auth')}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to your email address
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center font-mono text-lg h-12"
            />
          </div>

          <Button 
            onClick={handleVerify}
            disabled={loading || !email || code.length !== 6}
            className="w-full h-12"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="link"
            onClick={handleResend}
            className="text-primary hover:text-primary/80"
          >
            Resend verification code
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthConfirm;