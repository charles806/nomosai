-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'award',
    message_threshold INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Create user_badges table to track earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Add total_messages column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0;

-- Insert default badges
INSERT INTO public.badges (name, description, icon, message_threshold) VALUES
    ('Legal Apprentice', 'Sent your first 20 messages', 'message-circle', 20),
    ('Legal Scholar', 'Sent 50 messages', 'book-open', 50),
    ('Legal Expert', 'Sent 100 messages', 'award', 100),
    ('Legal Master', 'Sent 200 messages', 'crown', 200),
    ('Legal Legend', 'Sent 500 messages', 'star', 500)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (read-only for all authenticated)
CREATE POLICY "badges_select_authenticated" ON public.badges
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for user_badges
CREATE POLICY "user_badges_select_own" ON public.user_badges
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert_own" ON public.user_badges
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID, p_total_messages INTEGER)
RETURNS TABLE(badge_name TEXT, badge_description TEXT, badge_icon TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert any new badges the user has earned
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, b.id
    FROM public.badges b
    WHERE b.message_threshold <= p_total_messages
    AND NOT EXISTS (
        SELECT 1 FROM public.user_badges ub 
        WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    )
    RETURNING (SELECT name FROM public.badges WHERE id = badge_id)::TEXT,
              (SELECT description FROM public.badges WHERE id = badge_id)::TEXT,
              (SELECT icon FROM public.badges WHERE id = badge_id)::TEXT;
END;
$$;