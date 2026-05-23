/**
 * Referral Reward Engine
 * ─────────────────────
 * Milestones (cumulative approved referrals):
 *   1   → 1-month free subscription
 *   5   → featured badge added to profile
 *   10  → 6-month free subscription
 *   20+ → eligible for lifetime free (requires admin approval)
 *
 * Each milestone is applied once and never re-applied.
 * When a higher milestone is reached the subscription expiry is extended,
 * not reset — so partial time is never lost.
 */

import User      from "@/models/User";
import Referral  from "@/models/Referral";

/** Milestone definitions — ordered ascending so we evaluate lowest first. */
const MILESTONES = [
    { count: 1,  reward: "1_month_sub",    description: "1 month free subscription" },
    { count: 5,  reward: "featured_badge", description: "Featured badge on profile" },
    { count: 10, reward: "6_month_sub",    description: "6 months free subscription" },
    { count: 20, reward: "lifetime_eligible", description: "Eligible for lifetime free (admin approval required)" },
];

/**
 * Called whenever a referral moves to "approved".
 * Recalculates the referrer's total approved count and applies any
 * un-granted milestone rewards idempotently.
 *
 * @param {string|ObjectId} referrerId  – the referrer's User _id
 */
export async function applyReferralRewards(referrerId) {
    const approvedCount = await Referral.countDocuments({
        referrer: referrerId,
        status: "approved",
    });

    const referrer = await User.findById(referrerId);
    if (!referrer) return;

    let changed = false;

    for (const milestone of MILESTONES) {
        if (approvedCount < milestone.count) continue;

        switch (milestone.reward) {
            case "1_month_sub":
                changed = _extendSubscription(referrer, 1) || changed;
                break;

            case "featured_badge":
                if (!referrer.badges.includes("featured")) {
                    referrer.badges.push("featured");
                    // Also flip the Business.featured flag if it exists
                    changed = true;
                    _markBusinessFeatured(referrerId, true);
                }
                break;

            case "6_month_sub":
                changed = _extendSubscription(referrer, 6) || changed;
                break;

            case "lifetime_eligible":
                if (!referrer.lifetimeEligible) {
                    referrer.lifetimeEligible = true;
                    changed = true;
                }
                break;
        }
    }

    if (changed) await referrer.save();
    return { approvedCount, referrer };
}

/**
 * Extend the referrer's subscription by `months`.
 * If the subscription has already expired (or is free) start from today.
 * Returns true if the document was mutated.
 */
function _extendSubscription(user, months) {
    const now = new Date();
    const base = user.subscription?.expiresAt && user.subscription.expiresAt > now
        ? new Date(user.subscription.expiresAt)
        : now;

    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    // Only update if this would actually extend the expiry
    if (
        user.subscription.expiresAt &&
        user.subscription.expiresAt >= newExpiry
    ) {
        return false;
    }

    user.subscription.expiresAt = newExpiry;
    user.subscription.plan    = "pro";
    user.subscription.source  = "referral";
    return true;
}

/**
 * Fire-and-forget Business.featured update — referral engine shouldn't block
 * on this; any error is swallowed intentionally.
 */
async function _markBusinessFeatured(ownerId, featured) {
    try {
        const Business = (await import("@/models/Business")).default;
        await Business.updateOne({ owner: ownerId }, { $set: { featured } });
    } catch (_) {
        // non-critical — log but don't throw
    }
}

/**
 * Get a summary of a referrer's milestone progress for the dashboard.
 *
 * @param {string|ObjectId} referrerId
 * @returns {{ approvedCount, nextMilestone, progressPct, milestones }}
 */
export async function getReferralProgress(referrerId) {
    const [approvedCount, pendingCount] = await Promise.all([
        Referral.countDocuments({ referrer: referrerId, status: "approved" }),
        Referral.countDocuments({ referrer: referrerId, status: "pending" }),
    ]);

    // Find the next milestone the referrer hasn't reached yet
    const nextMilestone = MILESTONES.find((m) => approvedCount < m.count) ?? null;
    const prevMilestone = [...MILESTONES].reverse().find((m) => approvedCount >= m.count) ?? null;

    let progressPct = 100;
    if (nextMilestone) {
        const from = prevMilestone?.count ?? 0;
        progressPct = Math.round(
            ((approvedCount - from) / (nextMilestone.count - from)) * 100
        );
    }

    return {
        approvedCount,
        pendingCount,
        nextMilestone,
        prevMilestone,
        progressPct,
        milestones: MILESTONES.map((m) => ({
            ...m,
            reached: approvedCount >= m.count,
        })),
    };
}
