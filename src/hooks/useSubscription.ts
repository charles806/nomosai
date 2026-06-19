import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
    id: string;
    email: string;
    message_count: number;
    total_messages: number;
    subscription_plan: string | null;
    subscription_status: string;
    payment_reference: string | null;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    message_threshold: number;
    earned_at?: string;
}

const FREE_TRIAL_LIMIT = 5;
const LOCAL_MSG_COUNT_KEY = 'nomos_msg_count';
const LOCAL_TOTAL_MSG_KEY = 'nomos_total_msg';

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

function getLocalTotalMessages(): number {
    try {
        return parseInt(localStorage.getItem(LOCAL_TOTAL_MSG_KEY) || '0', 10);
    } catch {
        return 0;
    }
}

function setLocalTotalMessages(count: number) {
    try {
        localStorage.setItem(LOCAL_TOTAL_MSG_KEY, String(count));
    } catch { /* ignore */ }
}

export function useSubscription() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [newBadge, setNewBadge] = useState<Badge | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supabaseFailed, setSupabaseFailed] = useState(false);
    const [localCount, setLocalCount] = useState(getLocalMessageCount);
    const [localTotalCount, setLocalTotalCount] = useState(getLocalTotalMessages);

    // Fetch user badges
    const fetchUserBadges = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('user_badges')
                .select(`
                    earned_at,
                    badges (
                        id,
                        name,
                        description,
                        icon,
                        message_threshold
                    )
                `)
                .eq('user_id', user.id);

            if (!error && data) {
                const userBadges: Badge[] = data.map((ub: any) => ({
                    ...ub.badges,
                    earned_at: ub.earned_at,
                }));
                setBadges(userBadges);
            }
        } catch (err) {
            console.error('[useSubscription] Failed to fetch badges:', err);
        }
    }, [user]);

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

                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (cancelled) return;

                if (error && error.code === 'PGRST116') {
                    console.log('[useSubscription] No profile found, creating one...');
                    const newProfile: Partial<UserProfile> = {
                        id: user.id,
                        email: user.email || '',
                        message_count: 0,
                        total_messages: 0,
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
                        console.error('[useSubscription] Failed to create profile:', insertError);
                        setSupabaseFailed(true);
                    } else {
                        console.log('[useSubscription] Profile created:', created);
                        setProfile(created);
                        setLocalCount(created.message_count ?? 0);
                        setLocalMessageCount(created.message_count ?? 0);
                        setLocalTotalCount(created.total_messages ?? 0);
                        setLocalTotalMessages(created.total_messages ?? 0);
                    }
                } else if (error) {
                    console.error('[useSubscription] Failed to fetch profile:', error);
                    setSupabaseFailed(true);
                } else {
                    console.log('[useSubscription] Profile loaded:', data);
                    setProfile(data);
                    setLocalCount(data.message_count ?? 0);
                    setLocalMessageCount(data.message_count ?? 0);
                    setLocalTotalCount(data.total_messages ?? 0);
                    setLocalTotalMessages(data.total_messages ?? 0);

                    // Fetch badges
                    fetchUserBadges();
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
    }, [user, fetchUserBadges]);

    // Derive values
    const messageCount = profile?.message_count ?? localCount;
    const totalMessages = profile?.total_messages ?? localTotalCount;
    const subscriptionStatus = profile?.subscription_status ?? 'free_trial';
    const subscriptionPlan = profile?.subscription_plan ?? null;

    const canSendMessage =
        isLoading ||
        subscriptionStatus === 'active' ||
        messageCount < FREE_TRIAL_LIMIT;

    const hasActiveSubscription = subscriptionStatus === 'active';
    const isFreeTrial = subscriptionStatus === 'free_trial';
    const freeTrialRemaining = Math.max(0, FREE_TRIAL_LIMIT - messageCount);

    // Check and award badges
    const checkBadges = useCallback(async (newTotal: number) => {
        if (!user || supabaseFailed) return;

        try {
            // Call the database function to check and award badges
            const { data, error } = await supabase.rpc('check_and_award_badges', {
                p_user_id: user.id,
                p_total_messages: newTotal
            });

            if (!error && data && data.length > 0) {
                // Got new badges!
                const newBadges = data as any[];
                if (newBadges.length > 0) {
                    setNewBadge({
                        name: newBadges[0].badge_name,
                        description: newBadges[0].badge_description,
                        icon: newBadges[0].badge_icon,
                        message_threshold: newTotal,
                    });
                    fetchUserBadges(); // Refresh badge list
                }
            }
        } catch (err) {
            console.error('[useSubscription] Failed to check badges:', err);
        }
    }, [user, supabaseFailed, fetchUserBadges]);

    const incrementMessageCount = useCallback(async () => {
        if (!user) return;

        const currentCount = profile?.message_count ?? localCount;
        const currentTotal = profile?.total_messages ?? localTotalCount;
        const newCount = currentCount + 1;
        const newTotal = currentTotal + 1;

        // Always update local counters
        setLocalCount(newCount);
        setLocalMessageCount(newCount);
        setLocalTotalCount(newTotal);
        setLocalTotalMessages(newTotal);

        // Try Supabase update
        if (profile && !supabaseFailed) {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    message_count: newCount,
                    total_messages: newTotal,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) {
                console.error('[useSubscription] Failed to increment message count:', error);
            } else {
                setProfile((prev) =>
                    prev ? { ...prev, message_count: newCount, total_messages: newTotal } : prev
                );

                // Check for new badges at milestones
                if (newTotal === 20 || newTotal === 50 || newTotal === 100 || newTotal === 200 || newTotal === 500) {
                    checkBadges(newTotal);
                }
            }
        }
    }, [user, profile, localCount, localTotalCount, supabaseFailed, checkBadges]);

    const clearNewBadge = useCallback(() => {
        setNewBadge(null);
    }, []);

    const activateSubscription = useCallback(
        async (plan: string, reference: string) => {
            if (!user) return;

            const { error } = await supabase.functions.invoke('paystack-webhook', {
                body: { event: 'client_activation', data: { reference, plan, customer: { email: user.email } } }
            });

            if (error) {
                console.error('[useSubscription] Failed to trigger activation webhook:', error);
                throw error;
            }

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
        badges,
        newBadge,
        clearNewBadge,
        isLoading,
        messageCount,
        totalMessages,
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