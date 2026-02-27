import { Shield, ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section className="m-hero">
            <div className="m-hero-content">
                <div className="m-badge m-animate">
                    <Shield size={14} />
                    Beveiligingsplanning Platform
                </div>

                <h1 className="m-h1 m-animate m-animate-delay-1">
                    Het operationele platform voor{" "}
                    <span className="m-gradient-text">beveiligingsbedrijven.</span>
                </h1>

                <p className="m-body-lg m-animate m-animate-delay-2" style={{ maxWidth: "600px", margin: "0 auto 40px auto" }}>
                    Niet een tool. Niet een experiment. Maar een systeem.
                </p>

                <div className="m-hero-buttons m-animate m-animate-delay-3">
                    <a href="/account/signup" className="m-btn m-btn-primary m-btn-lg">
                        Start 14 dagen gratis
                        <ArrowRight size={18} />
                    </a>
                </div>
                <div className="m-hero-subtext m-animate m-animate-delay-3" style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--m-text-muted)', textAlign: 'center' }}>
                    14 dagen gratis · Geen creditcard · Direct toegang
                </div>

                <div className="m-hero-stats m-animate m-animate-delay-4">
                    <div className="m-hero-stat">
                        <div className="m-hero-stat-value">99.9%</div>
                        <div className="m-hero-stat-label">Uptime</div>
                    </div>
                    <div className="m-hero-stat">
                        <div className="m-hero-stat-value">24/7</div>
                        <div className="m-hero-stat-label">Support</div>
                    </div>
                    <div className="m-hero-stat">
                        <div className="m-hero-stat-value">NL</div>
                        <div className="m-hero-stat-label">Gehost in Nederland</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
