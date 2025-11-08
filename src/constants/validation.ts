// Validation schemas and rules - Single Source of Truth
import { z } from 'zod';
import { LIMITS, SUPPORTED_IMAGE_TYPES, CATEGORIES, PRIVACY_LEVELS } from './app';
import { ERROR_MESSAGES } from './errors';

// Email validation
export const emailSchema = z
  .string()
  .email(ERROR_MESSAGES.INVALID_EMAIL)
  .min(1, ERROR_MESSAGES.REQUIRED_FIELD);

// Password validation
export const passwordSchema = z
  .string()
  .min(LIMITS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
  .min(1, ERROR_MESSAGES.REQUIRED_FIELD);

// Story validation
export const storyTitleSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
  .max(LIMITS.MAX_TITLE_LENGTH, ERROR_MESSAGES.TITLE_TOO_LONG);

export const storyDescriptionSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
  .max(LIMITS.MAX_DESCRIPTION_LENGTH, ERROR_MESSAGES.DESCRIPTION_TOO_LONG);

export const categorySchema = z.enum(CATEGORIES as unknown as [string, ...string[]]);

export const privacyLevelSchema = z.enum(PRIVACY_LEVELS as unknown as [string, ...string[]]);

// Location validation
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// File validation
export const imageFileSchema = z.object({
  size: z.number().max(LIMITS.MAX_FILE_SIZE, ERROR_MESSAGES.FILE_TOO_LARGE),
  type: z.enum(SUPPORTED_IMAGE_TYPES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: ERROR_MESSAGES.INVALID_FILE_TYPE }),
  }),
});

// Complete story form schema
export const storyFormSchema = z.object({
  title: storyTitleSchema,
  description: storyDescriptionSchema,
  category: categorySchema,
  privacy_level: privacyLevelSchema,
  location: coordinatesSchema,
  tags: z.array(z.string()).max(LIMITS.MAX_TAGS).optional(),
});

// User profile schema
export const profileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url(ERROR_MESSAGES.INVALID_URL).optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  category: categorySchema.optional(),
  radius: z.number().min(1).max(100).optional(),
  limit: z.number().min(1).max(LIMITS.MAX_SEARCH_RESULTS).optional(),
});

export type StoryForm = z.infer<typeof storyFormSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
