-- Add available_points column to user_levels table for reward redemptions
ALTER TABLE user_levels 
ADD COLUMN IF NOT EXISTS available_points INTEGER DEFAULT 0;

-- Update existing records to set available_points equal to total_xp
UPDATE user_levels 
SET available_points = total_xp 
WHERE available_points = 0 OR available_points IS NULL;