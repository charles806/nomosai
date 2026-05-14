# Bug Fixes for Supabase Issues

## Errors Encountered

1. **406 (Not Acceptable)** - Schema cache/RLS issues
2. **400 (Bad Request)** - Missing `message_count` column
3. **PGRST204** - "Could not find the 'message_count' column of 'user_profiles' in the schema cache"
4. **CORS Policy Error** - Edge function not accepting preflight requests

## Root Cause

The `user_profiles` table was missing the `message_count` column that the frontend code expects. Additionally, there was no INSERT policy, preventing users from creating their own profiles.

## Fixes Applied

### 1. Added `message_count` Column to Schema

**File:** `supabase/create_user_profiles.sql`

Added the missing column:

```sql
-- Message tracking
message_count INTEGER DEFAULT 0,
```

### 2. Added INSERT Policy

**File:** `supabase/create_user_profiles.sql`

Added policy to allow users to insert their own profile:

```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
```

### 3. Updated Trigger

**File:** `supabase/create_user_profiles.sql`

Updated the trigger to include `message_count`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, message_count)
  VALUES (new.id, new.email, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Fixed CORS in Edge Function

**File:** `supabase/functions/paystack-webhook/index.ts`

Added `Access-Control-Allow-Methods` header:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

---

## Steps to Apply Fixes

### Option 1: If Table Already Exists

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add missing column to existing table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Add INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update trigger to include message_count
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, message_count)
  VALUES (new.id, new.email, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option 2: If Creating Fresh Table

Run the entire `supabase/create_user_profiles.sql` script in Supabase Dashboard → SQL Editor.

### Step 3: Refresh Schema Cache

1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Click "Refresh schema"

### Step 4: Redeploy Edge Function

```bash
supabase functions deploy paystack-webhook
```

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/create_user_profiles.sql` | Added `message_count` column, INSERT policy, updated trigger |
| `supabase/functions/paystack-webhook/index.ts` | Added CORS method header |
