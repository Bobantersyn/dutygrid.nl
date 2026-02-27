"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import "@/components/Marketing/marketing.css";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Vul alle velden in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/custom-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (rememberMe) {
          localStorage.setItem("remembered_email", email.trim());
        } else {
          localStorage.removeItem("remembered_email");
        }
        window.location.href = "/";
      } else {
        setError(result.error || "Onjuist e-mailadres of wachtwoord");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign in error:", err);
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
        <h1 className="m-login-title">Welkom terug</h1>

        {/* Error */}
        {error && <div className="m-login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={onSubmit} autoComplete="on" noValidate>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voorbeeld@bedrijf.nl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="m-login-field">
            <div className="m-login-label">
              <span>Wachtwoord</span>
              <a href="/contact" className="m-login-forgot-inline">Wachtwoord vergeten?</a>
            </div>
            <div className="m-login-input-wrap">
              <Lock size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer je wachtwoord in"
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

          {/* Remember me */}
          <div className="m-login-remember">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Mij onthouden</label>
          </div>

          {/* Submit */}
          <button type="submit" className="m-login-submit" disabled={loading}>
            {loading ? (
              "Bezig met inloggen..."
            ) : (
              <>
                Inloggen
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="m-login-security">
            🔒 Uw gegevens worden veilig versleuteld
          </div>
        </form>
      </div>

      {/* Footer link outside card */}
      <div className="m-login-footer">
        Nog geen account? <a href="/account/signup">Start 14 dagen gratis</a>
      </div>

      {/* Page footer */}
      <div className="m-login-page-footer">
        © {new Date().getFullYear()} DutyGrid · Beveiligingsplanning Platform
      </div>
    </div>
  );
}
