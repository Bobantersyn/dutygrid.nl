"use client";

import { Building2, Mail, LogOut, ArrowRight, AlertCircle } from "lucide-react";
import "@/components/Marketing/marketing.css";
import { useEffect, useState } from "react";

export default function TrialExpiredPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/custom-auth/session");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch user session:", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch("/api/custom-auth/logout", { method: "POST" });
        window.location.href = "/account/signin";
    };

    return (
        <div className="marketing-page m-login-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="m-login-card" style={{ maxWidth: "500px", textAlign: "center", padding: "48px 32px" }}>
                {/* Logo */}
                <div className="m-login-logo" style={{ marginBottom: "32px", display: "flex", justifyContent: "center" }}>
                    <img src="/logo.png" alt="DutyGrid" style={{ height: "48px" }} />
                </div>

                {/* Expiration Icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", color: "var(--m-accent)" }}>
                    <div style={{ background: "rgba(255, 150, 64, 0.1)", padding: "16px", borderRadius: "50%" }}>
                        <AlertCircle size={48} />
                    </div>
                </div>

                {/* Title and Message */}
                <h1 className="m-login-title" style={{ fontSize: "1.75rem", marginBottom: "16px" }}>
                    Je proefperiode is verlopen
                </h1>

                <p className="m-body" style={{ color: "var(--m-text-muted)", marginBottom: "32px", fontSize: "1rem", lineHeight: "1.6" }}>
                    {user?.name ? `Beste ${user.name}, d` : "D"}e 14 dagen gratis toegang tot DutyGrid voor <strong>{user?.company_name || "jouw organisatie"}</strong> zijn helaas om. Om toegang te behouden tot je roosters en team, moet je account worden geactiveerd.
                </p>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <a href="mailto:sales@dutygrid.nl?subject=DutyGrid%20Account%20Activeren" className="m-btn m-btn-primary m-btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                        <Mail size={18} style={{ marginRight: "8px" }} />
                        Neem contact op voor activatie
                    </a>

                    <button
                        onClick={handleLogout}
                        className="m-btn m-btn-secondary"
                        style={{ width: "100%", justifyContent: "center", background: "transparent", color: "var(--m-text-muted)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        <LogOut size={16} style={{ marginRight: "8px" }} />
                        Uitloggen
                    </button>
                </div>

                {/* Support text */}
                <p style={{ marginTop: "32px", fontSize: "0.875rem", color: "var(--m-text-muted)" }}>
                    Vragen over prijzen of abonnementen? <br />
                    <a href="/prijzen" target="_blank" rel="noopener noreferrer" style={{ color: "var(--m-primary)", textDecoration: "none" }}>Bekijk onze prijzen</a> of stuur ons een e-mail.
                </p>
            </div>
        </div>
    );
}
