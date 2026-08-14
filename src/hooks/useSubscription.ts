import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
    id: string;
    email: string;
    message_count: number;
    total_messages: number;
    daily_message_count: number;
    daily_reset_at: string;
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

const DAILY_MESSAGE_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const LOCAL_DAILY_COUNT_KEY = 'nomos_daily_msg_count';
const LOCAL_DAILY_RESET_KEY = 'nomos_daily_reset_at';
const LOCAL_TOTAL_MSG_KEY = 'nomos_total_msg';

function isResetDue(resetAt: string | null): boolean {
    if (!resetAt) return true;
    return Date.now() - new Date(resetAt).getTime() >= DAY_MS;
}

function getLocalDailyCount(): number {
    try {
        if (isResetDue(localStorage.getItem(LOCAL_DAILY_RESET_KEY))) return 0;
        return parseInt(localStorage.getItem(LOCAL_DAILY_COUNT_KEY) || '0', 10);
    } catch {
        return 0;
    }
}

function getLocalResetAt(): string {
    try {
        const stored = localStorage.getItem(LOCAL_DAILY_RESET_KEY);
        if (stored && !isResetDue(stored)) return stored;
        const now = new Date().toISOString();
        localStorage.setItem(LOCAL_DAILY_RESET_KEY, now);
        localStorage.setItem(LOCAL_DAILY_COUNT_KEY, '0');
        return now;
    } catch {
        return new Date().toISOString();
    }
}

