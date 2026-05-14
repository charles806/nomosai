import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
    id: string;
    email: string;
    message_count: number;
    subscription_plan: string | null;
    subscription_status: string;
    payment_reference: string | null;
    created_at: string;
    updated_at: string;
}

const FREE_TRIAL_LIMIT = 5;
const LOCAL_MSG_COUNT_KEY = 'legalgee_msg_count';

/**
 * Get / set a localStorage-based message counter as fallback
 * when Supabase profile operations fail.
 */
function getLocalMessageCount(): number {
    try {
        return parseInt(localStorage.getItem(LOCAL_MSG_COUNT_KEY) || '0', 10);
    } catch {
        return 0;
    }
}
function setLocalMessageCount(count: number) {
    try {
        localStorage.setItem(LOCAL_MSG_COUNT_KEY, String(count));
    } catch { /* ignore */ }
}

export function useSubscription() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supabaseFailed, setSupabaseFailed] = useState(false);
    // Local fallback counter (used when Supabase is unreachable)
    const [localCount, setLocalCount] = useState(getLocalMessageCount);

    // Fetch or create user profile
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                console.log('[useSubscription] Fetching profile for', user.id);

                // Try to fetch existing profile
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (cancelled) return;

                if (error && error.code === 'PGRST116') {
                    // Profile doesn't exist — create one
                    console.log('[useSubscription] No profile found, creating one...');
                    const newProfile: Partial<UserProfile> = {
                        id: user.id,
                        email: user.email || '',
                        message_count: 0,
                        subscription_plan: null,
                        subscription_status: 'free_trial',
                        payment_reference: null,
                    };

                    const { data: created, error: insertError } = await supabase
                        .from('user_profiles')
                        .insert(newProfile)
                        .select()
                        .single();

                    if (cancelled) return;

                    if (insertError) {
                        console.error('[useSubscription] Failed to create profile (RLS issue?):', insertError);
                        setSupabaseFailed(true);
                    } else {
                        console.log('[useSubscription] Profile created:', created);
                        setProfile(created);
                        // Sync local counter with remote
                        setLocalCount(created.message_count ?? 0);
                        setLocalMessageCount(created.message_count ?? 0);
                    }
                } else if (error) {
                    console.error('[useSubscription] Failed to fetch profile:', error);
                    setSupabaseFailed(true);
                } else {
                    console.log('[useSubscription] Profile loaded:', data);
                    setProfile(data);
                    setLocalCount(data.message_count ?? 0);
                    setLocalMessageCount(data.message_count ?? 0);
                }
            } catch (err) {
                console.error('[useSubscription] Unexpected error:', err);
                if (!cancelled) setSupabaseFailed(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchProfile();
        return () => { cancelled = true; };
    }, [user]);

    // Derive values — use local fallback if Supabase profile is unavailable
    const messageCount = profile?.message_count ?? localCount;
    const subscriptionStatus = profile?.subscription_status ?? 'free_trial';
    const subscriptionPlan = profile?.subscription_plan ?? null;

    const canSendMessage =
        isLoading || // Allow while still loading so users aren't blocked
        subscriptionStatus === 'active' ||
        messageCount < FREE_TRIAL_LIMIT;

    const hasActiveSubscription = subscriptionStatus === 'active';
    const isFreeTrial = subscriptionStatus === 'free_trial';
    const freeTrialRemaining = Math.max(0, FREE_TRIAL_LIMIT - messageCount);

    const incrementMessageCount = useCallback(async () => {
        if (!user) return;

        const currentCount = profile?.message_count ?? localCount;
        const newCount = currentCount + 1;

        // Always update local counter
        setLocalCount(newCount);
        setLocalMessageCount(newCount);

        // Try Supabase update
        if (profile && !supabaseFailed) {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    message_count: newCount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) {
                console.error('[useSubscription] Failed to increment message count:', error);
            } else {
                setProfile((prev) =>
                    prev ? { ...prev, message_count: newCount } : prev
                );
            }
        }
    }, [user, profile, localCount, supabaseFailed]);

    const activateSubscription = useCallback(
        async (plan: string, reference: string) => {
            if (!user) return;

            // Instead of insecurely updating the DB directly from the client,
            // we call our secure Edge Function to verify the payment 
            // and update the database safely, bypassing RLS.
            const { error } = await supabase.functions.invoke('paystack-webhook', {
                body: { event: 'client_activation', data: { reference, plan, customer: { email: user.email } } }
            });

            if (error) {
                console.error('[useSubscription] Failed to trigger activation webhook:', error);
                throw error;
            }

            // Optimistic update:
            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        subscription_plan: plan,
                        subscription_status: 'active',
                        payment_reference: reference,
                    }
                    : prev
            );
        },
        [user]
    );

    return {
        profile,
        isLoading,
        messageCount,
        subscriptionStatus,
        subscriptionPlan,
        canSendMessage,
        hasActiveSubscription,
        isFreeTrial,
        freeTrialRemaining,
        incrementMessageCount,
        activateSubscription,
    };
}
