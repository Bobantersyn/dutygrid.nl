import { X, Users, Mail } from "lucide-react";

export function EmployeesModal({ employees, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Beveiligingsmedewerkers
              </h3>
              <p className="text-sm text-gray-600">{employees.length} totaal</p>
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
          {employees.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Geen medewerkers gevonden
            </p>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <a
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-blue-600 hover:text-blue-700 mb-1">
                        {employee.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        📋 CAO: {employee.cao_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        ⏰ Max: {employee.max_hours_per_week}u/week,{" "}
                        {employee.max_hours_per_day}u/dag
                      </p>
                      {employee.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Mail size={14} /> {employee.email}
                        </p>
                      )}
                    </div>
                    {!employee.active && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Inactief
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <a
              href="/employees"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
            >
              Bekijk Alle Medewerkers →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
