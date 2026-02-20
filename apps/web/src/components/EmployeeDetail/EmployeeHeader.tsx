import { ArrowLeft, Edit2, Trash2, CalendarClock, User } from "lucide-react";

export function EmployeeHeader({
  displayName,
  employee,
  isEditing,
  onEdit,
  onCancel,
  onDelete,
  isDeleting,
}) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a
          href="/employees"
          className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Terug naar Medewerkers
        </a>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              {employee.profile_photo ? (
                <img
                  src={employee.profile_photo}
                  alt={displayName}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <User className="text-blue-600" size={32} />
                </div>
              )}
              {!employee.active && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  Inactief
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {displayName}
              </h1>
              {employee.job_title && (
                <p className="text-lg text-gray-600">{employee.job_title}</p>
              )}
              <p className="text-gray-500 text-sm">{employee.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <a
                  href="/beschikbaarheid"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <CalendarClock size={18} />
                  Beschikbaarheid
                </a>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Bewerken
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  {isDeleting ? "Verwijderen..." : "Verwijderen"}
                </button>
              </>
            ) : (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
