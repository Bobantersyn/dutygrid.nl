"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react";

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

    console.log("Attempting sign in for:", email);

    try {
      const response = await fetch('/api/custom-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const result = await response.json();

      console.log("Sign in result:", result);

      if (response.ok && result.success) {
        console.log("Login successful, redirecting...");
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
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(180deg, rgba(11, 15, 26, 0.85) 0%, rgba(11, 15, 26, 0.92) 100%), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center border shadow-lg"
          style={{
            background: 'rgba(0, 71, 171, 0.2)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 71, 171, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 71, 171, 0.2)',
          }}
        >
          <div className="grid grid-cols-2 gap-1.5">
            <div className="w-5 h-5 rounded-md" style={{ background: '#0047AB' }}></div>
            <div className="w-5 h-5 rounded-md" style={{ background: '#0047AB' }}></div>
            <div className="w-5 h-5 rounded-md" style={{ background: '#0047AB' }}></div>
            <div className="w-5 h-5 rounded-md" style={{ background: '#0047AB' }}></div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">DutyGrid</h1>
        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Beveiligingsplanning</p>
      </div>

      {/* Login Card */}
      <form
        noValidate
        onSubmit={onSubmit}
        autoComplete="on"
        className="w-full max-w-sm rounded-3xl p-8 border"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(51, 65, 85, 0.5)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2 className="text-xl font-bold text-center mb-8 text-white">Welkom terug</h2>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }} htmlFor="email">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#64748b' }} />
              <input
                required
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: '#0D1117',
                  border: '1px solid #334155',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0047AB';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 71, 171, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold" style={{ color: '#cbd5e1' }} htmlFor="password">
                Wachtwoord
              </label>
              <a className="text-xs font-semibold transition-colors hover:opacity-80" style={{ color: '#0047AB' }} href="#">
                Wachtwoord vergeten?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#64748b' }} />
              <input
                required
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: '#0D1117',
                  border: '1px solid #334155',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0047AB';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 71, 171, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#64748b' }}
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 focus:ring-blue-700 focus:ring-offset-0"
              style={{ background: '#0D1117', accentColor: '#0047AB' }}
            />
            <label className="ml-2 block text-sm" style={{ color: '#94a3b8' }} htmlFor="remember">
              Onthoud mij
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            style={{
              background: '#0047AB',
              boxShadow: '0 10px 25px rgba(0, 71, 171, 0.3)',
            }}
            onMouseOver={(e) => { (e.target as HTMLElement).style.background = '#003d94'; }}
            onMouseOut={(e) => { (e.target as HTMLElement).style.background = '#0047AB'; }}
          >
            <span>{loading ? "Bezig met inloggen..." : "Inloggen"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Nog geen account?{" "}
            <a
              href={`/account/signup${typeof window !== "undefined" ? window.location.search : ""}`}
              className="font-bold transition-colors hover:opacity-80"
              style={{ color: '#0047AB' }}
            >
              Neem contact op
            </a>
          </p>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 flex items-center space-x-3 text-xs uppercase tracking-widest font-semibold" style={{ color: '#64748b' }}>
        <span>© 2024 DUTYGRID</span>
        <span>•</span>
        <span>V2.4.0</span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <Shield size={12} style={{ color: '#00C853' }} />
          <span>SECURE</span>
        </span>
      </div>
    </div>
  );
}
