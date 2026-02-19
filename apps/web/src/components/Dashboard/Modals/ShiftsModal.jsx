import { X, Calendar, MapPin } from "lucide-react";

export function ShiftsModal({ todayShifts, onClose, onEdit, groupedByDate = false, title = "Diensten Vandaag" }) {

  // Helper to standardise dates for comparison
  const getDayLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dStr = d.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dStr === todayStr) return "Vandaag";
    if (dStr === tomorrowStr) return "Morgen";

    // Format: "Za 12 feb"
    return d.toLocaleDateString("nl-NL", { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Group shifts by date
  const groupedShifts = groupedByDate
    ? todayShifts.reduce((acc, shift) => {
      const date = shift.shift_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(shift);
      return acc;
    }, {})
    : null;

  // Get sorted dates
  const sortedDates = groupedByDate
    ? Object.keys(groupedShifts).sort()
    : [];

  const renderShift = (shift) => (
    <div
      key={shift.id}
      onClick={() => onEdit && onEdit(shift)}
      className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer bg-white"
    >
      <div className="flex items-center justify-between mb-2">
        {shift.employee_name ? (
          <a
            href={`/employees/${shift.employee_id}`}
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {shift.employee_name}
          </a>
        ) : (
          <span className="font-bold text-red-600 italic">
            Open Dienst
          </span>
        )}
        <span className="text-sm font-semibold text-purple-700">
          {shift.start_time.slice(0, 5)} -{" "}
          {shift.end_time.slice(0, 5)}
        </span>
      </div>
      {shift.location_name && (
        <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
          <MapPin size={14} className="text-orange-600" />
          <span className="font-medium">{shift.location_name}</span>
          {shift.client_name && (
            <span className="text-gray-600">
              ({shift.client_name})
            </span>
          )}
        </p>
      )}
      {shift.notes && (
        <p className="text-sm text-gray-600 italic mt-2">
          💬 {shift.notes}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {todayShifts.length} {todayShifts.length === 1 ? 'dienst' : 'diensten'}
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
          {todayShifts.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Geen diensten gevonden
            </p>
          ) : (
            <div className="space-y-4">
              {groupedByDate ? (
                sortedDates.map(date => (
                  <div key={date}>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1 z-10">
                      {getDayLabel(date)}
                    </h4>
                    <div className="space-y-3 pl-2 border-l-2 border-purple-100">
                      {groupedShifts[date].map(renderShift)}
                    </div>
                  </div>
                ))
              ) : (
                todayShifts.map(renderShift)
              )}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <a
              href="/planning"
              className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-semibold"
            >
              Bekijk Volledige Planning →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
