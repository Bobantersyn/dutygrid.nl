"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Building2, User, ArrowRight } from "lucide-react";
import "@/components/Marketing/marketing.css";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.company || !formData.name || !formData.email || !formData.password) {
      setError("Vul alle velden in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/custom-auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          window.location.href = "/planning?view=today";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(result.error || "Er is een fout opgetreden bij het aanmelden.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Er is iets misgegaan. Probeer opnieuw.");
      setLoading(false);
    }
  };

  return (
    <div className="marketing-page m-login-page">
      <div className="m-login-card">
        {/* Logo */}
        <div className="m-login-logo">
          <a href="/">
            <img src="/logo.png" alt="DutyGrid" />
          </a>
        </div>

        {/* Title */}
        <h1 className="m-login-title">Start 14 dagen gratis</h1>

        {/* Error */}
        {error && <div className="m-login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={onSubmit} autoComplete="on" noValidate>
          {/* Company */}
          <div className="m-login-field">
            <div className="m-login-label">
              <span>Bedrijfsnaam</span>
            </div>
            <div className="m-login-input-wrap">
              <Building2 size={18} />
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Naam van uw beveiligingsbedrijf"
                required
              />
            </div>
          </div>

          {/* Name */}
          <div className="m-login-field">
            <div className="m-login-label">
              <span>Uw naam</span>
            </div>
            <div className="m-login-input-wrap">
              <User size={18} />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Voor- en achternaam"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="m-login-field">
            <div className="m-login-label">
              <span>E-mailadres</span>
            </div>
            <div className="m-login-input-wrap">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="voorbeeld@bedrijf.nl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="m-login-field" style={{ marginBottom: "24px" }}>
            <div className="m-login-label">
              <span>Wachtwoord</span>
            </div>
            <div className="m-login-input-wrap">
              <Lock size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kies een veilig wachtwoord"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="m-login-submit" disabled={loading}>
            {loading ? (
              "Account aanmaken..."
            ) : (
              <>
                Start mijn gratis proefperiode
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="m-login-security">
            ✨ Geen creditcard vereist
          </div>
        </form>
      </div>

      {/* Footer link outside card */}
      <div className="m-login-footer">
        Al een account? <a href="/account/signin">Inloggen</a>
      </div>

      {/* Page footer */}
      <div className="m-login-page-footer">
        © {new Date().getFullYear()} DutyGrid · Beveiligingsplanning Platform
      </div>
    </div>
  );
}
