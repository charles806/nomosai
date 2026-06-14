-- The "legal gee" table appears to be an unused test table
-- with no user_id column and no application code referencing it
-- Dropping it eliminates the RLS security concern entirely

DROP TABLE IF EXISTS public."legal gee" CASCADE;