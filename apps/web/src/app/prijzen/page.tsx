import { MarketingLayout } from "@/components/Marketing/MarketingLayout";
import { PricingCards } from "@/components/Marketing/PricingCards";
import { CTABanner } from "@/components/Marketing/CTABanner";
import { Check, X } from "lucide-react";

const comparisonFeatures = [
    { name: "Basisplanning", starter: true, pro: true, enterprise: true },
    { name: "Urenregistratie", starter: true, pro: true, enterprise: true },
    { name: "Basis rapportages", starter: true, pro: true, enterprise: true },
    { name: "E-mail support", starter: true, pro: true, enterprise: true },
    { name: "GPS Tracking", starter: false, pro: true, enterprise: true },
    { name: "Incidentrapportage", starter: false, pro: true, enterprise: true },
    { name: "Klantenportaal", starter: false, pro: true, enterprise: true },
    { name: "Geavanceerde rapportages", starter: false, pro: true, enterprise: true },
    { name: "Shift swaps", starter: false, pro: true, enterprise: true },
    { name: "API-toegang", starter: false, pro: false, enterprise: true },
    { name: "SSO integratie", starter: false, pro: false, enterprise: true },
    { name: "Dedicated support", starter: false, pro: false, enterprise: true },
    { name: "Custom branding", starter: false, pro: false, enterprise: true },
];

export default function PrijzenPage() {
    return (
        <MarketingLayout>
            {/* Hero */}
            <section
                className="m-section"
                style={{
                    paddingTop: "calc(var(--m-nav-height) + 60px)",
                    background: "linear-gradient(180deg, var(--m-bg-dark) 0%, var(--m-bg-dark-2) 100%)",
                }}
            >
                <div className="m-container">
                    <div className="m-section-header">
                        <div className="m-badge m-badge-accent">Prijzen</div>
                        <h1 className="m-h1">
                            Eenvoudige,{" "}
                            <span className="m-gradient-text">Transparante Prijzen</span>
                        </h1>
                        <p className="m-body-lg">
                            Geen verborgen kosten. Geen lange contracten. Kies het plan dat bij uw organisatie past.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <PricingCards />

            {/* Comparison Table */}
            <section className="m-section" style={{ background: "var(--m-bg-dark-2)" }}>
                <div className="m-container">
                    <div className="m-section-header">
                        <h2 className="m-h2">Vergelijk Alle Functies</h2>
                    </div>

                    <div className="m-glass-card" style={{ overflow: "auto", padding: "0" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontFamily: "var(--marketing-font)",
                                minWidth: "500px",
                            }}
                        >
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--m-glass-border)" }}>
                                    <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--m-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                                        Functie
                                    </th>
                                    <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--m-text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                                        Starter
                                    </th>
                                    <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--m-primary-light)", fontSize: "0.875rem", fontWeight: 600 }}>
                                        Professional
                                    </th>
                                    <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--m-accent)", fontSize: "0.875rem", fontWeight: 600 }}>
                                        Enterprise
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures.map((f, i) => (
                                    <tr
                                        key={f.name}
                                        style={{
                                            borderBottom: i < comparisonFeatures.length - 1 ? "1px solid var(--m-glass-border)" : "none",
                                        }}
                                    >
                                        <td style={{ padding: "14px 24px", color: "var(--m-text-secondary)", fontSize: "0.875rem" }}>
                                            {f.name}
                                        </td>
                                        {[f.starter, f.pro, f.enterprise].map((has, j) => (
                                            <td key={j} style={{ textAlign: "center", padding: "14px 24px" }}>
                                                {has ? (
                                                    <Check size={18} style={{ color: "var(--m-accent)" }} />
                                                ) : (
                                                    <X size={18} style={{ color: "var(--m-text-muted)", opacity: 0.4 }} />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <CTABanner />
        </MarketingLayout>
    );
}
