import { ArrowLeft } from "lucide-react";

export function ErrorState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Medewerker niet gevonden
        </h2>
        <a
          href="/employees"
          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Terug naar Medewerkers
        </a>
      </div>
    </div>
  );
}
