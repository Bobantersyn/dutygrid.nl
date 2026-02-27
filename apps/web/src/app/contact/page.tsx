"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { MarketingLayout } from "@/components/Marketing/MarketingLayout";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitted(true);
        setLoading(false);
    };

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
                        <div className="m-badge">Contact</div>
                        <h1 className="m-h1">
                            Neem <span className="m-gradient-text">Contact Op</span>
                        </h1>
                        <p className="m-body-lg">
                            Heeft u vragen over DutyGrid? Vul het formulier in en wij helpen u graag verder.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form + Info */}
            <section className="m-section" style={{ background: "var(--m-bg-dark-2)" }}>
                <div className="m-container">
                    <div className="m-contact-grid">
                        {/* Form */}
                        <div className="m-glass-card">
                            {submitted ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <CheckCircle size={48} style={{ color: "var(--m-accent)", marginBottom: "16px" }} />
                                    <h3 className="m-h3" style={{ marginBottom: "12px" }}>Bericht Verzonden!</h3>
                                    <p className="m-body">
                                        Bedankt voor uw bericht. Wij nemen zo snel mogelijk contact met u op.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="m-contact-form">
                                    <h2 className="m-h3" style={{ marginBottom: "8px" }}>Stuur ons een bericht</h2>
                                    <p className="m-body" style={{ marginBottom: "16px" }}>
                                        Vul het formulier in en wij reageren binnen 24 uur.
                                    </p>

                                    <input
                                        type="text"
                                        placeholder="Uw naam"
                                        className="m-contact-input"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="E-mailadres"
                                        className="m-contact-input"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Bedrijfsnaam"
                                        className="m-contact-input"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Uw bericht..."
                                        className="m-contact-input"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        className="m-btn m-btn-primary"
                                        disabled={loading}
                                        style={{ width: "100%" }}
                                    >
                                        {loading ? "Verzenden..." : "Verstuur Bericht"}
                                        {!loading && <Send size={16} />}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="m-contact-info">
                            <div className="m-glass-card">
                                <h3 className="m-h3" style={{ marginBottom: "24px" }}>Contactgegevens</h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div className="m-contact-info-item">
                                        <div className="m-contact-info-icon">
                                            <Mail size={20} />
                                        </div>
                                        <div className="m-contact-info-text">
                                            <h4>E-mail</h4>
                                            <p>info@dutygrid.nl</p>
                                        </div>
                                    </div>

                                    <div className="m-contact-info-item">
                                        <div className="m-contact-info-icon">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="m-contact-info-text">
                                            <h4>Locatie</h4>
                                            <p>Nederland</p>
                                        </div>
                                    </div>

                                    <div className="m-contact-info-item">
                                        <div className="m-contact-info-icon">
                                            <Phone size={20} />
                                        </div>
                                        <div className="m-contact-info-text">
                                            <h4>Telefonisch</h4>
                                            <p>Op afspraak</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="m-glass-card">
                                <h3 className="m-h3" style={{ marginBottom: "12px" }}>Direct Starten</h3>
                                <p className="m-body">
                                    Klaar om DutyGrid in actie te zien?{" "}
                                    <a href="/account/signup" style={{ color: "var(--m-primary)", textDecoration: "none", fontWeight: 500 }}>
                                        Maak direct een account aan
                                    </a>{" "}
                                    en start uw 14 dagen gratis proefperiode.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
