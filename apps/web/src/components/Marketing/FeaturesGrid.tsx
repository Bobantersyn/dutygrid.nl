import { Calendar, MapPin, FileText, Clock, Users, BarChart3 } from "lucide-react";

const features = [
    {
        icon: Calendar,
        title: "Slimme Planning",
        description:
            "Automatische roosteroptimalisatie met rustcontrole, kwalificatie-matching en gapdetectie. Nooit meer dubbele shifts.",
    },
    {
        icon: MapPin,
        title: "GPS & Locatiebeheer",
        description:
            "Live tracking, geofencing en checkpoint controles. Weet altijd waar uw beveiligers zich bevinden.",
    },
    {
        icon: FileText,
        title: "Incidentrapportage",
        description:
            "Digitale rapporten met foto-uploads en realtime notificaties. Direct overzicht voor opdrachtgevers.",
    },
    {
        icon: Clock,
        title: "Urenregistratie",
        description:
            "Automatisch bijhouden van gewerkte uren. Exporteer naar Excel of koppel met uw facturatiesysteem.",
    },
    {
        icon: Users,
        title: "Personeelsbeheer",
        description:
            "Medewerkerprofielen, beschikbaarheid, verlofaanvragen en kwalificaties — alles op één plek.",
    },
    {
        icon: BarChart3,
        title: "Rapportages & Analyse",
        description:
            "Inzichtelijke dashboards met KPI's, trendrapporten en klantgerichte exports.",
    },
];

export function FeaturesGrid() {
    return (
        <section className="m-section" style={{ background: "var(--m-bg-dark-2)" }}>
            <div className="m-container">
                <div className="m-section-header">
                    <div className="m-badge">Functies</div>
                    <h2 className="m-h2">Waarom DutyGrid?</h2>
                    <p className="m-body">
                        Speciaal gebouwd voor beveiligingsbedrijven. Alle tools die u nodig heeft, in één overzichtelijk platform.
                    </p>
                </div>

                <div className="m-features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="m-glass-card m-feature-card m-animate"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="m-feature-icon">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="m-h3">{feature.title}</h3>
                            <p className="m-body">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
