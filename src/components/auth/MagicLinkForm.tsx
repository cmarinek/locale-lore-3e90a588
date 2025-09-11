import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Loader2, Sparkles } from 'lucide-react';
import { useAuthActions } from '@/hooks/useAuthActions';

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const MagicLinkForm = ({ onSuccess, onBack }: MagicLinkFormProps) => {
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink, loading } = useAuthActions();

  const schema = useMemo(() => z.object({
    email: z.string().email('Please enter a valid email address'),
  }), []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: { email: string }) => {
    try {
      const { error } = await signInWithMagicLink(values.email);
      if (!error) {
        setEmailSent(true);
        setTimeout(() => {
          onSuccess?.();
        }, 3000);
      }
    } catch (error) {
      console.error('Magic link error:', error);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Magic link sent!</h3>
          <p className="text-muted-foreground text-sm">
            Check your email for a secure sign-in link. The link will expire in 1 hour.
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
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a secure sign-in link
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

          <Button 
            type="submit" 
            className="w-full h-12 text-base transition-all duration-200 hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Send Magic Link
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
          Back to sign in options
        </Button>
      </div>
    </div>
  );
};