-- Instead of creating a system user, make author_id nullable and use NULL for system facts
ALTER TABLE facts ALTER COLUMN author_id DROP NOT NULL;

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