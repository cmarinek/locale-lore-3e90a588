import { useTranslation } from '@/hooks/useTranslation';
import * as z from 'zod';

export const useValidationSchemas = () => {
  const { t } = useTranslation('auth');

  const signInSchema = z.object({
    email: z.string().email(t('invalidCredentials')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const signUpSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers'),
    confirmPassword: z.string(),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  return { signInSchema, signUpSchema };
};