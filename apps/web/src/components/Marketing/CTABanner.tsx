import { ArrowRight } from "lucide-react";

export function CTABanner() {
    return (
        <section className="m-section m-cta-section">
            <div className="m-container">
                <div className="m-cta-inner">
                    <h2 className="m-h2">
                        Klaar om uw beveiligingsplanning te <span className="m-gradient-text">optimaliseren?</span>
                    </h2>
                    <p className="m-body-lg">
                        Start vandaag nog met DutyGrid en ervaar hoe eenvoudig beveiligingsplanning kan zijn.
                    </p>
                    <a href="/contact" className="m-btn m-btn-primary m-btn-lg">
                        Vraag een Gratis Demo Aan
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}
