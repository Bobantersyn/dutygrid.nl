"use client";

import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Uitloggen
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Weet je zeker dat je wilt uitloggen?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Uitloggen
        </button>
        <a
          href="/"
          className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900"
        >
          Terug naar dashboard
        </a>
      </div>
    </div>
  );
}
