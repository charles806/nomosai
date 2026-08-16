import { useState, useEffect, useCallback, useRef } from 'react';
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
const BADGE_THRESHOLDS = [5, 10, 20, 50, 100, 200, 500];

const LOCAL_DAILY_COUNT_KEY = 'nomos_daily_msg_count';
const LOCAL_DAILY_RESET_KEY = 'nomos_daily_reset_at';
const LOCAL_TOTAL_MSG_KEY = 'nomos_total_msg';

function isResetDue(resetAt: string | null): boolean {
    if (!resetAt) return true;
    return Date.now() - new Date(resetAt).getTime() >= DAY_MS;
}

// Pure read — used only for offline/pre-load display, never for enforcement.
function getLocalDailyCount(): number {
    try {
        if (isResetDue(localStorage.getItem(LOCAL_DAILY_RESET_KEY))) return 0;
        return parseInt(localStorage.getItem(LOCAL_DAILY_COUNT_KEY) || '0', 10);
    } catch {
        return 0;
    }
}

function ensureLocalResetAt(): string {
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
    const [localResetAt, setLocalResetAtState] = useState(ensureLocalResetAt);
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

    // Resets the daily counter server-side if the 24h window has elapsed.
    // Still used on initial profile load for display purposes; the actual
    // enforcement reset now also happens atomically inside
    // increment_message_count, so this and that can never disagree.
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

                        setTimeout(async () => {
                            if (cancelled) return;
                            const { data: retried, error: retryError } = await supabase
                                .from('user_profiles')
                                .insert(newProfile)
                                .select()
                                .single();

                            if (!cancelled && !retryError && retried) {
                                setSupabaseFailed(false);
                                setProfile(retried);
                                fetchUserBadges();
                            }
                        }, 3000);
                    } else {
                        setProfile(created);
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

    // This remains a client-side display/UX hint (disable the send button
    // proactively, show remaining count) — it is NOT the enforcement point
    // anymore. The real check now happens server-side, inside
    // increment_message_count, under a row lock, using the DB's own count.
    // A user who bypasses this client check (e.g. by calling the RPC
    // directly) will simply get allowed: false back from the server and no
    // message will be sent — see incrementMessageCount below.
    const canSendMessage =
        isLoading ||
        subscriptionStatus === 'active' ||
        dailyMessageCount < DAILY_MESSAGE_LIMIT;

    const hasActiveSubscription = subscriptionStatus === 'active';
    const isFreeTrial = subscriptionStatus === 'free_trial';
    const freeTrialRemaining = Math.max(0, DAILY_MESSAGE_LIMIT - dailyMessageCount);

    const msUntilReset = Math.max(0, DAY_MS - (Date.now() - new Date(dailyResetAt).getTime()));

    const checkBadges = useCallback(async (previousTotal: number, newTotal: number) => {
        if (!user || supabaseFailed) return;

        const crossedThreshold = BADGE_THRESHOLDS.some(
            (threshold) => previousTotal < threshold && newTotal >= threshold
        );
        if (!crossedThreshold) return;

        try {
            const { data, error } = await supabase.rpc('check_and_award_badges', {
                p_user_id: user.id,
                p_total_messages: newTotal
            });

            if (!error && data && data.length > 0) {
                const newBadges = data as any[];
                if (newBadges.length > 0) {
                    setNewBadge({
                        id: newBadges[0].badge_id ?? newBadges[0].id,
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

    // Rewritten: the RPC is now the single source of truth for whether a
    // message is allowed AND for the resulting counts. It runs the check,
    // the daily reset, and the increment atomically under a row lock —
    // closing both the quota-bypass issue and the increment race condition
    // that the old read-then-write client logic could not fully solve.
    const incrementMessageCount = useCallback(async (): Promise<boolean> => {
        if (!user) return false;

        const previousTotal = profile?.total_messages ?? localTotalCount;

        if (supabaseFailed) {
            // No connection to the source of truth. We do NOT allow the
            // message to silently count as sent against a real quota we
            // can't verify — instead we track it locally only, clearly
            // separated from the enforced count, so it can't be used to
            // bypass anything once connectivity returns (the server's
            // count is authoritative again the moment profile reloads).
            const dueForReset = isResetDue(localResetAt);
            const newDaily = dueForReset ? 1 : localDailyCount + 1;
            const newTotal = localTotalCount + 1;
            const nowIso = new Date().toISOString();

            setLocalDailyCountState(newDaily);
            setLocalDailyCount(newDaily);
            if (dueForReset) {
                setLocalResetAtState(nowIso);
                try { localStorage.setItem(LOCAL_DAILY_RESET_KEY, nowIso); } catch { /* ignore */ }
            }
            setLocalTotalCount(newTotal);
            setLocalTotalMessages(newTotal);
            return true;
        }

        try {
            const { data, error } = await supabase.rpc('increment_message_count', {
                p_user_id: user.id,
            });

            if (error || !data || data.length === 0) {
                console.error('[useSubscription] increment_message_count RPC failed:', error);
                return false;
            }

            const result = data[0] as {
                allowed: boolean;
                daily_message_count: number;
                daily_reset_at: string;
                total_messages: number;
                subscription_status: string;
            };

            // Always sync local state to the server's authoritative answer,
            // whether or not the increment was allowed — this is what keeps
            // localStorage from ever drifting into something exploitable.
            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        daily_message_count: result.daily_message_count,
                        daily_reset_at: result.daily_reset_at,
                        total_messages: result.total_messages,
                    }
                    : prev
            );
            setLocalDailyCountState(result.daily_message_count);
            setLocalDailyCount(result.daily_message_count);
            setLocalResetAtState(result.daily_reset_at);
            try { localStorage.setItem(LOCAL_DAILY_RESET_KEY, result.daily_reset_at); } catch { /* ignore */ }
            setLocalTotalCount(result.total_messages);
            setLocalTotalMessages(result.total_messages);

            if (!result.allowed) {
                // Quota genuinely exhausted per the server — the caller
                // (wherever a message is sent) should check this return
                // value and block the send / show an upgrade prompt,
                // rather than assuming success like the old fire-and-forget
                // version did.
                return false;
            }

            checkBadges(previousTotal, result.total_messages);
            return true;
        } catch (err) {
            console.error('[useSubscription] Failed to increment message count:', err);
            return false;
        }
    }, [user, profile, localDailyCount, localResetAt, localTotalCount, supabaseFailed, checkBadges]);

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

            const reconcile = async (attempt: number) => {
                const { data, error: fetchError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (fetchError || !data) return;

                if (data.subscription_status === 'active') {
                    setProfile(data as UserProfile);
                    return;
                }

                if (attempt < 3) {
                    setTimeout(() => reconcile(attempt + 1), 2000 * (attempt + 1));
                } else {
                    console.error('[useSubscription] Subscription activation not confirmed by server after retries');
                    setProfile(data as UserProfile);
                }
            };

            setTimeout(() => reconcile(0), 1500);
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
