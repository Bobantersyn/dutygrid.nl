import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "€49",
        period: "/mnd",
        subtitle: "1-5 beveiligers · 1 locatie",
        popular: false,
        features: [
            "Basisplanning & roosters",
            "Urenregistratie",
            "Basis rapportages",
            "E-mail support",
            "1 beheerder",
        ],
        cta: "Start gratis proefperiode",
        ctaStyle: "m-btn m-btn-secondary",
        href: "/account/signup",
    },
    {
        name: "Professional",
        price: "€149",
        period: "/mnd",
        subtitle: "5-25 beveiligers · Onbeperkte locaties",
        popular: true,
        features: [
            "Alles in Starter, plus:",
            "GPS tracking & geofencing",
            "Shift swaps & beschikbaarheid",
            "Geavanceerde rapportages",
            "Urenexport & facturatie",
            "Incidentrapportage",
            "Klantenportaal",
            "Prioriteit support",
        ],
        cta: "Start gratis proefperiode",
        ctaStyle: "m-btn m-btn-primary",
        href: "/account/signup",
    },
    {
        name: "Enterprise",
        price: "Op maat",
        period: "",
        subtitle: "25+ beveiligers · Volledig maatwerk",
        popular: false,
        features: [
            "Alles in Professional, plus:",
            "API-toegang & integraties",
            "Single Sign-On (SSO)",
            "Dedicated accountmanager",
            "Custom features & branding",
            "SLA garantie",
            "Onboarding & training",
        ],
        cta: "Contact Sales",
        ctaStyle: "m-btn m-btn-accent",
        href: "/contact",
    },
];

export function PricingCards() {
    return (
        <section className="m-section">
            <div className="m-container">
                <div className="m-section-header">
                    <div className="m-badge">Prijzen</div>
                    <h2 className="m-h2">Eenvoudige, Transparante Prijzen</h2>
                    <p className="m-body">
                        Probeer DutyGrid 14 dagen gratis. Kies daarna het plan dat bij jouw organisatie past.
                    </p>
                </div>

                <div className="m-pricing-grid">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`m-glass-card m-pricing-card ${plan.popular ? "popular" : ""} m-animate`}
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            {plan.popular && (
                                <div className="m-pricing-popular-badge">Meest Populair</div>
                            )}

                            <h3 className="m-h3">{plan.name}</h3>

                            <div className="m-pricing-price">
                                <span className="m-pricing-amount">{plan.price}</span>
                                {plan.period && (
                                    <span className="m-pricing-period">{plan.period}</span>
                                )}
                            </div>

                            <div className="m-pricing-subtitle">{plan.subtitle}</div>

                            <ul className="m-pricing-features">
                                {plan.features.map((feature) => (
                                    <li key={feature}>
                                        <Check size={16} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a href={plan.href} className={plan.ctaStyle}>
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
