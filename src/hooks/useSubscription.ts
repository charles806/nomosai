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
const BADGE_THRESHOLDS = [20, 50, 100, 200, 500];

const LOCAL_DAILY_COUNT_KEY = 'nomos_daily_msg_count';
const LOCAL_DAILY_RESET_KEY = 'nomos_daily_reset_at';
const LOCAL_TOTAL_MSG_KEY = 'nomos_total_msg';

function isResetDue(resetAt: string | null): boolean {
    if (!resetAt) return true;
    return Date.now() - new Date(resetAt).getTime() >= DAY_MS;
}

// Pure read — does NOT write to localStorage. Callers that need the
// reset-or-initialize behavior should use ensureLocalResetAt() instead.
function getLocalDailyCount(): number {
    try {
        if (isResetDue(localStorage.getItem(LOCAL_DAILY_RESET_KEY))) return 0;
        return parseInt(localStorage.getItem(LOCAL_DAILY_COUNT_KEY) || '0', 10);
    } catch {
        return 0;
    }
}

// Side-effecting: initializes/rolls over the local reset timestamp if it's
// missing or stale. Named to make the write-on-read behavior explicit, since
// a plain "getX" name previously hid this from callers.
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

    // Tracks in-flight increments so a second increment fired before the
    // first Supabase round-trip resolves reads the *pending* value instead
    // of stale profile state — shrinks (does not eliminate) the race window
    // from issue #2. Real fix is an atomic DB-side RPC — see incrementMessageCount.
    const pendingCountsRef = useRef<{ daily: number; total: number; resetAt: string } | null>(null);

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
                        // Previously: silently fell back to local-only tracking
                        // with no retry and no user-facing signal, so the
                        // session's message counts never reached the DB.
                        // We still fall back (app must stay usable), but now
                        // we surface it in a way callers can react to, and we
                        // retry once after a short delay in case it was a
                        // transient network/DB blip.
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

    // NOTE (issue #1): this check is enforced client-side only, using values
    // that can originate from localStorage. A user can clear
    // nomos_daily_msg_count / nomos_daily_reset_at in devtools to bypass the
    // free-trial limit. This cannot be fully fixed from this file — real
    // enforcement requires the server (an RPC or edge function) to reject/
    // ignore increments once the daily cap is hit, rather than trusting the
    // client's count. TODO: replace with a server-validated check, e.g. by
    // having incrementMessageCount's RPC return whether the send was allowed
    // and short-circuiting the UI on `allowed: false`.
    const canSendMessage =
        isLoading ||
        subscriptionStatus === 'active' ||
        dailyMessageCount < DAILY_MESSAGE_LIMIT;

    const hasActiveSubscription = subscriptionStatus === 'active';
    const isFreeTrial = subscriptionStatus === 'free_trial';
    const freeTrialRemaining = Math.max(0, DAILY_MESSAGE_LIMIT - dailyMessageCount);

    // Milliseconds until the current window resets — for display purposes
    const msUntilReset = Math.max(0, DAY_MS - (Date.now() - new Date(dailyResetAt).getTime()));

    // Check and award badges. Previously only fired on an exact count match,
    // so any skipped/out-of-sync total (e.g. from the increment race in
    // issue #2, or a manual DB correction) meant the badge was missed
    // forever. Now fires whenever newTotal has crossed a threshold that
    // previousTotal hadn't reached yet, and lets the DB-side RPC (which
    // should already be idempotent per user+badge) be the source of truth
    // on whether it's actually newly earned.
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

    const incrementMessageCount = useCallback(async () => {
        if (!user) return;

        // NOTE (issue #2): this is a read-then-write increment. If two
        // increments overlap (rapid sends, multiple tabs), both can read the
        // same starting count and the second write silently clobbers the
        // first, losing a count. pendingCountsRef narrows this window by
        // chaining off the last *requested* value in this tab rather than
        // the last *confirmed* profile state, but it cannot fix cross-tab or
        // cross-device races. TODO: replace this block with a single
        // server-side RPC, e.g.:
        //   supabase.rpc('increment_message_count', { p_user_id: user.id })
        // that does `daily_message_count = daily_message_count + 1` and the
        // reset-if-due logic atomically in SQL, and returns the authoritative
        // new counts (and ideally an `allowed` boolean for issue #1).
        const dueForReset = isResetDue(pendingCountsRef.current?.resetAt ?? dailyResetAt);
        const baseDaily = dueForReset
            ? 0
            : (pendingCountsRef.current?.daily ?? profile?.daily_message_count ?? localDailyCount);
        const baseTotal = pendingCountsRef.current?.total ?? profile?.total_messages ?? localTotalCount;

        const newDaily = baseDaily + 1;
        const newTotal = baseTotal + 1;
        const nowIso = new Date().toISOString();

        pendingCountsRef.current = {
            daily: newDaily,
            total: newTotal,
            resetAt: dueForReset ? nowIso : (pendingCountsRef.current?.resetAt ?? dailyResetAt),
        };

        // Local counters always update as a fallback/optimistic layer
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
                // Roll back the pending marker so the next call re-reads from
                // confirmed profile state instead of building on a count that
                // never made it to the DB.
                if (pendingCountsRef.current?.total === newTotal) {
                    pendingCountsRef.current = null;
                }
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

                checkBadges(baseTotal, newTotal);

                // This request's value is now confirmed in profile state —
                // clear the pending marker if nothing newer has queued behind it.
                if (pendingCountsRef.current?.total === newTotal) {
                    pendingCountsRef.current = null;
                }
            }
        } else {
            // No profile / Supabase down: pending marker stays so the next
            // local-only increment still chains correctly instead of
            // re-reading stale localStorage each time.
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

            // NOTE (issue #4): a non-error response from functions.invoke only
            // confirms the HTTP call was accepted — not that the webhook's DB
            // write committed. Previously we set local state to 'active'
            // immediately and never checked back, so a refresh could revert
            // the UI if the DB write actually failed or was still processing.
            // Now we optimistically show 'active' for responsiveness, but
            // re-fetch the real row shortly after and reconcile — including
            // rolling back the optimistic state if the DB still disagrees.
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
                    // Webhook never confirmed after retries — trust the DB,
                    // not the optimistic guess, so the UI doesn't lie about
                    // payment status.
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
