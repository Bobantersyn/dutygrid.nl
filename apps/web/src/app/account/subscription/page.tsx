"use client";

import { useState } from "react";
import { TopNavigation } from "@/components/Navigation/TopNavigation";
import { MarketingFooter as Footer } from "@/components/Marketing/MarketingFooter";
import { SubscriptionOverview } from "@/components/Subscription/SubscriptionOverview";
import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";

export default function SubscriptionPage() {
    // Currently hardcoded/mocked. In a real scenario, this would come from the database/Stripe
    const [currentPlanId] = useState("starter");

    const handleUpgrade = (planId: string, isAnnual: boolean) => {
        // Here we would integrate with Stripe Checkout
        console.log(`Upgrading to ${planId}, annual: ${isAnnual}`);
        alert(`Je wordt doorgestuurd naar de betaalpagina voor het ${planId} abonnement.`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <TopNavigation />

            <main className="flex-1 pt-24 pb-16">
                <div className="m-container">

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">Abonnement & Facturatie</h1>
                        <p className="m-body mt-2 text-gray-500">
                            Beheer je actieve abonnement, bekijk je limieten en download facturen.
                        </p>
                    </div>

                    {/* Active Subscription Overview */}
                    <SubscriptionOverview
                        planName="Starter"
                        isTrial={true}
                        trialDaysRemaining={14}
                        currentEmployees={2}
                        maxEmployees={5}
                        currentLocations={1}
                        maxLocations={1}
                    />

                    {/* Available Plans (Upgrade paths) */}
                    <div className="mt-16">
                        <SubscriptionPlans
                            currentPlanId={currentPlanId}
                            onUpgrade={handleUpgrade}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
