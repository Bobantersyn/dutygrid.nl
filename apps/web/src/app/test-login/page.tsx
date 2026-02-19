"use client";

import { useState } from "react";

export default function TestLoginPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/quick-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Belangrijk voor cookies!
                body: JSON.stringify({
                    email: 'admin@dutygrid.nl',
                    password: 'admin123',
                }),
            });

            const data = await response.json();

            setResult({
                status: response.status,
                ok: response.ok,
                data,
                cookies: document.cookie,
            });

            setLoading(false);
        } catch (error) {
            setResult({ error: error.message });
            setLoading(false);
        }
    };

    const checkSession = async () => {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include',
            });
            const data = await response.text();
            alert(`Session check:\nStatus: ${response.status}\nResponse: ${data}`);
        } catch (error) {
            alert(`Session check error: ${error.message}`);
        }
    };

    const goToDashboard = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🧪 Login Test Page</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Login API</h2>

                    <div className="space-y-4">
                        <button
                            onClick={testLogin}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                        >
                            {loading ? '⏳ Testing...' : '🔓 Test Login (admin@dutygrid.nl)'}
                        </button>

                        <button
                            onClick={checkSession}
                            className="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                            ✅ Check Session
                        </button>

                        <button
                            onClick={goToDashboard}
                            className="ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                        >
                            📊 Go to Dashboard
                        </button>
                    </div>

                    {result && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <div className="bg-gray-50 rounded p-4 border">
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Info</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Deze pagina test de /api/quick-login endpoint</li>
                        <li>• Credentials: admin@dutygrid.nl / admin123</li>
                        <li>• Check de console voor extra logs</li>
                        <li>• Cookies worden automatisch gezet via Set-Cookie header</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
