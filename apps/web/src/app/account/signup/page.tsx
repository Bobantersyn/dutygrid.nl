"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("Vul alle velden in");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email: email.trim(),
        password,
        name: name.trim(),
        callbackUrl: "/setup-role",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        EmailCreateAccount: "Dit e-mailadres is al in gebruik",
      };

      setError(
        errorMessages[err.message] || "Er is iets misgegaan. Probeer opnieuw.",
      );
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
          Account Aanmaken
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Welkom bij het planningssysteem
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-gray-700"
              htmlFor="name"
            >
              Naam
            </label>
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je volledige naam"
                className="w-full bg-transparent text-base outline-none"
              />
            </div>
          </div>
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
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-base outline-none"
                placeholder="Kies een sterk wachtwoord"
              />
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
            {loading ? "Bezig met registreren..." : "Account Aanmaken"}
          </button>
          <p className="text-center text-sm text-gray-600">
            Al een account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Log hier in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
