"use client";

import { useState } from "react";

export default function TestSetup() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-create-beveiliger", {
        method: "GET",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createBeveiliger = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-create-beveiliger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "jan@test.nl",
          password: "beveiliger123",
          employeeId: 4,
        }),
      });
      const data = await response.json();
      setResult(data);

      // Auto-check status after creation
      if (data.success) {
        setTimeout(() => checkAccount(), 500);
      }
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestShifts = async () => {
    setLoading(true);
    try {
      // Maak wat test shifts aan voor Jan (employee_id 4)
      const today = new Date();
      const shifts = [];

      for (let i = 0; i < 5; i++) {
        const shiftDate = new Date(today);
        shiftDate.setDate(today.getDate() + i);

        const response = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: 4,
            shift_date: shiftDate.toISOString().split("T")[0],
            start_time: "08:00",
            end_time: "16:00",
            break_minutes: 30,
            notes: `Test dienst ${i + 1}`,
            shift_type: "dag",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          shifts.push(data.shift);
        }
      }

      setResult({ success: true, shifts: shifts.length });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 Test & Debug Pagina
        </h1>

        <div className="space-y-6">
          {/* Step 1: Check/Create Account */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              STAP 1: Account Setup
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 mb-3">
                Eerst account aanmaken/resetten, dan status checken
              </p>
              <div className="flex gap-2">
                <button
                  onClick={createBeveiliger}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {loading ? "⏳ Bezig..." : "🔧 Reset Jan's Account"}
                </button>
                <button
                  onClick={checkAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {loading ? "⏳ Bezig..." : "👀 Check Status"}
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">
              👤 Login Credentials
            </h2>
            <div className="bg-white p-4 rounded border-2 border-green-300">
              <p className="text-sm mb-2">
                <strong>Email:</strong>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  jan@test.nl
                </code>
              </p>
              <p className="text-sm">
                <strong>Wachtwoord:</strong>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  beveiliger123
                </code>
              </p>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.error
                  ? "bg-red-50 border-red-300"
                  : result.exists === false
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-green-50 border-green-300"
              }`}
            >
              <h3 className="font-bold mb-3 text-lg">
                {result.error
                  ? "❌ Error"
                  : result.exists === false
                    ? "⚠️ Niet Gevonden"
                    : "✅ Database Status"}
              </h3>
              <pre className="text-xs overflow-auto bg-white p-3 rounded border border-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.exists && result.account && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-300">
                  <p className="text-sm font-semibold mb-1">Snel overzicht:</p>
                  <p className="text-xs">✓ User ID: {result.user?.id}</p>
                  <p className="text-xs">✓ Email: {result.user?.email}</p>
                  <p className="text-xs">
                    ✓ Provider: {result.account?.provider}
                  </p>
                  <p className="text-xs">
                    ✓ Has Password:{" "}
                    {result.account?.has_password ? "Ja ✅" : "Nee ❌"}
                  </p>
                  <p className="text-xs">
                    ✓ Role: {result.role?.role || "Geen rol"}
                  </p>
                  <p className="text-xs">
                    ✓ Employee ID: {result.role?.employee_id || "Geen"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <a
              href="/account/signin"
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-semibold"
            >
              → Test Login
            </a>
            <a
              href="/"
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-semibold"
            >
              → Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
