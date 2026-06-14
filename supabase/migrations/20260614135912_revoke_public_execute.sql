-- Revoke execute from PUBLIC role (which covers both anon and authenticated by default)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Ensure only postgres and service_role can execute
-- postgres needs it for the trigger, service_role for admin operations
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;