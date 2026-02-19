import { Calendar, Users, MapPin, ExternalLink } from "lucide-react";

export function TodayShifts({ isPlannerOrAdmin, todayShifts, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {isPlannerOrAdmin ? "Diensten Vandaag" : "Mijn Diensten Vandaag"}
      </h2>
      {todayShifts.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">Geen diensten ingepland voor vandaag</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayShifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => onEdit && onEdit(shift)}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-blue-600 group-hover:text-blue-700">
                    {shift.employee_name}
                  </div>
                  <p className="text-sm text-gray-600">
                    {shift.start_time.slice(0, 5)} -{" "}
                    {shift.end_time.slice(0, 5)}
                  </p>
                </div>
              </div>
              {shift.location_name && (
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg">
                  <MapPin size={16} className="text-orange-600" />
                  <span className="text-gray-900 font-medium">
                    {shift.location_name}
                  </span>
                  {shift.client_name && (
                    <span className="text-gray-600">({shift.client_name})</span>
                  )}
                </div>
              )}
              {shift.notes && (
                <p className="text-sm text-gray-600 italic">{shift.notes}</p>
              )}
              <ExternalLink
                size={16}
                className="text-gray-400 group-hover:text-blue-600 transition-colors"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
