"use client";

import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";

const plans = [
    {
        name: "Starter",
        priceMonthly: 79,
        subtitle: "1–5 medewerkers",
        popular: false,
        features: [
            "Planning & roosters",
            "Urenregistratie",
            "Basisrapportages (PDF)",
            "1 locatie & 1 beheerder",
            "Mobiele toegang",
            "E-mail support",
        ],
        cta: "Start 14 dagen gratis",
        ctaStyle: "m-btn m-btn-secondary",
        href: "/account/signup",
    },
    {
        name: "Growth",
        priceMonthly: 169,
        subtitle: "6–25 medewerkers",
        popular: true,
        extraCost: "Beste keuze voor groeiende beveiligingsbedrijven",
        features: [
            "Alles in Starter, plus:",
            "Incidentrapportage (basis)",
            "Meerdere locaties",
            "2 beheerders",
            "Urenexport voor facturatie",
            "Beperkte GPS",
            "Live chat & e-mail support",
        ],
        cta: "Start 14 dagen gratis",
        ctaStyle: "m-btn m-btn-primary",
        href: "/account/signup",
    },
    {
        name: "Professional",
        priceMonthly: 249,
        subtitle: "Tot 50 medewerkers inbegrepen",
        popular: false,
        extraCost: "+ €6 per extra medewerker/mnd",
        features: [
            "Alles in Growth, plus:",
            "Volledige facturatiemodule",
            "GPS tracking & geofencing",
            "Klantenportaal",
            "Geavanceerde rapportages",
            "3 beheerders",
            "Prioriteit live chat & e-mail",
            "Operationele inzichten",
        ],
        cta: "Start 14 dagen gratis",
        ctaStyle: "m-btn m-btn-secondary",
        href: "/account/signup",
    },
];

export function PricingCards() {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="m-section">
            <div className="m-container">
                <div className="m-section-header">
                    <div className="m-badge">Prijzen</div>
                    <h2 className="m-h2">Transparant Modulair Groeien</h2>
                    <p className="m-body">
                        Bedrijfskritische software voor beveiligingsbedrijven. Self-serve met slimme opvolging.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '32px', gap: '12px' }}>
                        <span style={{ fontWeight: !isAnnual ? 600 : 400, color: !isAnnual ? 'var(--m-text)' : 'var(--m-text-muted)' }}>Maandelijks</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            style={{
                                width: '60px', height: '32px', borderRadius: '16px', background: 'var(--m-primary)',
                                position: 'relative', border: 'none', cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                                position: 'absolute', top: '4px', left: isAnnual ? '32px' : '4px',
                                transition: '0.3s'
                            }} />
                        </button>
                        <span style={{ fontWeight: isAnnual ? 600 : 400, color: isAnnual ? 'var(--m-text)' : 'var(--m-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Jaarlijks
                            <span style={{ background: 'rgba(0,184,115,0.1)', color: 'var(--m-primary)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>2 maanden gratis</span>
                        </span>
                    </div>
                </div>

                <div className="m-pricing-grid" style={{ marginBottom: '32px' }}>
                    {plans.map((plan, index) => {
                        const displayPrice = isAnnual ? Math.round((plan.priceMonthly * 10) / 12) : plan.priceMonthly;

                        return (
                            <div
                                key={plan.name}
                                className={`m-glass-card m-pricing-card ${plan.popular ? "popular" : ""} m-animate`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {plan.popular && (
                                    <div className="m-pricing-popular-badge">Meest gekozen</div>
                                )}

                                <h3 className="m-h3">{plan.name}</h3>

                                <div className="m-pricing-price">
                                    <span className="m-pricing-amount">€{displayPrice}</span>
                                    <span className="m-pricing-period">/mnd</span>
                                </div>
                                {isAnnual && (
                                    <div style={{ fontSize: '14px', color: 'var(--m-primary)', fontWeight: 600, marginTop: '-8px', marginBottom: '8px' }}>
                                        Facturatie: €{plan.priceMonthly * 10} per jaar
                                    </div>
                                )}

                                <div className="m-pricing-subtitle" style={{ fontWeight: 600 }}>{plan.subtitle}</div>

                                {plan.extraCost && (
                                    <div className="m-pricing-extra-cost" style={{ fontSize: '0.875rem', color: plan.popular ? 'var(--m-primary)' : 'var(--m-text-muted)', marginTop: '4px', marginBottom: '16px', fontWeight: 500 }}>
                                        {plan.extraCost}
                                    </div>
                                )}

                                <ul className="m-pricing-features">
                                    {plan.features.map((feature) => (
                                        <li key={feature}>
                                            <Check size={16} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <a href={plan.href} className={plan.ctaStyle} style={{ marginTop: 'auto' }}>
                                    {plan.cta}
                                </a>
                            </div>
                        );
                    })}
                </div>

                {/* Enterprise Section */}
                <div className="m-glass-card m-animate" style={{ animationDelay: '0.6s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 32px' }}>
                    <div className="m-badge" style={{ marginBottom: '16px' }}>Enterprise</div>
                    <h3 className="m-h3">Groter dan 50 medewerkers?</h3>
                    <p className="m-body" style={{ maxWidth: '600px', margin: '0 auto 24px', color: 'var(--m-text-muted)' }}>
                        Voor organisaties met complexe eisen, API integraties, SSO, SLA garanties, dedicated onboarding en maatwerk oplossingen. Vanaf €399/mnd.
                    </p>
                    <a href="/contact" className="m-btn m-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        Neem contact op <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}
