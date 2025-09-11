-- Fix RLS policies for acquisition_jobs and acquisition_queue to use admin role check directly
DROP POLICY IF EXISTS "Admin can manage acquisition jobs" ON acquisition_jobs;
DROP POLICY IF EXISTS "Admin can manage acquisition queue" ON acquisition_queue;

-- Create proper admin policies using the has_role function
CREATE POLICY "Admin can manage acquisition jobs" 
ON acquisition_jobs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage acquisition queue" 
ON acquisition_queue 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));