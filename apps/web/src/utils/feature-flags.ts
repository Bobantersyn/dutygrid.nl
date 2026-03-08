export type SubscriptionTier = 'trialing' | 'starter' | 'growth' | 'professional' | 'enterprise';

export type FeatureKey =
    | 'incident_reporting'
    | 'export_csv_excel'
    | 'billing_module'
    | 'gps_tracking'
    | 'client_portal'
    | 'pdf_reports';

const FEATURE_MATRIX: Record<FeatureKey, SubscriptionTier[]> = {
    pdf_reports: ['starter', 'growth', 'professional', 'enterprise', 'trialing'],
    incident_reporting: ['growth', 'professional', 'enterprise', 'trialing'],
    export_csv_excel: ['growth', 'professional', 'enterprise', 'trialing'],
    billing_module: ['professional', 'enterprise', 'trialing'],
    gps_tracking: ['professional', 'enterprise', 'trialing'],
    client_portal: ['professional', 'enterprise', 'trialing'],
};

export const ADMIN_LIMITS: Record<SubscriptionTier, number> = {
    starter: 1,
    growth: 2,
    professional: 3,
    enterprise: 999,
    trialing: 3, // Trials get Professional limits
};

export function hasFeatureAccess(tier: string | undefined | null, feature: FeatureKey): boolean {
    if (!tier) return false;

    // Normalize tier name just in case
    const normalizedTier = tier.toLowerCase() as SubscriptionTier;

    if (!FEATURE_MATRIX[feature]) {
        return false;
    }

    return FEATURE_MATRIX[feature].includes(normalizedTier);
}

export function getAdminLimit(tier: string | undefined | null): number {
    if (!tier) return 1; // Default fallback
    const normalizedTier = tier.toLowerCase() as SubscriptionTier;
    return ADMIN_LIMITS[normalizedTier] || 1;
}
