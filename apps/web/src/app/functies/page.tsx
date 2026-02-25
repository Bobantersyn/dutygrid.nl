import { MarketingLayout } from "@/components/Marketing/MarketingLayout";
import { Calendar, MapPin, FileText, Clock, Users, BarChart3, Check, Shield, Zap, Globe } from "lucide-react";
import { CTABanner } from "@/components/Marketing/CTABanner";

const mainFeatures = [
    {
        icon: Calendar,
        title: "Slimme Planning",
        description:
            "Maak in minuten optimale roosters. Onze algoritmes houden rekening met rusttijden, kwalificaties, beschikbaarheid en CAO-regels.",
        items: [
            "Automatische roosteroptimalisatie",
            "Rustcontrole conform CAO",
            "Kwalificatie-matching",
            "Gap-detectie en meldingen",
            "Drag & drop planning interface",
        ],
    },
    {
        icon: MapPin,
        title: "GPS & Locatiebeheer",
        description:
            "Houd real-time overzicht over al uw locaties en medewerkers. Van checkpoint controles tot geofencing.",
        items: [
            "Live GPS tracking",
            "Geofencing & automatische check-in",
            "Checkpoint rondes",
            "NFC, QR & GPS controles",
            "Historische route-weergave",
        ],
    },
    {
        icon: FileText,
        title: "Incidentrapportage",
        description:
            "Digitale incidentmeldingen met foto's, locatie en tijdstempel. Direct beschikbaar voor opdrachtgevers.",
        items: [
            "Digitale rapportformulieren",
            "Foto- en video-uploads",
            "Realtime notificaties",
            "Automatische rapportgeneratie",
            "Klantportaal toegang",
        ],
    },
    {
        icon: Clock,
        title: "Urenregistratie & Facturatie",
        description:
            "Automatische urenregistratie op basis van de planning. Export naar Excel of koppel direct met uw boekhouding.",
        items: [
            "Automatisch uren bijhouden",
            "Toeslagen & overwerk berekening",
            "Excel export",
            "Facturatie-overzichten per klant",
            "Maand- en weekrapportages",
        ],
    },
    {
        icon: Users,
        title: "Personeelsbeheer",
        description:
            "Alle medewerkerinformatie op één plek. Van beschikbaarheid tot verlofaanvragen en kwalificaties.",
        items: [
            "Medewerkerprofielen",
            "Beschikbaarheid beheer",
            "Verlofaanvragen & goedkeuring",
            "Kwalificaties & certificaten",
            "Contractbeheer",
        ],
    },
    {
        icon: BarChart3,
        title: "Rapportages & Analyse",
        description:
            "Inzichtelijke dashboards en rapporten. Van operationele KPI's tot financiële overzichten.",
        items: [
            "Realtime dashboards",
            "KPI-monitoring",
            "Trendrapporten",
            "Klantgerichte exports",
            "Audit logging",
        ],
    },
];

export default function FunctiesPage() {
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
                        <div className="m-badge">
                            <Zap size={14} />
                            Platform Functies
                        </div>
                        <h1 className="m-h1">
                            Krachtige Functies voor{" "}
                            <span className="m-gradient-text">Beveiligingsplanning</span>
                        </h1>
                        <p className="m-body-lg">
                            Ontdek hoe DutyGrid uw dagelijkse beveiligingsoperaties stroomlijnt met slimme tools en automatisering.
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature detail sections */}
            {mainFeatures.map((feature, index) => (
                <section
                    key={feature.title}
                    className="m-section"
                    style={{
                        background: index % 2 === 0 ? "var(--m-bg-dark-2)" : "var(--m-bg-dark)",
                    }}
                >
                    <div className="m-container">
                        <div className={`m-feature-detail ${index % 2 !== 0 ? "reverse" : ""}`}>
                            {/* Icon card */}
                            <div className="m-glass-card" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                                    <div className="m-feature-icon" style={{ width: "80px", height: "80px", borderRadius: "20px" }}>
                                        <feature.icon size={40} />
                                    </div>
                                    <h3 className="m-h3" style={{ fontSize: "1.25rem" }}>{feature.title}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="m-feature-detail-content">
                                <h2 className="m-h2">{feature.title}</h2>
                                <p className="m-body-lg">{feature.description}</p>
                                <ul className="m-feature-detail-list">
                                    {feature.items.map((item) => (
                                        <li key={item}>
                                            <Check size={16} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Extra capabilities */}
            <section className="m-section" style={{ background: "var(--m-bg-dark-2)" }}>
                <div className="m-container">
                    <div className="m-section-header">
                        <h2 className="m-h2">En nog veel meer...</h2>
                    </div>
                    <div className="m-features-grid">
                        {[
                            { icon: Shield, title: "Beveiligde Data", desc: "SSL-versleuteling, GDPR-compliant en Nederlandse hosting." },
                            { icon: Zap, title: "Razendsnelle Interface", desc: "Gebouwd voor snelheid. Realtime updates zonder pagina-verversing." },
                            { icon: Globe, title: "Overal Toegankelijk", desc: "Werkt op desktop, tablet en mobiel. Altijd en overal beschikbaar." },
                        ].map((item) => (
                            <div key={item.title} className="m-glass-card m-feature-card">
                                <div className="m-feature-icon">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="m-h3">{item.title}</h3>
                                <p className="m-body">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTABanner />
        </MarketingLayout>
    );
}
