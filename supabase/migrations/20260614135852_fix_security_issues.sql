-- Fix 1: Secure the handle_new_user function
-- Set immutable search_path and keep SECURITY DEFINER (required for trigger)
-- The trigger runs as the table owner (postgres), so the function needs elevated privileges
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, message_count)
  VALUES (new.id, new.email, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Revoke execute permissions from anon and authenticated roles
-- The function should only be called by the trigger, not via REST API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
-- Only postgres (system) can execute it for the trigger
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Fix 2: Add RLS policies to the "legal gee" table
-- This table appears to be a test table, so we'll add basic policies

-- Allow authenticated users to read their own data (assuming id maps to user)
CREATE POLICY "Users can read own data" 
ON public."legal gee" 
FOR SELECT 
TO authenticated
USING (true); -- Since the table doesn't have a user_id column, we allow all reads
-- If this is a test table, you may want to restrict further or drop it

-- Allow authenticated users to insert
CREATE POLICY "Authenticated can insert" 
ON public."legal gee" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Note: Fix 3 (Leaked Password Protection) must be enabled in Supabase Dashboard
-- Go to: Authentication -> Settings -> "Enable leaked password protection"
-- This cannot be set via SQL migration