"use client";

import { useState } from "react";

export default function DevLoginPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/quick-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@dutygrid.nl',
                    password: 'admin123',
                }),
            });

            const data = await response.json();
            setResult(data);

            if (response.ok && data.success) {
                // Wacht even en redirect
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        } catch (error) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🚀 Dev Login
                    </h1>
                    <p className="text-sm text-gray-600">
                        Klik op de knop om in te loggen als admin
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                            Login Credentials:
                        </p>
                        <p className="text-xs text-blue-700">
                            📧 Email: admin@dutygrid.nl<br />
                            🔑 Password: admin123
                        </p>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? '⏳ Bezig met inloggen...' : '🔓 Inloggen als Admin'}
                    </button>

                    {result && (
                        <div className={`rounded-lg border p-4 ${result.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                            <p className={`text-sm font-semibold ${result.success ? 'text-green-900' : 'text-red-900'
                                }`}>
                                {result.success ? '✅ Success!' : '❌ Error'}
                            </p>
                            <pre className={`text-xs mt-2 ${result.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                            {result.success && (
                                <p className="text-xs text-green-600 mt-2">
                                    Redirecting naar home...
                                </p>
                            )}
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-500 space-y-1">
                        <p>⚠️ Dit is een development login bypass</p>
                        <p>Alleen voor testing tijdens development</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
