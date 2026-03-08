import React from "react";
import { Lock } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureKey } from "@/utils/feature-flags";

interface FeatureGateProps {
    feature: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    title?: string;
    description?: string;
    hideContent?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
    feature,
    children,
    fallback,
    title = "Upgrade vereist",
    description = "Deze functie is niet inbegrepen in je huidige plan. Upgrade naar een hoger pakket om toegang te krijgen.",
    hideContent = false
}) => {
    const { canAccess, isLoading } = useFeatureAccess();

    if (isLoading) {
        return null; // Of een loading spinner
    }

    const hasAccess = canAccess(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    // Als we custom fallback leveren (bijv. een compleet leeg scherm in plaats van een blur)
    if (fallback) {
        return <>{fallback}</>;
    }

    // Standaard 'Blur & Lock' UI
    return (
        <div style={{ position: "relative", zIndex: 0, width: "100%", height: "100%" }}>
            {/* Blurred out content behind the lock */}
            {!hideContent && (
                <div style={{ filter: "blur(4px)", opacity: 0.6, pointerEvents: "none", userSelect: "none" }}>
                    {children}
                </div>
            )}

            {/* Lock Overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: hideContent ? "var(--m-bg-dark-2)" : "rgba(10, 15, 23, 0.4)",
                    backdropFilter: hideContent ? "none" : "blur(2px)",
                    borderRadius: "16px",
                    padding: "32px",
                    textAlign: "center",
                    zIndex: 10,
                }}
                className="m-glass-card"
            >
                <div style={{
                    width: "56px", height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                    <Lock size={28} style={{ color: "var(--m-text)" }} />
                </div>

                <h3 className="m-h3" style={{ marginBottom: "8px", fontSize: "1.25rem" }}>
                    {title}
                </h3>
                <p className="m-body" style={{ color: "var(--m-text-muted)", maxWidth: "300px", marginBottom: "24px" }}>
                    {description}
                </p>

                <a href="/prijzen" className="m-btn m-btn-primary" style={{ textDecoration: "none" }}>
                    Bekijk onze pakketten
                </a>
            </div>
        </div>
    );
};
