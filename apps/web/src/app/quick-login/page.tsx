"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function QuickLoginPage() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("admin@dutygrid.nl");
    const [password, setPassword] = useState("admin123");
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Vul alle velden in");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/quick-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Login mislukt');
                setLoading(false);
                return;
            }

            console.log('Login successful:', result);
            // Redirect to home
            window.location.href = '/';
        } catch (err) {
            console.error('Login error:', err);
            setError('Er is iets misgegaan. Probeer opnieuw.');
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
                <div className="mb-6 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Quick Login
                    </h1>
                    <p className="text-sm text-gray-600">Tijdelijke login voor development</p>
                    <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <p className="text-xs text-blue-700">
                            ⚡ Deze login bypass is tijdelijk terwijl we Auth.js fixen
                        </p>
                    </div>
                </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? "Bezig met inloggen..." : "Inloggen"}
                    </button>

                    <div className="text-center text-xs text-gray-500">
                        <p>Default credentials zijn al ingevuld</p>
                        <p className="mt-1">admin@dutygrid.nl / admin123</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
