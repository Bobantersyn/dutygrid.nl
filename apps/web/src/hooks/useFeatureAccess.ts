import { useUserRole } from "./useUserRole";
import { hasFeatureAccess, getAdminLimit } from "@/utils/feature-flags";
import type { FeatureKey, SubscriptionTier } from "@/utils/feature-flags";

export function useFeatureAccess() {
    const { user, userLoading } = useUserRole();

    const tier = user?.subscription_status as SubscriptionTier | undefined;

    const canAccess = (feature: FeatureKey) => {
        // During loading, conservatively return false (or true if you prefer to hide UI flicker, 
        // but false is safer for feature gating). We return false to avoid layout shifts if possible,
        // or you could return a loading state instead.
        if (userLoading) return false;
        return hasFeatureAccess(tier, feature);
    };

    const adminLimit = getAdminLimit(tier);

    return {
        canAccess,
        adminLimit,
        tier: tier || 'trialing',
        isLoading: userLoading,
    };
}
