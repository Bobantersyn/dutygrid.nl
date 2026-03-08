import { AlertCircle, CheckCircle2, MapPin, Users } from "lucide-react";

interface SubscriptionOverviewProps {
    planName: string;
    isTrial: boolean;
    trialDaysRemaining?: number;
    currentEmployees: number;
    maxEmployees: number;
    currentLocations: number;
    maxLocations: number;
}

export function SubscriptionOverview({
    planName,
    isTrial,
    trialDaysRemaining,
    currentEmployees,
    maxEmployees,
    currentLocations,
    maxLocations
}: SubscriptionOverviewProps) {
    const employeesPercentage = Math.min(100, Math.round((currentEmployees / maxEmployees) * 100));
    const locationsPercentage = maxLocations === Infinity
        ? 0
        : Math.min(100, Math.round((currentLocations / maxLocations) * 100));

    // Progress bar color logic
    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 70) return "bg-orange-400";
        return "bg-blue-600"; // < 70%
    };

    // Derived Trial States
    const isExpired = isTrial && (trialDaysRemaining === undefined || trialDaysRemaining <= 0);
    const isUrgent = isTrial && !isExpired && (trialDaysRemaining! < 5);

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">

                {/* Left Side: Current Plan Info */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900 m-0">
                            {isExpired ? 'Proefperiode verlopen' : isTrial ? 'Proefperiode actief' : planName}
                        </h2>
                        {isTrial ? (
                            isExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold border border-red-200">
                                    <AlertCircle size={16} /> Toegang beperkt
                                </span>
                            ) : isUrgent ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold border border-orange-200">
                                    <AlertCircle size={16} /> Trial verloopt bijna
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold border border-yellow-200">
                                    <AlertCircle size={16} /> Trial actief
                                </span>
                            )
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                                <CheckCircle2 size={16} /> Actief
                            </span>
                        )}
                    </div>

                    <div className="mb-8 max-w-md">
                        {isTrial ? (
                            isExpired ? (
                                <>
                                    <p className="text-slate-600">Je proefperiode is afgelopen.</p>
                                    <p className="text-slate-600 mt-1">Kies een abonnement om verder te werken in DutyGrid.</p>
                                </>
                            ) : isUrgent ? (
                                <>
                                    <p className="text-slate-600 font-medium text-orange-700">Nog {trialDaysRemaining} dagen resterend.</p>
                                    <p className="text-slate-600 mt-1">Activeer je abonnement om onderbreking te voorkomen.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-600">Je hebt momenteel toegang tot alle functies van DutyGrid tijdens je proefperiode.</p>
                                    <p className="text-slate-600 mt-1 font-medium text-slate-900">Nog {trialDaysRemaining} dagen volledige toegang.</p>
                                </>
                            )
                        ) : (
                            <p className="text-slate-600">Je abonnement is actief en wordt maandelijks automatisch verlengd.</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {isTrial ? (
                            isExpired ? (
                                <a href="#plans" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
                                    Abonnement activeren
                                </a>
                            ) : (
                                <>
                                    <a href="#plans" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
                                        Activeer abonnement
                                    </a>
                                    <a href="#plans" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all">
                                        Bekijk plannen
                                    </a>
                                </>
                            )
                        ) : (
                            <a href="#plans" className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-all">
                                Abonnement wijzigen
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Side: Usage Limits */}
                <div className="flex-1 w-full bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                        {isTrial ? 'Huidig gebruik tijdens proefperiode' : 'Huidig Gebruik'}
                    </h3>

                    {/* Employees Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Users size={18} className="text-slate-400" /> Medewerkers
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                                {currentEmployees} <span className="text-slate-500 font-normal">/ {maxEmployees === Infinity ? '∞' : maxEmployees}</span>
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor(employeesPercentage)}`}
                                style={{ width: `${employeesPercentage}%` }}
                            />
                        </div>
                        {employeesPercentage >= 100 && maxEmployees !== Infinity && (
                            <p className="text-xs text-red-600 font-medium mt-2">
                                Limiet bereikt. Activeer Professional om door te gaan zonder onderbreking.
                            </p>
                        )}
                    </div>

                    {/* Locations Progress */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <MapPin size={18} className="text-slate-400" /> Locaties
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                                {currentLocations} <span className="text-slate-500 font-normal">/ {maxLocations === Infinity ? '∞' : maxLocations}</span>
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor(locationsPercentage)}`}
                                style={{ width: `${locationsPercentage}%` }}
                            />
                        </div>
                        {locationsPercentage >= 100 && maxLocations !== Infinity && (
                            <p className="text-xs text-red-600 font-medium mt-2">
                                Limiet bereikt. Activeer Professional om door te gaan zonder onderbreking.
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

