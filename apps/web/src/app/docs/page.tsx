"use client";

import { useState } from "react";
import { Book, Shield, User, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState("beveiliger");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Book className="text-blue-600" />
                        DutyGrid Handleiding
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Alles wat je moet weten over het gebruik van het systeem.
                    </p>

                    <div className="flex gap-4 mt-8">
                        <TabButton
                            active={activeTab === "beveiliger"}
                            onClick={() => setActiveTab("beveiliger")}
                            icon={<Shield size={20} />}
                            label="Voor Beveiligers"
                        />
                        <TabButton
                            active={activeTab === "planner"}
                            onClick={() => setActiveTab("planner")}
                            icon={<User size={20} />}
                            label="Voor Planners"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {activeTab === "beveiliger" ? <GuardGuide /> : <PlannerGuide />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${active
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function Accordion({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <span className="font-semibold text-lg text-gray-900">{title}</span>
                {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}

function GuardGuide() {
    return (
        <div className="space-y-4">
            <Accordion title="Hoe geef ik mijn beschikbaarheid op?">
                <p>Ga naar <strong>Beschikbaarheid</strong> in het menu.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Weekpatroon:</strong> Vul hier je standaard beschikbare dagen in (bijv. altijd maandag en vrijdag).</li>
                    <li><strong>Uitzonderingen:</strong> Heb je een keer vrij nodig op een dag dat je normaal werkt? Of wil je extra werken? Voeg dan een uitzondering toe via het tabblad "Uitzonderingen".</li>
                </ul>
                <p className="mt-2 text-sm text-gray-500">Let op: Sluitingsdatum voor beschikbaarheid is 4 weken vooruit.</p>
            </Accordion>

            <Accordion title="Ik kan niet werken op een geplande dienst. Wat nu?">
                <p>Als je al ingeroosterd staat, kun je een <strong>Ruilverzoek</strong> indienen.</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Ga naar "Planning" of "Diensten Ruilen".</li>
                    <li>Klik op de dienst die je wilt ruilen.</li>
                    <li>Kies "Ruil aanvragen".</li>
                    <li>Selecteer een collega (optioneel) of laat het open staan.</li>
                    <li>De planner moet dit verzoek goedkeuren. Tot die tijd ben jij verantwoordelijk!</li>
                </ol>
            </Accordion>

            <Accordion title="Hoe zie ik mijn uren?">
                <p>Na afloop van een dienst of week kun je je gewerkte uren controleren.</p>
                <p className="mt-2">Ga naar het dashboard. Binnenkort komt hier een specifiek tabblad "Mijn Uren" (Phase 3.6).</p>
            </Accordion>
        </div>
    );
}

function PlannerGuide() {
    return (
        <div className="space-y-4">
            <Accordion title="Hoe maak ik een nieuwe dienst aan?">
                <p>Ga naar de <strong>Planning</strong> pagina.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Klik op een leeg vakje in de kalender (Dag of Week weergave).</li>
                    <li>OF klik op de knop "+ Nieuwe Dienst" rechtsboven.</li>
                    <li>Vul de tijden, pauze en locatie in.</li>
                    <li>Wijs direct een beveiliger toe OF laat leeg voor een "Open Aanvraag".</li>
                </ul>
            </Accordion>

            <Accordion title="Hoe ga ik om met CAO waarschuwingen?">
                <p>Het systeem controleert automatisch op:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Max aantal uren per dag/week.</li>
                    <li>Rusttijden tussen diensten (minimaal 11 of 12 uur).</li>
                </ul>
                <p className="mt-2">Je krijgt een <strong>Oranje Waarschuwing</strong> als je een regel overtreedt. Je kunt de dienst wel opslaan (jij blijft de baas), maar er wordt een log gemaakt van de overschrijding.</p>
            </Accordion>

            <Accordion title="Hoe keur ik uren goed voor facturatie?">
                <p>Ga naar <strong>Facturatie &gt; Uren</strong>.</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Kies de maand.</li>
                    <li>Je ziet per dienst de "Geplande" tijden.</li>
                    <li>Als de werkelijkheid afwijkt, klik op het potloodje en pas de "Werkelijke tijden" aan.</li>
                    <li>Opslaan zet de status op "Geverifieerd" (Groen).</li>
                    <li>Gebruik de "Export CSV" knop om de data naar je boekhoudpakket te sturen.</li>
                </ol>
            </Accordion>

            <Accordion title="Hoe beheer ik systeeminstellingen?">
                <p>Alleen Admins/Planners hebben toegang tot <strong>Instellingen</strong> (tandwiel icoon).</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Reiskosten:</strong> Stel hier de standaard €/km vergoeding in.</li>
                    <li><strong>Gebruikers:</strong> Maak hier accounts aan voor nieuwe beveiligers.</li>
                </ul>
            </Accordion>
        </div>
    );
}
