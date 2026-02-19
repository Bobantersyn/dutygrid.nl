import { Calendar, Users, Building2, MapPin, ClipboardList } from "lucide-react";

export function StatsCards({
  isPlannerOrAdmin,
  clients,
  activeAssignments,
  employees,
  todayShifts = [],
  openShiftsWeek = [],
  pendingLeaveRequests = [],
  onCardClick,
}) {

  // Helper to format next open shift date
  const getNextOpenShiftLabel = () => {
    if (!openShiftsWeek || openShiftsWeek.length === 0) return null;
    const nextShift = openShiftsWeek[0];
    const date = new Date(nextShift.shift_date);
    return date.toLocaleDateString("nl-NL", { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const nextOpenDate = getNextOpenShiftLabel();

  return (
    <div
      className={`grid grid-cols-1 ${isPlannerOrAdmin ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto"} gap-6 mb-8`}
    >
      {isPlannerOrAdmin && (
        <>
          <button
            onClick={() => onCardClick("clients")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Klanten</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {clients.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="text-green-600" size={24} />
              </div>
            </div>
          </button>

          <button
            onClick={() => onCardClick("assignments")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Actieve Opdrachten
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activeAssignments.length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <MapPin className="text-orange-600" size={24} />
              </div>
            </div>
          </button>

          <button
            onClick={() => onCardClick("employees")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Beveiligingsmedewerkers
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {employees.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </button>

          <button
            onClick={() => onCardClick("leave-requests")}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left cursor-pointer ${pendingLeaveRequests.length > 0
              ? "hover:border-yellow-300 border-yellow-100"
              : "hover:border-gray-300"
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Verlofaanvragen
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className={`text-3xl font-bold ${pendingLeaveRequests.length > 0 ? "text-yellow-600" : "text-gray-900"}`}>
                    {pendingLeaveRequests.length}
                  </p>
                </div>
                {pendingLeaveRequests.length > 0 && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    Nieuwe aanvragen
                  </p>
                )}
              </div>
              <div className={`${pendingLeaveRequests.length > 0 ? "bg-yellow-100 float-animation" : "bg-gray-100"} p-3 rounded-lg`}>
                <ClipboardList className={pendingLeaveRequests.length > 0 ? "text-yellow-600" : "text-gray-600"} size={24} />
              </div>
            </div>
          </button>
        </>
      )}

      <button
        onClick={() => onCardClick(isPlannerOrAdmin ? "open-shifts" : "shifts")}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left cursor-pointer ${isPlannerOrAdmin && openShiftsWeek.length > 0
          ? "hover:border-red-300 border-red-100"
          : "hover:border-purple-300"
          }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              {isPlannerOrAdmin ? "Openstaand (7 dagen)" : "Mijn Diensten Vandaag"}
            </p>
            <div className="flex flex-col mt-2">
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${isPlannerOrAdmin && openShiftsWeek.length > 0 ? "text-red-600" : "text-gray-900"
                  }`}>
                  {isPlannerOrAdmin
                    ? openShiftsWeek.length
                    : todayShifts.length}
                </p>
              </div>
              {isPlannerOrAdmin && nextOpenDate && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Eerstvolgende: {nextOpenDate}
                </p>
              )}
            </div>
          </div>
          <div className={`${isPlannerOrAdmin && openShiftsWeek.length > 0 ? "bg-red-100" : "bg-purple-100"
            } p-3 rounded-lg`}>
            <Calendar className={
              isPlannerOrAdmin && openShiftsWeek.length > 0 ? "text-red-600" : "text-purple-600"
            } size={24} />
          </div>
        </div>
      </button>
    </div>
  );
}
