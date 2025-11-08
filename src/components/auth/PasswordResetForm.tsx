import React, { useState, useMemo, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuthActions } from '@/hooks/useAuthActions';
import { log } from '@/utils/logger';

interface PasswordResetFormProps {
  mode: 'request' | 'update';
  onSuccess?: () => void;
  onBack?: () => void;
}

export const PasswordResetForm = ({ mode, onSuccess, onBack }: PasswordResetFormProps) => {
  // Dynamic imports inside component to prevent TDZ errors
  const Mail = React.lazy(() => import('lucide-react').then(module => ({ default: module.Mail })));
  const Loader2 = React.lazy(() => import('lucide-react').then(module => ({ default: module.Loader2 })));
  const ShieldCheck = React.lazy(() => import('lucide-react').then(module => ({ default: module.ShieldCheck })));

  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, updatePassword, loading } = useAuthActions();

  const resetSchema = useMemo(() => z.object({
    email: z.string().email('Please enter a valid email address'),
  }), []);

  const updateSchema = useMemo(() => z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }), []);

  const schema = mode === 'request' ? resetSchema : updateSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      if (mode === 'request') {
        const { error } = await resetPassword(values.email);
        if (!error) {
          setEmailSent(true);
          setTimeout(() => {
            onSuccess?.();
          }, 3000);
        }
      } else {
        const { error } = await updatePassword(values.password);
        if (!error) {
          onSuccess?.();
        }
      }
    } catch (error) {
      log.error('Password reset error', error, { component: 'PasswordResetForm', action: mode === 'update' ? 'updatePassword' : 'sendResetEmail' });
    }
  };

  if (mode === 'request' && emailSent) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Suspense fallback={<div className="h-8 w-8 animate-pulse bg-primary/20 rounded" />}>
            <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
          </Suspense>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Reset link sent!</h3>
          <p className="text-muted-foreground text-sm">
            Check your email for password reset instructions. The link will expire in 1 hour.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setEmailSent(false)}
          className="w-full"
        >
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === 'request' && (
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Suspense fallback={<div className="h-6 w-6 animate-pulse bg-primary/20 rounded" />}>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </Suspense>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive password reset instructions
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'request' ? (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                   <FormControl>
                     <div className="relative">
                       <Suspense fallback={<div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-pulse bg-muted-foreground/20 rounded" />}>
                         <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       </Suspense>
                       <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-12 transition-all duration-200 focus:scale-[1.02]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        className="h-12 transition-all duration-200 focus:scale-[1.02]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        className="h-12 transition-all duration-200 focus:scale-[1.02]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base transition-all duration-200 hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Suspense fallback={<div className="mr-2 h-4 w-4 animate-pulse bg-primary-foreground/20 rounded" />}>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </Suspense>
                {mode === 'request' ? 'Sending reset link...' : 'Updating password...'}
              </>
            ) : (
              <>
                <Suspense fallback={<div className="mr-2 h-4 w-4 animate-pulse bg-primary-foreground/20 rounded" />}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                </Suspense>
                {mode === 'request' ? 'Send Reset Link' : 'Update Password'}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={onBack}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
};