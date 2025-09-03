-- Create a system user profile for automated fact acquisition
INSERT INTO profiles (id, username, bio, reputation_score, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system',
  'Automated fact acquisition system',
  1000,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Reset acquisition jobs and queue for fresh start
UPDATE acquisition_jobs SET 
  status = 'pending',
  processed_count = 0,
  success_count = 0,
  error_count = 0,
  completed_at = NULL,
  progress_data = '{}'::jsonb,
  error_log = NULL
WHERE status IN ('completed', 'failed');

DELETE FROM acquisition_queue;

-- Update facts table to make author_id nullable for system facts
ALTER TABLE facts ALTER COLUMN author_id DROP NOT NULL;