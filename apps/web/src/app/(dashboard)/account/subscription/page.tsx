import { MetaFunction } from "react-router";
import { SubscriptionOverview } from "@/components/Subscription/SubscriptionOverview";
import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { User, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Mijn Abonnement | DutyGrid" },
        { name: "description", content: "Beheer je DutyGrid abonnement en facturatie." },
    ];
};

export default function SubscriptionPage() {
    // In a real app this would come from an API/context.
    const [currentPlanId, setCurrentPlanId] = useState("professional");
    const [selectedTrialPlanId, setSelectedTrialPlanId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<{ id: string, name: string, isUpgrade: boolean, isAnnual: boolean } | null>(null);

    const mockSubscriptionData = {
        planName: "Professional - Proefperiode",
        isTrial: true,
        trialDaysRemaining: 14,
        currentEmployees: 7,
        maxEmployees: 20, // Trial limit
        currentLocations: 1,
        maxLocations: 1,  // Trial limit
    };

    const handlePlanAction = (planId: string, isAnnual: boolean) => {
        // Determine if upgrade or downgrade (simplified logic based on static ranking)
        const planRank = { "starter": 1, "growth": 2, "professional": 3 };
        const currentRank = planRank[currentPlanId as keyof typeof planRank] || 1;
        const newRank = planRank[planId as keyof typeof planRank] || 1;

        const isUpgrade = newRank > currentRank;
        const planNames = { "starter": "Starter", "growth": "Growth", "professional": "Professional" };

        setPendingPlan({
            id: planId,
            name: planNames[planId as keyof typeof planNames] || planId,
            isUpgrade,
            isAnnual
        });
        setIsModalOpen(true);
    };

    const confirmPlanChange = () => {
        if (pendingPlan) {
            console.log(`Confirmed change to: ${pendingPlan.id} (${pendingPlan.isAnnual ? 'Jaarlijks' : 'Maandelijks'})`);
            // Here you would trigger the Stripe flow or database update

            if (mockSubscriptionData.isTrial) {
                // In trial mode, we just store the selection for later billing
                setSelectedTrialPlanId(pendingPlan.id);
            } else {
                // For demo purposes, we'll just update the local state if it's an upgrade
                if (pendingPlan.isUpgrade) {
                    alert(`Je wordt nu doorgestuurd naar de betaalomgeving om het abonnement te verhogen naar ${pendingPlan.name}.`);
                } else {
                    setCurrentPlanId(pendingPlan.id);
                    alert(`Je abonnement is succesvol omgezet naar ${pendingPlan.name}. De wijziging gaat in per de volgende facturatieperiode.`);
                }
            }
        }
        setIsModalOpen(false);
        setPendingPlan(null);
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <User size={24} />
                    </div>
                    Mijn Abonnement
                </h1>
                <p className="mt-3 text-lg text-slate-600 max-w-2xl">
                    Beheer je actieve DutyGrid abonnement, bekijk je gebruikslimieten en wijzig je facturatiegegevens.
                </p>
            </div>

            <SubscriptionOverview {...mockSubscriptionData} />

            <div id="plans" className="pt-8">
                <SubscriptionPlans
                    currentPlanId={currentPlanId}
                    isTrial={mockSubscriptionData.isTrial}
                    selectedPlanId={selectedTrialPlanId}
                    onUpgrade={handlePlanAction}
                />
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && pendingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${mockSubscriptionData.isTrial || pendingPlan.isUpgrade ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {mockSubscriptionData.isTrial || pendingPlan.isUpgrade ? <ArrowUpRight size={24} /> : <ShieldAlert size={24} />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {mockSubscriptionData.isTrial ? 'Abonnement Selecteren' : pendingPlan.isUpgrade ? 'Abonnement Upgraden' : 'Abonnement Downgraden'}
                                </h3>
                            </div>

                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {mockSubscriptionData.isTrial ? (
                                    <>
                                        Je hebt gekozen voor het <strong>{pendingPlan.name}</strong> plan. Je betaalt pas als je proefperiode verloopt over <strong>{mockSubscriptionData.trialDaysRemaining} dagen</strong>. Je kunt deze keuze tot die tijd altijd nog kosteloos wijzigen.
                                    </>
                                ) : pendingPlan.isUpgrade ? (
                                    <>Je staat op het punt om je abonnement te upgraden naar <strong>{pendingPlan.name}</strong>. Deze wijziging gaat direct in, zodat je meteen gebruik kunt maken van de nieuwe functies. Je betaalt naar rato alleen het verschil voor de huidige periode.</>
                                ) : (
                                    <>Weet je zeker dat je wilt downgraden naar <strong>{pendingPlan.name}</strong>? Je behoudt toegang tot je huidige functies tot het einde van de huidige facturatieperiode. Daarna vallen functies buiten dit pakket weg.</>
                                )}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={confirmPlanChange}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm ${mockSubscriptionData.isTrial || pendingPlan.isUpgrade
                                        ? 'bg-blue-600 hover:bg-blue-500'
                                        : 'bg-orange-600 hover:bg-orange-500'
                                        }`}
                                >
                                    {mockSubscriptionData.isTrial ? 'Bevestig selectie' : pendingPlan.isUpgrade ? 'Ga naar betalen' : 'Bevestig downgrade'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
