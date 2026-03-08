"use client";

import { Check, AlertCircle } from "lucide-react";
import { useState } from "react";

const plans = [
    {
        id: "starter",
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
    },
    {
        id: "growth",
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
    },
    {
        id: "professional",
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
    },
];

interface SubscriptionPlansProps {
    currentPlanId: string;
    isTrial?: boolean;
    selectedPlanId?: string | null;
    onUpgrade?: (planId: string, isAnnual: boolean) => void;
}

export function SubscriptionPlans({ currentPlanId, isTrial = false, selectedPlanId = null, onUpgrade }: SubscriptionPlansProps) {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="mb-12">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Beschikbare Plannen</h2>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 bg-slate-50 p-1.5 rounded-full border border-slate-200">
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Maandelijks
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isAnnual ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Jaarlijks
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 font-bold border border-emerald-200">
                            2 maanden gratis
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan) => {
                    const displayPrice = isAnnual ? Math.round((plan.priceMonthly * 10) / 12) : plan.priceMonthly;
                    const isCurrentPlan = plan.id === currentPlanId;
                    const isSelectedDuringTrial = isTrial && plan.id === selectedPlanId;
                    const hasSelection = isTrial && selectedPlanId !== null;

                    // Logic separation: Paid plans vs Trial Plans
                    const isCurrentPaidPlan = isCurrentPlan && !isTrial;
                    const isCurrentTrialPlan = isCurrentPlan && isTrial; // We assume the trial plan is the one passed as currentPlanId (Professional)

                    return (
                        <div
                            key={plan.name}
                            className={`flex flex-col relative bg-white rounded-2xl p-6 sm:p-8 transition-all duration-300 ${plan.id === 'growth' ? 'order-first md:order-none' : ''} ${isCurrentPaidPlan
                                ? "bg-slate-50 ring-2 ring-blue-600 shadow-lg"
                                : plan.popular
                                    ? "ring-2 ring-blue-500 shadow-xl md:scale-105 z-10"
                                    : "ring-1 ring-slate-200 shadow-sm hover:shadow-md"
                                }`}
                        >
                            {/* Tags / Badges */}

                            {isCurrentPaidPlan && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-blue-700 border border-blue-600 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm pointer-events-none">
                                    Huidig plan
                                </div>
                            )}

                            {isCurrentTrialPlan && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm pointer-events-none flex items-center gap-1.5">
                                    <AlertCircle size={14} /> Trial
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>

                            <div className="mt-4 flex flex-col min-h-[5rem]">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">€{displayPrice}</span>
                                    <span className="text-base font-medium text-slate-500">/mnd</span>
                                </div>
                                {isAnnual && (
                                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                                        Facturatie: €{plan.priceMonthly * 10} per jaar
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 pb-6 border-b border-slate-100 flex flex-col justify-end min-h-[4rem]">
                                <p className="font-semibold text-slate-900">{plan.subtitle}</p>
                                {plan.extraCost && (
                                    <p className={`text-sm mt-1 font-medium ${plan.popular ? 'text-blue-600' : 'text-slate-500'}`}>
                                        {plan.extraCost}
                                    </p>
                                )}
                            </div>

                            <ul className="mt-6 mb-8 flex-1 space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                                        <Check className={`h-5 w-5 shrink-0 ${plan.popular ? 'text-blue-600' : 'text-emerald-500'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTAs */}
                            {isCurrentPaidPlan ? (
                                <button disabled className="mt-auto w-full bg-slate-200 text-slate-500 font-semibold py-3 px-4 rounded-xl cursor-not-allowed transition-colors">
                                    Huidig Actief
                                </button>
                            ) : isSelectedDuringTrial ? (
                                <button disabled className="mt-auto w-full bg-slate-100 text-slate-500 font-semibold py-3 px-4 rounded-xl cursor-default transition-colors border border-slate-200">
                                    Geselecteerd: Start na proefperiode
                                </button>
                            ) : (
                                <button
                                    onClick={() => onUpgrade?.(plan.id, isAnnual)}
                                    className={`mt-auto w-full font-semibold py-3 px-4 rounded-xl transition-all shadow-sm ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25 focus-visible:outline-blue-600'
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {isTrial
                                        ? (hasSelection ? `Wijzig naar ${plan.name}` : isCurrentTrialPlan ? `Activeer dit plan` : `Kies ${plan.name}`)
                                        : (plan.priceMonthly > plans.find(p => p.id === currentPlanId)!.priceMonthly ? `Upgrade naar ${plan.name}` : `Selecteer ${plan.name}`)
                                    }
                                </button>
                            )}

                            {/* Targeted info texts */}
                            {plan.id === "growth" && !isCurrentPaidPlan && !isCurrentTrialPlan && (
                                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">Beste keuze voor groeiende beveiligingsbedrijven.</p>
                            )}
                            {plan.id === "professional" && !isCurrentPaidPlan && !isCurrentTrialPlan && (
                                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">Voor organisaties met meerdere locaties en volledige automatisering.</p>
                            )}
                            {isCurrentTrialPlan && (
                                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">Je test momenteel dit plan tijdens de proefperiode.</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
