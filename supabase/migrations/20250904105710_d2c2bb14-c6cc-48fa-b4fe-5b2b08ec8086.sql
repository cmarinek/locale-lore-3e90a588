-- Clear failed acquisition data for fresh start
DELETE FROM acquisition_queue WHERE status = 'failed';
DELETE FROM acquisition_jobs WHERE status = 'completed';