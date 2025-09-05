import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Shield, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { SocialAuth } from '@/components/auth/SocialAuth';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

type AuthView = 'main' | 'signin' | 'signup' | 'magic-link' | 'reset-password' | 'two-factor-setup';

const AuthMain = () => {
  const [view, setView] = useState<AuthView>('main');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('auth');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/');
      }
    };
    
    // Handle different auth flows from URL params
    const view = searchParams.get('view');
    const mode = searchParams.get('mode');
    
    if (view === 'reset-password') {
      setView('reset-password');
    } else if (view === '2fa-setup') {
      setView('two-factor-setup');
    } else if (mode) {
      setAuthMode(mode as 'signin' | 'signup');
      setView(mode as 'signin' | 'signup');
    }
    
    checkUser();
  }, [navigate, searchParams]);

  const handleAuthSuccess = () => {
    // Check if 2FA setup is needed
    const shouldSetup2FA = localStorage.getItem('setup-2fa') === 'true';
    if (shouldSetup2FA) {
      setView('two-factor-setup');
      localStorage.removeItem('setup-2fa');
    } else {
      navigate('/');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'signin':
      case 'signup':
        return (
          <AuthLayout
            title={authMode === 'signin' ? 'Welcome Back' : 'Join Locale Lore'}
            description={authMode === 'signin' 
              ? 'Sign in to your account to continue' 
              : 'Create your account to get started'
            }
            showBackButton={true}
            onBack={() => setView('main')}
          >
            <EmailPasswordForm
              mode={authMode}
              onSuccess={handleAuthSuccess}
              onSwitchMode={() => {
                const newMode = authMode === 'signin' ? 'signup' : 'signin';
                setAuthMode(newMode);
                setView(newMode);
              }}
            />
          </AuthLayout>
        );

      case 'magic-link':
        return (
          <AuthLayout
            title={t('magicLink')}
            description={t('magicLinkDescription', { defaultValue: 'Sign in securely without a password' })}
            showBackButton={true}
            onBack={() => setView('main')}
          >
            <MagicLinkForm
              onSuccess={handleAuthSuccess}
              onBack={() => setView('main')}
            />
          </AuthLayout>
        );

      case 'reset-password':
        return (
          <AuthLayout
            title={t('resetPassword')}
            description={t('resetPasswordDescription', { defaultValue: 'Reset your account password' })}
            showBackButton={true}
            onBack={() => setView('main')}
          >
            <PasswordResetForm
              mode="request"
              onSuccess={() => setView('signin')}
              onBack={() => setView('signin')}
            />
          </AuthLayout>
        );

      case 'two-factor-setup':
        return (
          <AuthLayout
            title="Security Setup"
            description="Enhance your account security"
          >
            <TwoFactorSetup
              onComplete={() => navigate('/')}
              onSkip={() => navigate('/')}
            />
          </AuthLayout>
        );

      default:
        return (
          <AuthLayout
            title={t('welcomeTitle', { defaultValue: 'Welcome to LocaleLore' })}
            description={t('welcomeDescription', { defaultValue: 'Discover and share stories with a global community' })}
          >
            <div className="space-y-6">
              {/* Social Auth */}
              <SocialAuth onSuccess={handleAuthSuccess} />

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-3 text-muted-foreground text-sm">
                    Or choose an option
                  </span>
                </div>
              </div>

              {/* Auth Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuthMode('signin');
                    setView('signin');
                  }}
                  className="w-full h-12 transition-all duration-200 hover:scale-[1.02] border-border/50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t('signInWithEmail')}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setView('magic-link')}
                  className="w-full h-12 transition-all duration-200 hover:scale-[1.02] border-border/50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('magicLink')}
                </Button>

                <Button
                  onClick={() => {
                    setAuthMode('signup');
                    setView('signup');
                  }}
                  className="w-full h-12 transition-all duration-200 hover:scale-[1.02]"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t('createAccount')}
                </Button>
              </div>

              {/* Additional Options */}
              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  onClick={() => setView('reset-password')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {t('forgotPassword')}
                </Button>
              </div>
            </div>
          </AuthLayout>
        );
    }
  };

  return renderView();
};

export default AuthMain;