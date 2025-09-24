-- Fix function search_path issues for security using correct signatures

-- Fix update_updated_at trigger function
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- Fix handle_new_user trigger function  
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix has_role function (uuid, text version)
ALTER FUNCTION public.has_role(uuid, text) SET search_path = public;

-- Fix is_admin function (uuid version) 
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

-- Fix clustering functions
ALTER FUNCTION public.get_fact_clusters(double precision, double precision, double precision, double precision, integer) SET search_path = public;
ALTER FUNCTION public.get_optimized_fact_clusters(double precision, double precision, double precision, double precision, integer, integer) SET search_path = public;

-- Fix security report function
ALTER FUNCTION public.security_status_report() SET search_path = public;