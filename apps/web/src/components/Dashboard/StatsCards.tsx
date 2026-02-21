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

  const Card = ({
    label,
    value,
    icon: Icon,
    onClick,
    badge = null,
    highlightColor = "blue",
    isUrgent = false
  }: {
    label: string,
    value: any,
    icon: any,
    onClick: () => void,
    badge?: string | null,
    highlightColor?: string,
    isUrgent?: boolean
  }) => {
    const colors = {
      blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "hover:border-blue-300" },
      gray: { bg: "bg-gray-50", icon: "text-gray-400", border: "hover:border-gray-300" },
      red: { bg: "bg-red-50", icon: "text-red-600", border: "hover:border-red-300" }
    };

    const activeColor = isUrgent ? colors.red : colors.blue;

    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all text-left cursor-pointer group ${activeColor.border}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {value}
            </p>
            {badge && (
              <p className={`text-[10px] font-bold mt-1 uppercase ${isUrgent ? "text-red-600" : "text-blue-600"}`}>
                {badge}
              </p>
            )}
          </div>
          <div className={`${activeColor.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={activeColor.icon} size={24} />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className={`grid grid-cols-1 ${isPlannerOrAdmin ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto"} gap-6 mb-8`}
    >
      {isPlannerOrAdmin && (
        <>
          <Card
            label="Klanten"
            value={clients.length}
            icon={Building2}
            onClick={() => onCardClick("clients")}
          />

          <Card
            label="Opdrachten"
            value={activeAssignments.length}
            icon={MapPin}
            onClick={() => onCardClick("assignments")}
          />

          <Card
            label="Medewerkers"
            value={employees.length}
            icon={Users}
            onClick={() => onCardClick("employees")}
          />

          <Card
            label="Verlof"
            value={pendingLeaveRequests.length}
            icon={ClipboardList}
            onClick={() => onCardClick("leave-requests")}
            badge={pendingLeaveRequests.length > 0 ? "Nieuwe aanvragen" : null}
            isUrgent={pendingLeaveRequests.length > 0}
          />
        </>
      )}

      <Card
        label={isPlannerOrAdmin ? "Openstaand" : "Mijn Diensten"}
        value={isPlannerOrAdmin ? openShiftsWeek.length : todayShifts.length}
        icon={Calendar}
        onClick={() => onCardClick(isPlannerOrAdmin ? "open-shifts" : "shifts")}
        badge={isPlannerOrAdmin && nextOpenDate ? `Eerstvolgende: ${nextOpenDate}` : null}
        isUrgent={isPlannerOrAdmin && openShiftsWeek.length > 0}
      />
    </div>
  );
}
