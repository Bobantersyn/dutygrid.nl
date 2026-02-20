import { Calendar } from "lucide-react";

export function ShiftsHistory({ shifts }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar size={24} />
        Diensten Geschiedenis
      </h2>
      {shifts.length === 0 ? (
        <p className="text-gray-500">Nog geen diensten gepland</p>
      ) : (
        <div className="space-y-2">
          {shifts.slice(0, 10).map((shift) => (
            <div
              key={shift.id}
              className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {shift.shift_date}
                </div>
                <div className="text-sm text-gray-600">
                  {shift.start_time} - {shift.end_time}
                </div>
              </div>
              {shift.travel_distance_km && (
                <div className="text-sm text-gray-600">
                  {shift.travel_distance_km} km - €
                  {shift.travel_costs?.toFixed(2)}
                </div>
              )}
            </div>
          ))}
          {shifts.length > 10 && (
            <p className="text-sm text-gray-500 text-center pt-2">
              En {shifts.length - 10} meer diensten...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
