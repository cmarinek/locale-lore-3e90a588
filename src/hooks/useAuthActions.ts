import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  user?: User | null;
  session?: Session | null;
  error?: AuthError | null;
}

export interface TwoFactorSetup {
  qr_code: string;
  secret: string;
  recovery_codes: string[];
}

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const cleanupAuthState = useCallback(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { user: data.user, session: data.session };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [cleanupAuthState]);

  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { username?: string; full_name?: string }
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/confirm`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {}
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      return { user: data.user, session: data.session };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [cleanupAuthState]);

  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
      });

      return { user: data.user, session: data.session };
    } catch (error: any) {
      toast({
        title: "Magic link failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      return { user: null, session: null };
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return { error };
    }
  }, [cleanupAuthState]);

  const resetPassword = useCallback(async (email: string): Promise<{ error?: AuthError }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset sent!",
        description: "Check your email for reset instructions.",
      });

      return {};
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<{ error?: AuthError }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });

      return {};
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string, type: 'signup' | 'recovery' | 'email_change' | 'magiclink' = 'signup'): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) throw error;

      toast({
        title: "Verification successful!",
        description: "Your account has been verified.",
      });

      return { user: data.user, session: data.session };
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const setupTwoFactor = useCallback(async (): Promise<TwoFactorSetup | { error: AuthError }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Locale Lore Authentication'
      });

      if (error) throw error;

      return {
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        recovery_codes: [] // Recovery codes would be provided in a real implementation
      };
    } catch (error: any) {
      toast({
        title: "2FA setup failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyTwoFactor = useCallback(async (factorId: string, code: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code
      });

      if (error) throw error;

      toast({
        title: "2FA verified!",
        description: "Two-factor authentication is now active.",
      });

      return { user: data.user, session: null };
    } catch (error: any) {
      toast({
        title: "2FA verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  }, [cleanupAuthState]);

  return {
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    verifyOtp,
    setupTwoFactor,
    verifyTwoFactor,
    signOut,
  };
};