function setLocalDailyCount(count: number) {
    try {
        localStorage.setItem(LOCAL_DAILY_COUNT_KEY, String(count));
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
    const [localDailyCount, setLocalDailyCountState] = useState(getLocalDailyCount);
    const [localResetAt, setLocalResetAtState] = useState(getLocalResetAt);
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

    // Resets the daily counter server-side if the 24h window has elapsed
    const resetDailyQuotaIfDue = useCallback(async (currentProfile: UserProfile) => {
        if (!isResetDue(currentProfile.daily_reset_at)) return currentProfile;

        const nowIso = new Date().toISOString();
        const { data: updated, error } = await supabase
            .from('user_profiles')
            .update({
                daily_message_count: 0,
                daily_reset_at: nowIso,
                updated_at: nowIso,
            })
            .eq('id', currentProfile.id)
            .select()
            .single();

        if (error || !updated) {
            console.error('[useSubscription] Failed to reset daily quota:', error);
            return currentProfile;
        }

        return updated as UserProfile;
    }, []);

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
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (cancelled) return;

                if (error && error.code === 'PGRST116') {
                    const nowIso = new Date().toISOString();
                    const newProfile: Partial<UserProfile> = {
                        id: user.id,
                        email: user.email || '',
                        message_count: 0,
                        total_messages: 0,
                        daily_message_count: 0,
                        daily_reset_at: nowIso,
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
                        setProfile(created);
                        // Only trust DB values that actually came back — a missing
                        // column or partial row must not silently zero the local
                        // fallback counters.
                        if (created.daily_message_count !== null && created.daily_message_count !== undefined) {
                            setLocalDailyCountState(created.daily_message_count);
                            setLocalDailyCount(created.daily_message_count);
                        }
                        if (created.daily_reset_at) {
                            setLocalResetAtState(created.daily_reset_at);
                        }
                        if (created.total_messages !== null && created.total_messages !== undefined) {
                            setLocalTotalCount(created.total_messages);
                            setLocalTotalMessages(created.total_messages);
                        }
                    }
                } else if (error) {
                    console.error('[useSubscription] Failed to fetch profile:', error);
                    setSupabaseFailed(true);
                } else {
                    const freshProfile = await resetDailyQuotaIfDue(data as UserProfile);
                    if (cancelled) return;

                    setProfile(freshProfile);
                    // Same guard as above: undefined/null DB fields (e.g. from a
                    // migration that hasn't run yet, or a failed update) must fall
                    // through to the existing local state, not overwrite it.
                    if (freshProfile.daily_message_count !== null && freshProfile.daily_message_count !== undefined) {
                        setLocalDailyCountState(freshProfile.daily_message_count);
                        setLocalDailyCount(freshProfile.daily_message_count);
                    }
                    if (freshProfile.daily_reset_at) {
                        setLocalResetAtState(freshProfile.daily_reset_at);
                    }
                    if (freshProfile.total_messages !== null && freshProfile.total_messages !== undefined) {
                        setLocalTotalCount(freshProfile.total_messages);
                        setLocalTotalMessages(freshProfile.total_messages);
                    }

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
    }, [user, fetchUserBadges, resetDailyQuotaIfDue]);

    // Derive values
    const dailyMessageCount = profile?.daily_message_count ?? localDailyCount;
    const dailyResetAt = profile?.daily_reset_at ?? localResetAt;
    const totalMessages = profile?.total_messages ?? localTotalCount;
    const subscriptionStatus = profile?.subscription_status ?? 'free_trial';
    const subscriptionPlan = profile?.subscription_plan ?? null;

    const canSendMessage =
        isLoading ||
        subscriptionStatus === 'active' ||
        dailyMessageCount < DAILY_MESSAGE_LIMIT;

    const hasActiveSubscription = subscriptionStatus === 'active';
    const isFreeTrial = subscriptionStatus === 'free_trial';
    const freeTrialRemaining = Math.max(0, DAILY_MESSAGE_LIMIT - dailyMessageCount);

    // Milliseconds until the current window resets — for display purposes
    const msUntilReset = Math.max(0, DAY_MS - (Date.now() - new Date(dailyResetAt).getTime()));

    // Check and award badges
    const checkBadges = useCallback(async (newTotal: number) => {
        if (!user || supabaseFailed) return;

        try {
            const { data, error } = await supabase.rpc('check_and_award_badges', {
                p_user_id: user.id,
                p_total_messages: newTotal
            });

            if (!error && data && data.length > 0) {
                const newBadges = data as any[];
                if (newBadges.length > 0) {
                    setNewBadge({
                        name: newBadges[0].badge_name,
                        description: newBadges[0].badge_description,
                        icon: newBadges[0].badge_icon,
                        message_threshold: newTotal,
                    });
                    fetchUserBadges();
                }
            }
        } catch (err) {
            console.error('[useSubscription] Failed to check badges:', err);
        }
    }, [user, supabaseFailed, fetchUserBadges]);

    const incrementMessageCount = useCallback(async () => {
        if (!user) return;

        // Local counters always update as a fallback/optimistic layer
        const dueForReset = isResetDue(dailyResetAt);
        const currentDaily = dueForReset ? 0 : (profile?.daily_message_count ?? localDailyCount);
        const currentTotal = profile?.total_messages ?? localTotalCount;
        const newDaily = currentDaily + 1;
        const newTotal = currentTotal + 1;
        const nowIso = new Date().toISOString();

        setLocalDailyCountState(newDaily);
        setLocalDailyCount(newDaily);
        if (dueForReset) {
            setLocalResetAtState(nowIso);
            try { localStorage.setItem(LOCAL_DAILY_RESET_KEY, nowIso); } catch { /* ignore */ }
        }
        setLocalTotalCount(newTotal);
        setLocalTotalMessages(newTotal);

        if (profile && !supabaseFailed) {
            const updatePayload: Record<string, any> = {
                daily_message_count: newDaily,
                total_messages: newTotal,
                updated_at: nowIso,
            };
            if (dueForReset) {
                updatePayload.daily_reset_at = nowIso;
            }

            const { error } = await supabase
                .from('user_profiles')
                .update(updatePayload)
                .eq('id', user.id);

            if (error) {
                console.error('[useSubscription] Failed to increment message count:', error);
            } else {
                setProfile((prev) =>
                    prev
                        ? {
                            ...prev,
                            daily_message_count: newDaily,
                            daily_reset_at: dueForReset ? nowIso : prev.daily_reset_at,
                            total_messages: newTotal,
                        }
                        : prev
                );

                if (newTotal === 20 || newTotal === 50 || newTotal === 100 || newTotal === 200 || newTotal === 500) {
                    checkBadges(newTotal);
                }
            }
        }
    }, [user, profile, dailyResetAt, localDailyCount, localTotalCount, supabaseFailed, checkBadges]);

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
        dailyMessageCount,
        totalMessages,
        subscriptionStatus,
        subscriptionPlan,
        canSendMessage,
        hasActiveSubscription,
        isFreeTrial,
        freeTrialRemaining,
        msUntilReset,
        dailyMessageLimit: DAILY_MESSAGE_LIMIT,
        incrementMessageCount,
        activateSubscription,
    };
}
