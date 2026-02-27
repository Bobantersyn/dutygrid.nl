import { ArrowRight } from "lucide-react";

export function CTABanner() {
    return (
        <section className="m-section m-cta-section">
            <div className="m-container">
                <div className="m-cta-inner">
                    <h2 className="m-h2">
                        Klaar voor het operationele <span className="m-gradient-text">systeem?</span>
                    </h2>
                    <p className="m-body-lg">
                        14 dagen gratis · Geen creditcard · Direct toegang
                    </p>
                    <a href="/account/signup" className="m-btn m-btn-primary m-btn-lg">
                        Start 14 dagen gratis
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}
