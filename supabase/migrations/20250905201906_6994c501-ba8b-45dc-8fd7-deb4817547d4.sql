-- Simplify subscribers table for new model
ALTER TABLE public.subscribers 
DROP COLUMN IF EXISTS subscription_tier,
ADD COLUMN IF NOT EXISTS is_contributor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contributor_since TIMESTAMPTZ;

-- Update existing records to reflect new model
UPDATE public.subscribers 
SET is_contributor = CASE 
  WHEN subscribed = true THEN true 
  ELSE false 
END,
contributor_since = CASE 
  WHEN subscribed = true THEN updated_at 
  ELSE NULL 
END;

-- Simplify payment_sessions for single tier
ALTER TABLE public.payment_sessions 
DROP COLUMN IF EXISTS tier;

-- Add default tier to payments table if missing
ALTER TABLE public.payments 
ALTER COLUMN tier SET DEFAULT 'contributor';

-- Update any existing payments to contributor tier
UPDATE public.payments SET tier = 'contributor' WHERE tier IS NULL OR tier != 'contributor';