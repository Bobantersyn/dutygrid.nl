import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "€79",
        period: "/mnd",
        subtitle: "Voor zzp & kleine teams (1–5 medewerkers)",
        popular: false,
        features: [
            "Planning & roosters",
            "Urenregistratie",
            "Basisrapportages",
            "1 locatie",
            "1 beheerder",
            "Mobiele toegang",
            "E-mail support",
        ],
        cta: "Start 14 dagen gratis",
        ctaStyle: "m-btn m-btn-secondary",
        href: "/account/signup",
    },
    {
        name: "Professional",
        price: "€249",
        period: "/mnd",
        subtitle: "Basisprijs (tot 50 medewerkers)",
        popular: true,
        extraCost: "+ €6 per extra medewerker/mnd",
        features: [
            "Alles in Starter, plus:",
            "Volledige facturatiemodule",
            "GPS tracking & geofencing",
            "Incidentrapportage",
            "Klantenportaal",
            "Geavanceerde rapportages",
            "Meerdere locaties & 3 beheerders",
            "Prioriteit support",
        ],
        cta: "Start 14 dagen gratis",
        ctaStyle: "m-btn m-btn-primary",
        href: "/account/signup",
    },
    {
        name: "Enterprise",
        price: "Vanaf €399",
        period: "/mnd",
        subtitle: "50+ medewerkers & complexe operaties",
        popular: false,
        extraCost: "+ €6 per extra medewerker/mnd",
        features: [
            "Alles in Professional, plus:",
            "API & integraties",
            "Single Sign-On (SSO)",
            "SLA garanties",
            "Dedicated onboarding",
            "Onbeperkte beheerders",
            "Maatwerk ontwikkeling",
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
                    <h2 className="m-h2">Transparant Modulair Groeien</h2>
                    <p className="m-body">
                        Ontworpen voor beveiligingsbedrijven die hun planning, uren en facturatie professioneel willen organiseren.
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
                                <div className="m-pricing-popular-badge">Beste keuze voor groeiende beveiligingsbedrijven</div>
                            )}

                            <h3 className="m-h3">{plan.name}</h3>

                            <div className="m-pricing-price">
                                <span className="m-pricing-amount">{plan.price}</span>
                                {plan.period && (
                                    <span className="m-pricing-period">{plan.period}</span>
                                )}
                            </div>

                            <div className="m-pricing-subtitle">{plan.subtitle}</div>

                            {plan.extraCost && (
                                <div className="m-pricing-extra-cost" style={{ fontSize: '0.875rem', color: 'var(--m-primary)', marginTop: '-8px', marginBottom: '16px', fontWeight: 500 }}>
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
