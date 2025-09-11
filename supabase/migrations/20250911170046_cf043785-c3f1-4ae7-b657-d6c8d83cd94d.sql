-- Reset the existing job to allow restart for debugging
UPDATE acquisition_jobs 
SET status = 'pending', 
    processed_count = 0, 
    success_count = 0, 
    error_count = 0,
    error_log = NULL,
    completed_at = NULL,
    progress_data = '{}'
WHERE name = '01-30';