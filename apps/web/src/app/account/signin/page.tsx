"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (e) => {
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
      // Call our custom login API
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
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200"
        autoComplete="on"
      >
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Welkom Terug
        </h1>
        <p className="text-center text-gray-600 mb-8">Log in op je account</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-gray-700"
              htmlFor="email"
            >
              E-mailadres
            </label>
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voorbeeld@bedrijf.nl"
                className="w-full bg-transparent text-base outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-gray-700"
              htmlFor="password"
            >
              Wachtwoord
            </label>
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 flex items-center gap-2">
              <input
                required
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none"
                placeholder="Voer je wachtwoord in"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={
                  showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Mij onthouden</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
          <p className="text-center text-sm text-gray-600">
            Nog geen account?{" "}
            <a
              href={`/account/signup${typeof window !== "undefined" ? window.location.search : ""
                }`}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Registreer je hier
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
