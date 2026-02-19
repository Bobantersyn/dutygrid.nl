import { Plus, RefreshCw } from "lucide-react";

export function QuickActions({ isPlannerOrAdmin }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle Acties</h2>
      <div
        className={`grid grid-cols-1 ${isPlannerOrAdmin ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2 max-w-2xl mx-auto"} gap-4`}
      >
        {isPlannerOrAdmin && (
          <>
            <a
              href="/clients"
              className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <Plus className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nieuwe Klant</h3>
                <p className="text-sm text-gray-600">Voeg klant toe</p>
              </div>
            </a>

            <a
              href="/assignments"
              className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Plus className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nieuwe Opdracht</h3>
                <p className="text-sm text-gray-600">Voeg locatie toe</p>
              </div>
            </a>

            <a
              href="/employees/new"
              className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Nieuwe Medewerker
                </h3>
                <p className="text-sm text-gray-600">Voeg medewerker toe</p>
              </div>
            </a>

            <a
              href="/planning/new"
              className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Plus className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nieuwe Dienst</h3>
                <p className="text-sm text-gray-600">Plan dienst in</p>
              </div>
            </a>
          </>
        )}
      </div>

      {!isPlannerOrAdmin && (
        <div className="mt-4">
          <a
            href="/diensten-ruilen"
            className="flex items-center gap-4 p-4 border-2 border-cyan-300 bg-cyan-50 rounded-lg hover:border-cyan-500 hover:bg-cyan-100 transition-all group"
          >
            <div className="bg-cyan-100 p-3 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <RefreshCw className="text-cyan-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Diensten Ruilen</h3>
              <p className="text-sm text-gray-600">
                Bied je diensten aan of neem diensten over
              </p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
