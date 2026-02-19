import { X, MapPin } from "lucide-react";

export function AssignmentsModal({ activeAssignments, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-orange-50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <MapPin className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Actieve Opdrachten
              </h3>
              <p className="text-sm text-gray-600">
                {activeAssignments.length} actief
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeAssignments.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Geen actieve opdrachten gevonden
            </p>
          ) : (
            <div className="space-y-3">
              {activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">
                    {assignment.location_name}
                  </h4>
                  {assignment.client_name && (
                    <p className="text-sm text-gray-600 mb-1">
                      🏢 {assignment.client_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-1">
                    📍 {assignment.location_address}
                  </p>
                  {assignment.hourly_rate && (
                    <p className="text-sm text-green-700 font-semibold">
                      €{assignment.hourly_rate}/uur
                    </p>
                  )}
                  {assignment.description && (
                    <p className="text-sm text-gray-600 italic mt-2">
                      {assignment.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <a
              href="/assignments"
              className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center font-semibold"
            >
              Bekijk Alle Opdrachten →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
