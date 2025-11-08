-- Fix function search_path security warnings
-- This ensures functions operate in a secure, predictable schema context

-- Update all public functions to have secure search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
        func_record.schema_name,
        func_record.function_name,
        func_record.args
      );
      RAISE NOTICE 'Updated function: %.%', func_record.schema_name, func_record.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not update function %.%: %', func_record.schema_name, func_record.function_name, SQLERRM;
    END;
  END LOOP;
END $$;